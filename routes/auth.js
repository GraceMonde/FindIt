const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { db } = require('../utils/firebase');

const router = express.Router();

// Register route
router.post('/register', [
  body('comp').notEmpty().withMessage('Computer ID is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('school').notEmpty().withMessage('School is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comp, name, email, school, password } = req.body;

    // Check if user already exists
    const userSnapshot = await db.collection('users').where('comp', '==', comp).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'User with this computer ID already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      comp,
      name,
      email,
      school,
      password: hashedPassword,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      isDeleted: false,
      trackRecord: {
        itemsFound: 0,
        itemsLost: 0,
        itemsReturned: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    };

    const userRef = await db.collection('users').add(newUser);
    const userId = userRef.id;

    // Generate JWT
    const token = jwt.sign(
      { userId, comp, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        comp,
        name,
        email,
        school
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('comp').notEmpty().withMessage('Computer ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { comp, password } = req.body;

    // Find user
    const userSnapshot = await db.collection('users').where('comp', '==', comp).get();
    if (userSnapshot.empty) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userSnapshot.docs[0].data();
    const userId = userSnapshot.docs[0].id;

    // Check if user is deleted
    if (user.isDeleted) {
      return res.status(400).json({ message: 'Account has been deactivated' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await db.collection('users').doc(userId).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp()
    });

    // Generate JWT
    const token = jwt.sign(
      { userId, comp, role: user.role || 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        comp: user.comp,
        name: user.name,
        email: user.email,
        school: user.school,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const userRef = await db.collection('users').doc(req.user.userId).get();
    
    if (!userRef.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userRef.data();
    res.json({
      id: userRef.id,
      comp: user.comp,
      name: user.name,
      email: user.email,
      school: user.school,
      profileImageUrl: user.profileImageUrl || null,
      trackRecord: user.trackRecord
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;