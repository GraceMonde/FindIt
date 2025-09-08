const express = require('express');
const { db } = require('../utils/firebase');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('categories').get();
    const categories = [];
    
    snapshot.forEach(doc => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;