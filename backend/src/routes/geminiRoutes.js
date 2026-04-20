const express = require('express');
const router = express.Router();
const { chatWithGemini, testGeminiConnection } = require('../controllers/geminiController');

// @route   POST /api/gemini/chat
// @desc    Chat with Gemini AI
// @access  Public
router.post('/chat', chatWithGemini);

// @route   GET /api/gemini/test
// @desc    Test Gemini API connection
// @access  Public
router.get('/test', testGeminiConnection);

module.exports = router;
