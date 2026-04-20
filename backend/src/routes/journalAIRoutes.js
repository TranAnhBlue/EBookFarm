const express = require('express');
const router = express.Router();
const { 
    getJournalSuggestions, 
    getQuickSuggestions, 
    analyzeRisks 
} = require('../controllers/journalAIController');
const { protect } = require('../middlewares/authMiddleware');

// Tất cả routes đều cần authentication
router.use(protect);

// Lấy gợi ý AI cho trường đang nhập
router.post('/suggestions', getJournalSuggestions);

// Lấy gợi ý nhanh theo loại trường
router.post('/quick-suggestions', getQuickSuggestions);

// Phân tích rủi ro trong nhật ký
router.post('/analyze-risks', analyzeRisks);

module.exports = router;