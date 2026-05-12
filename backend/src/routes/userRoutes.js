const express = require('express');
const { 
  getUsers, 
  updateUserRoleStatus, 
  updateProfile, 
  createUser, 
  deleteUser, 
  bulkCreateUsers,
  verifyCertification,
  getPublicHtxList
} = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Custom middleware for Admin or HTX
const adminOrHtx = (req, res, next) => {
  if (req.user && (req.user.role?.toUpperCase() === 'ADMIN' || req.user.role?.toUpperCase() === 'HTX')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as Admin or HTX' });
  }
};

const router = express.Router();

router.post('/bulk', protect, admin, bulkCreateUsers);
router.get('/htx-list', protect, getPublicHtxList);

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/:userId/certifications/:certId/verify')
  .put(protect, adminOrHtx, verifyCertification);

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .put(protect, admin, updateUserRoleStatus)
  .delete(protect, admin, deleteUser);

module.exports = router;