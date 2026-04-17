const express = require('express');
const { 
  getDashboardStats, 
  getJournalStatusStats, 
  getActivityTimeline 
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Tất cả các route báo cáo đều cần đăng nhập
router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.get('/journal-status', getJournalStatusStats);
router.get('/activity-timeline', getActivityTimeline);

module.exports = router;
