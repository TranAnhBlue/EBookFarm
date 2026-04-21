const express = require('express');
const { createJournal, getJournals, getJournalByQr, getJournalById, updateJournal } = require('../controllers/journalController');
const { protect } = require('../middlewares/authMiddleware');
const { trackJournalChanges, trackJournalCreation, checkEditPermission } = require('../middlewares/journalHistoryMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, trackJournalCreation, createJournal)
  .get(protect, getJournals);

router.route('/qr/:qrCode').get(getJournalByQr);

router.route('/:id')
  .get(protect, getJournalById)
  .put(protect, checkEditPermission, trackJournalChanges, updateJournal);

module.exports = router;