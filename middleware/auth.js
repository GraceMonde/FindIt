const jwt = require('jsonwebtoken');
const { db } = require('../utils/firebase');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userRef = await db.collection('users').doc(decoded.userId).get();
    
    if (!userRef.exists) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    const user = userRef.data();
    
    // Check if user is deleted
    if (user.isDeleted) {
      return res.status(401).json({ message: 'Account has been deactivated' });
    }

    // Add user to request object
    req.user = {
      userId: decoded.userId,
      comp: decoded.comp,
      role: decoded.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin middleware
module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};