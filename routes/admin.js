const express = require('express');
const { db } = require('../utils/firebase');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    
    // Pagination
    const offset = (page - 1) * limit;
    const snapshot = await db.collection('users')
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .offset(offset)
      .limit(parseInt(limit))
      .get();
    
    const users = [];
    snapshot.forEach(doc => {
      const user = doc.data();
      users.push({
        id: doc.id,
        comp: user.comp,
        name: user.name,
        email: user.email,
        school: user.school,
        role: user.role || 'user',
        profileImageUrl: user.profileImageUrl || null,
        trackRecord: user.trackRecord,
        createdAt: user.createdAt.toDate(),
        lastLogin: user.lastLogin.toDate()
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deactivate user
router.put('/users/:id/deactivate', authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const userRef = await db.collection('users').doc(req.params.id);
    const user = await userRef.get();
    
    if (!user.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Soft delete user
    await userRef.update({
      isDeleted: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logs/reports
router.get('/logs', authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const { startDate, endDate, type, limit = 100 } = req.query;
    
    // Get items
    let itemsQuery = db.collection('items').where('isDeleted', '==', false);
    
    if (startDate) {
      itemsQuery = itemsQuery.where('createdAt', '>=', new Date(startDate));
    }
    
    if (endDate) {
      itemsQuery = itemsQuery.where('createdAt', '<=', new Date(endDate));
    }
    
    if (type) {
      itemsQuery = itemsQuery.where('type', '==', type);
    }
    
    const itemsSnapshot = await itemsQuery
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const items = [];
    itemsSnapshot.forEach(doc => {
      const item = doc.data();
      items.push({
        id: doc.id,
        title: item.title,
        type: item.type,
        status: item.status,
        categoryName: item.categoryName,
        locationName: item.locationName,
        userId: item.userId,
        userName: item.userName,
        createdAt: item.createdAt.toDate()
      });
    });
    
    // Get claims
    let claimsQuery = db.collection('claims').where('isDeleted', '==', false);
    
    if (startDate) {
      claimsQuery = claimsQuery.where('createdAt', '>=', new Date(startDate));
    }
    
    if (endDate) {
      claimsQuery = claimsQuery.where('createdAt', '<=', new Date(endDate));
    }
    
    const claimsSnapshot = await claimsQuery
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const claims = [];
    claimsSnapshot.forEach(doc => {
      const claim = doc.data();
      claims.push({
        id: doc.id,
        claimantId: claim.claimantId,
        claimantName: claim.claimantName,
        foundItemId: claim.foundItemId,
        status: claim.status,
        createdAt: claim.createdAt.toDate()
      });
    });
    
    // Get stats
    const stats = {
      totalItems: items.length,
      lostItems: items.filter(item => item.type === 'lost').length,
      foundItems: items.filter(item => item.type === 'found').length,
      returnedItems: items.filter(item => item.status === 'Returned').length,
      totalClaims: claims.length,
      approvedClaims: claims.filter(claim => claim.status === 'Approved').length,
      deniedClaims: claims.filter(claim => claim.status === 'Denied').length,
      pendingClaims: claims.filter(claim => claim.status === 'Pending').length
    };
    
    res.json({
      stats,
      items,
      claims
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;