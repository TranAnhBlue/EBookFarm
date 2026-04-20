const express = require('express');
const { chatWithGroq, testGroqConnection } = require('../controllers/groqController');

const router = express.Router();

// Chat with Groq AI
router.post('/chat', chatWithGroq);

// Test Groq connection
router.get('/test', testGroqConnection);

module.exports = router;