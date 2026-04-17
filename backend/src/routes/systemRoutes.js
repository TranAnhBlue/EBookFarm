const express = require('express');
const { exportDatabase, getSystemStats } = require('../controllers/systemController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Chỉ Admin mới được phép thực hiện các tác vụ hệ thống
router.use(protect, admin);

router.get('/backup', exportDatabase);
router.get('/stats', getSystemStats);

module.exports = router;
