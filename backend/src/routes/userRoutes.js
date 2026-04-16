const express = require('express');
const { getUsers, updateUserRoleStatus } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router.route('/:id')
  .put(protect, admin, updateUserRoleStatus)
  .delete(protect, admin, deleteUser);

module.exports = router;