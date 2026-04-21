const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getJournalHistory,
  getHistorySummary,
  compareVersions
} = require('../controllers/journalHistoryController');

// @route   GET /api/journals/:id/history
// @desc    Get history for a journal
// @access  Private (Owner, Admin, Technician)
router.get('/:id/history', protect, getJournalHistory);

// @route   GET /api/journals/:id/history/summary
// @desc    Get history summary
// @access  Private (Owner, Admin, Technician)
router.get('/:id/history/summary', protect, getHistorySummary);

// @route   GET /api/journals/:id/history/compare
// @desc    Compare two versions
// @access  Private (Owner, Admin, Technician)
router.get('/:id/history/compare', protect, compareVersions);

module.exports = router;
