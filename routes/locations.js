const express = require('express');
const { db } = require('../utils/firebase');

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('locations').get();
    const locations = [];
    
    snapshot.forEach(doc => {
      locations.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;