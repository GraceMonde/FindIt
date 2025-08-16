import express from 'express';
import {
  getAllFoundItems,
  getFoundItemById,
  createFoundItem,
  updateFoundItem,
  deleteFoundItem
} from '../controllers/foundItemController.js';
import { authenticateFirebaseToken } from '../../src/middleware/authMiddleware.js';

const router = express.Router();

// Public routes

router.get('/', getAllFoundItems);
router.get('/:id', getFoundItemById);

// Protected routes

router.post('/', authenticateFirebaseToken, createFoundItem);
router.put('/:id', authenticateFirebaseToken, updateFoundItem);
router.delete('/:id', authenticateFirebaseToken, deleteFoundItem);

export default router;
