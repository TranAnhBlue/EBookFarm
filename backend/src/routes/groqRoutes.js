const express = require('express');
const { chatWithGroq, testGroqConnection, analyzeStats } = require('../controllers/groqController');
const { checkChatPermission, logChatUsage } = require('../middlewares/chatPermissionMiddleware');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Chat with Groq AI (có kiểm tra quyền và log usage)
router.post('/chat', checkChatPermission, logChatUsage, chatWithGroq);

// Phân tích thống kê (Dành cho Admin/Quản lý)
router.post('/analyze-stats', protect, analyzeStats);

// Test Groq connection (không cần kiểm tra quyền)
router.get('/test', testGroqConnection);

module.exports = router;