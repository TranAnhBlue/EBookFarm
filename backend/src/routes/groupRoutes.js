const express = require('express');
const { getGroups, createGroup, updateGroup, deleteGroup } = require('../controllers/groupController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, admin, getGroups)
  .post(protect, admin, createGroup);

router.route('/:id')
  .put(protect, admin, updateGroup)
  .delete(protect, admin, deleteGroup);

module.exports = router;
