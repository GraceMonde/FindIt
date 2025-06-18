const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

//public r
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

//protected because user needs to be authenticated first
router.post('/logout', authController.logoutUser);
router.get('/profile', authController.getUserProfile);
router.put('/profile', authController.updateUserProfile);

module.exports = router;