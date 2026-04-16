const express = require('express');
const { getUsers, updateUserRoleStatus, updateProfile, createUser, deleteUser } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/profile')
  .put(protect, updateProfile);

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .put(protect, admin, updateUserRoleStatus)
  .delete(protect, admin, deleteUser);

module.exports = router;