const express = require('express');
const router = express.Router();
const supplyController = require('../controllers/supplyController');
const { protect, htxOrAdmin } = require('../middlewares/authMiddleware');

// Route cho nông dân tạo và xem yêu cầu
router.post('/', protect, supplyController.createRequest);
router.get('/', protect, supplyController.getRequests);
router.delete('/:id', protect, supplyController.cancelRequest);

// Route cho HTX phê duyệt yêu cầu
router.put('/:id/status', protect, htxOrAdmin, supplyController.updateRequestStatus);

module.exports = router;
