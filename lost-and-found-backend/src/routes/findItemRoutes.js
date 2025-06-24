const express = require('express');
const router = express.Router();
const foundItemController = require('../controllers/foundItenController');
const { authenticateToken } = require('../middleware/authMiddleware');

//public routes
router.get('/', foundItemController.getAllFoundItems);
router.get('/:id', foundItemController.getFoundItemById);

//protected routes
router.post('/', authenticateToken, foundItemController.createFoundItem);
router.put('/:id', authenticateToken, foundItemController.updateFoundItem);
router.delete('/:id', authenticateToken, foundItemController.deleteFoundItem);

module.exports = router;