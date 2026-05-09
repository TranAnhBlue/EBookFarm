const express = require('express');
const { getNews, getNewsById, createNews, updateNews, deleteNews } = require('../controllers/newsController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getNews)
  .post(protect, admin, createNews);

router.route('/:id')
  .get(getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews);

module.exports = router;
