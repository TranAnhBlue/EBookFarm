const express = require('express');
const router = express.Router();
const { ragChatWithGroq, testRAGSystem, updateRAGData } = require('../controllers/ragController');
const { checkChatPermission, logChatUsage } = require('../middlewares/chatPermissionMiddleware');

// RAG Chat endpoint với permission checking
router.post('/chat', checkChatPermission, logChatUsage, ragChatWithGroq);

// Test RAG system
router.get('/test', testRAGSystem);

// Update RAG data manually
router.post('/update', updateRAGData);

module.exports = router;