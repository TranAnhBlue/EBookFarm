const express = require('express');
const { chatWithOpenAI, testOpenAIConnection } = require('../controllers/openaiController');

const router = express.Router();

// Chat with OpenAI GPT
router.post('/chat', chatWithOpenAI);

// Test OpenAI connection
router.get('/test', testOpenAIConnection);

module.exports = router;