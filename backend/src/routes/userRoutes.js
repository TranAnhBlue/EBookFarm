const express = require('express');
const userController = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { isAdminRole, isHtxRole } = require('../utils/roles');

// Custom middleware for Admin or HTX
const adminOrHtx = (req, res, next) => {
  if (req.user && (isAdminRole(req.user.role) || isHtxRole(req.user.role))) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as Admin or HTX' });
  }
};

const router = express.Router();

router.post('/bulk', protect, admin, userController.bulkCreateUsers);
router.get('/htx-list', protect, userController.getPublicHtxList);

router.route('/profile')
  .get(protect, userController.getProfile)
  .put(protect, userController.updateProfile);

router.put('/profile/phone', protect, userController.changeProfilePhone);

router.route('/:userId/certifications/:certId/verify')
  .put(protect, adminOrHtx, userController.verifyCertification);

router.route('/')
  .get(protect, admin, userController.getUsers)
  .post(protect, admin, userController.createUser);

router.route('/:id')
  .put(protect, admin, userController.updateUserRoleStatus)
  .delete(protect, admin, userController.deleteUser);

module.exports = router;
