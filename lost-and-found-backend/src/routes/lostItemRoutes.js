// routes/lostItemRoutes.js
import express from 'express';
import * as lostItemController from '../../src/controllers/lostItemController.js';
import { authenticateFirebaseToken } from '../../src/middleware/authMiddleware.js';

const router = express.Router();

// Public Routes

router.get('/', lostItemController.getAllLostItems);
router.get('/:id', lostItemController.getLostItemById);

// Protected Routes (Require Auth)

router.post('/', authenticateFirebaseToken, lostItemController.createLostItem);
router.put('/:id', authenticateFirebaseToken, lostItemController.updateLostItem);
router.delete('/:id', authenticateFirebaseToken, lostItemController.deleteLostItem);

export default router;
