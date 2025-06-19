const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

//public r
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

//protected because user needs to be authenticated first
router.post('/logout', authenticateToken, authController.logoutUser);
router.get('/profile', authenticateToken, authController.getUserProfile);
router.put('/profile', authenticateToken, authController.updateUserProfile);

module.exports = router;