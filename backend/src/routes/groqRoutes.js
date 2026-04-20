const express = require('express');
const { chatWithGroq, testGroqConnection } = require('../controllers/groqController');
const { checkChatPermission, logChatUsage } = require('../middlewares/chatPermissionMiddleware');

const router = express.Router();

// Chat with Groq AI (có kiểm tra quyền và log usage)
router.post('/chat', checkChatPermission, logChatUsage, chatWithGroq);

// Test Groq connection (không cần kiểm tra quyền)
router.get('/test', testGroqConnection);

module.exports = router;