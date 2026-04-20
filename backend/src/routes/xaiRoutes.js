const express = require('express');
const { chatWithXAI, testXAIConnection } = require('../controllers/xaiController');

const router = express.Router();

// Chat with xAI Grok
router.post('/chat', chatWithXAI);

// Test xAI connection
router.get('/test', testXAIConnection);

module.exports = router;