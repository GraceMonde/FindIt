// routes/authRoutes.js
import express from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/authController.js';

import { authenticateFirebaseToken } from '../../src/middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require valid Firebase token)
router.post('/logout', authenticateFirebaseToken, logoutUser);
router.get('/profile', authenticateFirebaseToken, getUserProfile);
router.put('/profile', authenticateFirebaseToken, updateUserProfile);

export default router;
