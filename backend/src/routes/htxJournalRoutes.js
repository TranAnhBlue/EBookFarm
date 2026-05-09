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
  authorizeBrand
} = require('../controllers/htxJournalController');
const { protect, admin, htx } = require('../middlewares/authMiddleware');

// Middleware to check if user is HTX or Admin
const htxOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role?.toUpperCase() === 'HTX' || req.user.role?.toUpperCase() === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as HTX or Admin' });
  }
};

router.route('/')
  .post(protect, htxOrAdmin, createHtxJournal)
  .get(protect, htxOrAdmin, getHtxJournals);

router.route('/farmers')
  .get(protect, htxOrAdmin, getFarmersForHtx);

router.route('/my-journals')
  .get(protect, getMyHtxJournals); // Any authenticated user (Farmers) can call this

router.route('/:id/farmers')
  .post(protect, htxOrAdmin, addFarmersToJournal);

router.route('/:id/farmers/:farmerId/status')
  .put(protect, htxOrAdmin, updateFarmerStatus);

router.route('/:id/summary')
  .get(protect, htxOrAdmin, getHtxJournalSummary);

router.route('/authorize-brand/:id')
  .put(protect, htxOrAdmin, authorizeBrand);

module.exports = router;
