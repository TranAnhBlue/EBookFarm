const express = require('express');
const router = express.Router();
const { getTCVNs } = require('../controllers/tcvnController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getTCVNs);

module.exports = router;
