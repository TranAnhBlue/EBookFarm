const express = require('express');
const { getChatStats, getMyChatInfo } = require('../controllers/chatStatsController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Lấy thống kê chat (chỉ admin)
router.get('/stats', (req, res, next) => {
    console.log('🎯 /stats route hit - Headers:', {
        authorization: req.headers.authorization ? 'Present' : 'Missing',
        authLength: req.headers.authorization?.length
    });
    next();
}, protect, (req, res, next) => {
    console.log('🔐 After protect middleware - User:', {
        exists: !!req.user,
        role: req.user?.role,
        username: req.user?.username
    });
    next();
}, admin, (req, res, next) => {
    console.log('👑 After admin middleware - Success!');
    next();
}, getChatStats);

// Route test admin (để debug)
router.get('/test-admin', protect, (req, res) => {
    console.log('🧪 Test admin route - User:', {
        exists: !!req.user,
        role: req.user?.role,
        id: req.user?._id
    });
    
    if (req.user?.role === 'Admin') {
        res.json({
            success: true,
            message: 'Admin access confirmed!',
            user: {
                username: req.user.username,
                role: req.user.role
            }
        });
    } else {
        res.status(403).json({
            success: false,
            message: 'Not admin',
            userRole: req.user?.role
        });
    }
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