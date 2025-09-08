const express = require('express');
const { body, validationResult } = require('express-validator');
const { db, bucket } = require('../utils/firebase');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all items with optional filters
router.get('/', async (req, res) => {
  try {
    const { q, type, categoryId, locationId, status, limit = 20, page = 1 } = req.query;
    
    let itemsRef = db.collection('items').where('isDeleted', '==', false);
    
    // Apply filters
    if (type) itemsRef = itemsRef.where('type', '==', type);
    if (categoryId) itemsRef = itemsRef.where('categoryId', '==', categoryId);
    if (locationId) itemsRef = itemsRef.where('locationId', '==', locationId);
    if (status) itemsRef = itemsRef.where('status', '==', status);
    
    // Text search using searchKeywords array
    if (q) {
      const searchTerms = q.toLowerCase().split(' ');
      for (const term of searchTerms) {
        itemsRef = itemsRef.where('searchKeywords', 'array-contains', term);
      }
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    const snapshot = await itemsRef
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(parseInt(limit))
      .get();
    
    const items = [];
    snapshot.forEach(doc => {
      const item = doc.data();
      items.push({
        id: doc.id,
        ...item,
        createdAt: item.createdAt.toDate(),
        updatedAt: item.updatedAt.toDate(),
        dateFound: item.dateFound ? item.dateFound.toDate() : null,
        dateLastSeen: item.dateLastSeen ? item.dateLastSeen.toDate() : null
      });
    });
    
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item
router.get('/:id', async (req, res) => {
  try {
    const itemRef = await db.collection('items').doc(req.params.id).get();
    
    if (!itemRef.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const item = itemRef.data();
    
    res.json({
      id: itemRef.id,
      ...item,
      createdAt: item.createdAt.toDate(),
      updatedAt: item.updatedAt.toDate(),
      dateFound: item.dateFound ? item.dateFound.toDate() : null,
      dateLastSeen: item.dateLastSeen ? item.dateLastSeen.toDate() : null
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item
router.post('/', authMiddleware, upload.array('images', 3), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['lost', 'found']).withMessage('Type must be either lost or found'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('locationId').notEmpty().withMessage('Location is required'),
  body('dateFound').if(body('type').equals('found')).notEmpty().withMessage('Date found is required for found items'),
  body('dateLastSeen').if(body('type').equals('lost')).notEmpty().withMessage('Date last seen is required for lost items'),
  body('securityQuestions').isArray().withMessage('Security questions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      categoryId,
      locationId,
      dateFound,
      dateLastSeen,
      additionalContactInfo,
      securityQuestions,
      searchKeywords
    } = req.body;

    // Get category and location details
    const categoryRef = await db.collection('categories').doc(categoryId).get();
    const locationRef = await db.collection('locations').doc(locationId).get();
    
    if (!categoryRef.exists || !locationRef.exists) {
      return res.status(400).json({ message: 'Invalid category or location' });
    }
    
    const categoryName = categoryRef.data().categoryName;
    const locationName = locationRef.data().locationName;

    // Process security questions
    const processedSecurityQuestions = {};
    if (Array.isArray(securityQuestions) && securityQuestions.length === 3) {
      for (let i = 0; i < 3; i++) {
        const question = securityQuestions[i];
        if (question && question.question && question.answer) {
          // Hash the answer for security
          const answerHash = crypto.createHash('sha256').update(question.answer).digest('hex');
          processedSecurityQuestions[`question${i+1}`] = question.question;
          processedSecurityQuestions[`answer${i+1}`] = answerHash;
        }
      }
    }

    // Process images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filename = `${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;
        const fileUpload = bucket.file(filename);
        
        await fileUpload.save(file.buffer, {
          metadata: { contentType: file.mimetype }
        });
        
        const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        imageUrls.push(imageUrl);
      }
    }

    // Create search keywords if not provided
    const keywords = searchKeywords || [
      ...title.toLowerCase().split(' '),
      ...description.toLowerCase().split(' '),
      categoryName.toLowerCase(),
      locationName.toLowerCase()
    ];

    // Create item
    const newItem = {
      title,
      description,
      type,
      status: 'Open',
      categoryId,
      categoryName,
      locationId,
      locationName,
      dateFound: type === 'found' ? new Date(dateFound) : null,
      dateLastSeen: type === 'lost' ? new Date(dateLastSeen) : null,
      userId: req.user.userId,
      userName: req.user.name, // Denormalize for easier reading
      additionalContactInfo: additionalContactInfo || '',
      securityQuestions: processedSecurityQuestions,
      searchKeywords: keywords,
      images: imageUrls,
      isDeleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const itemRef = await db.collection('items').add(newItem);
    const itemId = itemRef.id;

    res.status(201).json({
      message: 'Item created successfully',
      item: {
        id: itemId,
        ...newItem,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const itemRef = await db.collection('items').doc(req.params.id);
    const item = await itemRef.get();
    
    if (!item.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const itemData = item.data();
    
    // Check if user is owner or admin
    if (itemData.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update item
    const updatedData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Remove fields that shouldn't be updated directly
    delete updatedData.userId;
    delete updatedData.createdAt;
    
    await itemRef.update(updatedData);
    
    res.json({
      message: 'Item updated successfully',
      item: {
        id: itemRef.id,
        ...itemData,
        ...updatedData
      }
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Soft delete item
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const itemRef = await db.collection('items').doc(req.params.id);
    const item = await itemRef.get();
    
    if (!item.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const itemData = item.data();
    
    // Check if user is owner or admin
    if (itemData.userId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Soft delete
    await itemRef.update({
      isDeleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;