const express = require('express');
const { getItems, createItem, updateItem, deleteItem, processTransaction } = require('../controllers/inventoryController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, getItems).post(protect, admin, createItem);
router.route('/:id').put(protect, admin, updateItem).delete(protect, admin, deleteItem);
router.route('/transaction').post(protect, processTransaction);

module.exports = router;