const express = require('express');
const router = express.Router();
const { 
  createHtxJournal, 
  getHtxJournals, 
  addFarmersToJournal, 
  updateFarmerStatus, 
  getMyHtxJournals,
  getFarmersForHtx,
  getHtxJournalSummary,
  authorizeBrand,
  removeFarmerFromHtx,
  getPendingJournalApprovals,
  reviewFarmJournalApproval
} = require('../controllers/htxJournalController');
const { protect, admin, htx, htxOrAdmin } = require('../middlewares/authMiddleware');



router.route('/')
  .post(protect, htxOrAdmin, createHtxJournal)
  .get(protect, htxOrAdmin, getHtxJournals);

router.route('/farmers')
  .get(protect, htxOrAdmin, getFarmersForHtx);

router.route('/farmers/:farmerId')
  .delete(protect, htxOrAdmin, removeFarmerFromHtx);

router.route('/my-journals')
  .get(protect, getMyHtxJournals); // Any authenticated user (Farmers) can call this

router.route('/approvals/pending')
  .get(protect, htxOrAdmin, getPendingJournalApprovals);

router.route('/approvals/:farmJournalId/status')
  .put(protect, htxOrAdmin, reviewFarmJournalApproval);

router.route('/:id/farmers')
  .post(protect, htxOrAdmin, addFarmersToJournal);

router.route('/:id/farmers/:farmerId/status')
  .put(protect, htxOrAdmin, updateFarmerStatus);

router.route('/:id/summary')
  .get(protect, htxOrAdmin, getHtxJournalSummary);

router.route('/authorize-brand/:id')
  .put(protect, htxOrAdmin, authorizeBrand);

module.exports = router;
