const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../utils/firebase');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Create a new claim
router.post('/', authMiddleware, [
  body('foundItemId').notEmpty().withMessage('Found item ID is required'),
  body('securityAnswers').isArray().withMessage('Security answers must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { foundItemId, securityAnswers, message } = req.body;
    
    // Get the item
    const itemRef = await db.collection('items').doc(foundItemId);
    const item = await itemRef.get();
    
    if (!item.exists) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    const itemData = item.data();
    
    // Check if item is found and open
    if (itemData.type !== 'found' || itemData.status !== 'Open') {
      return res.status(400).json({ message: 'This item cannot be claimed' });
    }
    
    // Check if user is trying to claim their own item
    if (itemData.userId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot claim your own item' });
    }
    
    // Check if user already has a pending claim for this item
    const existingClaimSnapshot = await db.collection('claims')
      .where('foundItemId', '==', foundItemId)
      .where('claimantId', '==', req.user.userId)
      .where('status', '==', 'Pending')
      .get();
    
    if (!existingClaimSnapshot.empty) {
      return res.status(400).json({ message: 'You already have a pending claim for this item' });
    }
    
    // Process security answers
    const processedAnswers = {};
    if (Array.isArray(securityAnswers) && securityAnswers.length === 3) {
      for (let i = 0; i < 3; i++) {
        const answer = securityAnswers[i];
        if (answer !== undefined && answer !== null) {
          // Hash the answer for security
          const answerHash = crypto.createHash('sha256').update(answer.toString()).digest('hex');
          processedAnswers[`answer${i+1}`] = answerHash;
        }
      }
    }
    
    // Get user details
    const userRef = await db.collection('users').doc(req.user.userId);
    const user = await userRef.get();
    const userData = user.data();
    
    // Get finder details
    const finderRef = await db.collection('users').doc(itemData.userId);
    const finder = await finderRef.get();
    const finderData = finder.data();
    
    // Create claim
    const newClaim = {
      claimantId: req.user.userId,
      claimantName: userData.name,
      foundItemId,
      finderId: itemData.userId,
      finderName: itemData.userName,
      securityAnswers: processedAnswers,
      message: message || '',
      status: 'Pending',
      isDeleted: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const claimRef = await db.collection('claims').add(newClaim);
    const claimId = claimRef.id;
    
    // Update item status to Claimed
    await itemRef.update({
      status: 'Claimed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: {
        id: claimId,
        ...newClaim,
        createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all claims (admin only)
router.get('/', authMiddleware, require('../middleware/auth').isAdmin, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    
    let claimsRef = db.collection('claims').where('isDeleted', '==', false);
    
    if (status) {
      claimsRef = claimsRef.where('status', '==', status);
    }
    
    // Pagination
    const offset = (page - 1) * limit;
    const snapshot = await claimsRef
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(parseInt(limit))
      .get();
    
    const claims = [];
    for (const doc of snapshot.docs) {
      const claim = doc.data();
      
      // Get item details
      const itemRef = await db.collection('items').doc(claim.foundItemId).get();
      const itemData = itemRef.exists ? itemRef.data() : null;
      
      claims.push({
        id: doc.id,
        ...claim,
        createdAt: claim.createdAt.toDate(),
        item: itemData ? {
          id: itemRef.id,
          title: itemData.title,
          type: itemData.type,
          images: itemData.images
        } : null
      });
    }
    
    res.json(claims);
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or deny a claim (admin only)
router.put('/:id', authMiddleware, require('../middleware/auth').isAdmin, [
  body('status').isIn(['Approved', 'Denied']).withMessage('Status must be Approved or Denied'),
  body('adminComment').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminComment } = req.body;
    
    const claimRef = await db.collection('claims').doc(req.params.id);
    const claim = await claimRef.get();
    
    if (!claim.exists) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    const claimData = claim.data();
    
    // Check if claim is still pending
    if (claimData.status !== 'Pending') {
      return res.status(400).json({ message: 'This claim has already been processed' });
    }
    
    // Get item details
    const itemRef = await db.collection('items').doc(claimData.foundItemId);
    const item = await itemRef.get();
    const itemData = item.data();
    
    // Get user details
    const claimantRef = await db.collection('users').doc(claimData.claimantId);
    const claimant = await claimantRef.get();
    const claimantData = claimant.data();
    
    const finderRef = await db.collection('users').doc(claimData.finderId);
    const finder = await finderRef.get();
    const finderData = finder.data();
    
    // Update claim
    await claimRef.update({
      status,
      adminComment: adminComment || '',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update item status and track records if approved
    if (status === 'Approved') {
      // Update item status
      await itemRef.update({
        status: 'Returned',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update claimant's track record
      await claimantRef.update({
        'trackRecord.itemsFound': admin.firestore.FieldValue.increment(1),
        'trackRecord.itemsReturned': admin.firestore.FieldValue.increment(1),
        'trackRecord.updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update finder's track record
      await finderRef.update({
        'trackRecord.itemsLost': admin.firestore.FieldValue.increment(1),
        'trackRecord.itemsReturned': admin.firestore.FieldValue.increment(1),
        'trackRecord.updatedAt': admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // If denied, set item status back to Open
      await itemRef.update({
        status: 'Open',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    res.json({
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: {
        id: claimRef.id,
        ...claimData,
        status,
        adminComment: adminComment || '',
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;