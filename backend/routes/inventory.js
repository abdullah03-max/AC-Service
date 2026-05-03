// inventory routes
const express = require('express');
const router = express.Router();
const {
  getInventory, getInventoryItem, createInventoryItem, updateInventoryItem, restockItem, deleteInventoryItem
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'technician'), getInventory);
router.get('/:id', protect, authorize('admin'), getInventoryItem);
router.post('/', protect, authorize('admin'), createInventoryItem);
router.put('/:id', protect, authorize('admin'), updateInventoryItem);
router.put('/:id/restock', protect, authorize('admin'), restockItem);
router.delete('/:id', protect, authorize('admin'), deleteInventoryItem);

module.exports = router;
