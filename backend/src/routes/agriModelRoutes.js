const express = require('express');
const { getTree, createNode, updateNode, deleteNode } = require('../controllers/agriModelController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getTree)
  .post(protect, admin, createNode);

router.route('/:id')
  .put(protect, admin, updateNode)
  .delete(protect, admin, deleteNode);

module.exports = router;
