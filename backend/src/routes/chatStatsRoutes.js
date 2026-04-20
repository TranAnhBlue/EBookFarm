const express = require('express');
const { getChatStats, getMyChatInfo } = require('../controllers/chatStatsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy thống kê chat (chỉ admin)
router.get('/stats', protect, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Chỉ admin mới có quyền xem thống kê'
        });
    }
    getChatStats(req, res);
});

// Lấy thông tin chat của user hiện tại (không bắt buộc đăng nhập)
router.get('/my-info', (req, res) => {
    // Thử authenticate, nhưng không bắt buộc
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token && token !== 'null' && token !== 'undefined') {
        // Authenticate và gọi getMyChatInfo
        protect(req, res, () => {
            getMyChatInfo(req, res);
        });
    } else {
        // Không có token, gọi trực tiếp
        getMyChatInfo(req, res);
    }
});

module.exports = router;