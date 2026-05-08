const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getInventory,
  addItem,
  distributeItem,
  getTransactions
} = require('../controllers/inventoryController');

router.use(protect);

router.get('/', getInventory);
router.post('/add', addItem);
router.post('/distribute', distributeItem);
router.get('/transactions', getTransactions);

module.exports = router;