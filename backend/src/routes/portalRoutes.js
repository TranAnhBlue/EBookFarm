const express = require('express');
const {
  savePortalCredentials, verifyPortalConnection,
  getPortalStatus, getSyncHistory
} = require('../controllers/portalController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Cấu hình thông tin API cổng quốc gia
router.get('/status', protect, getPortalStatus);
router.post('/credentials', protect, savePortalCredentials);
router.post('/verify', protect, verifyPortalConnection);

// Lịch sử đồng bộ
router.get('/sync-history', protect, getSyncHistory);

module.exports = router;
