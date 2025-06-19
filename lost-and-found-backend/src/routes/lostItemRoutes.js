const express = require('express');
const router = express.Router();

const lostItemController = require('../controllers/lostItemController');
const { authenticateToken } = require('../middleware/authMiddleware');

//public routes
router.get('/', lostItemController.getAllLostItems); //lists all items
router.get('/:id', lostItemController.getLostItemById); //getting one item

//protected routes
router.post('/', authenticateToken, lostItemController.createLostItem); //post item
router.put('/:id', authenticateToken, lostItemController.updateLostItem); //update item
router.delete('/:id', authenticateToken, lostItemController.deleteLostItem); //delete item

module.exports = router;
