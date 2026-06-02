const express = require('express');
const {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getSummary,
  getMyLinkedRecords,
  createFarmerSubmission,
  listMyFarmerSubmissions,
  processDistributionFinanceRequest,
} = require('../controllers/htxManagementController');
const { protect, htxOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/farmer/assignments', protect, getMyLinkedRecords);
router.get('/farmer/submissions', protect, listMyFarmerSubmissions);
router.post('/farmer/:module', protect, createFarmerSubmission);

router.use(protect, htxOrAdmin);

router.get('/summary', getSummary);

router.route('/:module')
  .get(listRecords)
  .post(createRecord);

router.post('/distribution-finance-requests/:id/process', processDistributionFinanceRequest);

router.route('/:module/:id')
  .get(getRecord)
  .put(updateRecord)
  .delete(deleteRecord);

module.exports = router;
