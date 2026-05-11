const express = require('express');
const {
  createBatch, getBatches, getBatchById, getBatchByTraceId,
  syncBatchToNationalPortal, getBatchSyncHistory
} = require('../controllers/batchController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public: tra cứu theo traceId (quét QR - không cần đăng nhập)
router.get('/trace/:traceId', getBatchByTraceId);

// Private: quản lý lô hàng
router.route('/')
  .get(protect, getBatches)
  .post(protect, createBatch);

router.route('/:id')
  .get(protect, getBatchById);

// Đồng bộ lô lên cổng quốc gia
router.post('/:id/sync-portal', protect, syncBatchToNationalPortal);

// Lịch sử đồng bộ của lô
router.get('/:id/sync-history', protect, getBatchSyncHistory);

module.exports = router;
