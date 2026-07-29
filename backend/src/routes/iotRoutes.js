const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');
const { protect } = require('../middlewares/authMiddleware');

// Public or Protected routes for IoT & GIS Data
router.get('/telemetry', iotController.getTelemetry);
router.get('/gis-data', iotController.getGisData);
router.post('/trigger-alert', protect, iotController.triggerAlert);

module.exports = router;
