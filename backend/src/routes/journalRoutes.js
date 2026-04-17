const express = require('express');
const { createJournal, getJournals, getJournalByQr, getJournalById, updateJournal } = require('../controllers/journalController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createJournal).get(protect, getJournals);
router.route('/qr/:qrCode').get(getJournalByQr);
router.route('/:id').get(protect, getJournalById).put(protect, updateJournal);

module.exports = router;