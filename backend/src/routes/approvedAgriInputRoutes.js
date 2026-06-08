const express = require('express');
const {
  listApprovedAgriInputs,
  saveApprovedAgriInput,
  deleteApprovedAgriInput,
  importApprovedAgriInputs,
  importOfficialPpdPdf,
  validateApprovedAgriInput,
} = require('../controllers/approvedAgriInputController');
const { protect, htxOrAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect, htxOrAdmin);

router.get('/', listApprovedAgriInputs);
router.post('/', saveApprovedAgriInput);
router.post('/import', importApprovedAgriInputs);
router.post('/import-official-ppd-pdf', importOfficialPpdPdf);
router.post('/validate', validateApprovedAgriInput);
router.put('/:id', saveApprovedAgriInput);
router.delete('/:id', deleteApprovedAgriInput);

module.exports = router;
