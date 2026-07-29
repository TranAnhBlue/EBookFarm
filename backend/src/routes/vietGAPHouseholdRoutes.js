/**
 * Routes: Quản lý danh sách hộ sản xuất VietGAP
 */

const express = require('express');
const router = express.Router();
const {
  getHouseholds,
  getHouseholdsForDropdown,
  createHousehold,
  updateHousehold,
  deleteHousehold,
  getHouseholdById,
  importHouseholds
} = require('../controllers/vietGAPHouseholdController');
const { protect } = require('../middlewares/authMiddleware');

// Public routes - none

// Protected routes
router.use(protect);

router.route('/')
  .get(getHouseholds)
  .post(createHousehold);

router.get('/dropdown', getHouseholdsForDropdown);
router.post('/import', importHouseholds);

router.route('/:id')
  .get(getHouseholdById)
  .put(updateHousehold)
  .delete(deleteHousehold);

module.exports = router;
