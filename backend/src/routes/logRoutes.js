const express = require('express');
const { getLogs } = require('../controllers/logController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/').get(protect, admin, getLogs);

module.exports = router;
