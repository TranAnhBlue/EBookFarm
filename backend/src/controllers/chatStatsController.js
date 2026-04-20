const ChatUsage = require('../models/ChatUsage');
const { CHAT_LIMITS } = require('../middlewares/chatPermissionMiddleware');

// Lấy thống kê chat cho admin
const getChatStats = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        
        // Thống kê tổng quan
        const totalStats = await ChatUsage.aggregate([
            {
                $group: {
                    _id: null,
                    totalChats: { $sum: 1 },
                    totalTokens: { $sum: '$usage.total_tokens' },
                    avgResponseTime: { $avg: '$responseTime' },
                    uniqueUsers: { $addToSet: '$userId' },
                    uniqueIPs: { $addToSet: '$userIP' }
                }
            }
        ]);

        // Thống kê theo cấp độ
        const levelStats = await ChatUsage.aggregate([
            {
                $group: {
                    _id: '$chatLevel',
                    count: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' },
                    totalTokens: { $sum: '$usage.total_tokens' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Thống kê theo ngày
        const dailyStats = await ChatUsage.getStats(parseInt(days));

        // Thống kê hôm nay
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayStats = await ChatUsage.aggregate([
            { $match: { date: { $gte: today, $lt: tomorrow } } },
            {
                $group: {
                    _id: '$chatLevel',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                total: totalStats[0] || {
                    totalChats: 0,
                    totalTokens: 0,
                    avgResponseTime: 0,
                    uniqueUsers: [],
                    uniqueIPs: []
                },
                byLevel: levelStats,
                daily: dailyStats,
                today: todayStats,
                limits: CHAT_LIMITS,
                period: `${days} days`
            }
        });
    } catch (error) {
        console.error('Get chat stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê chat',
            error: error.message
        });
    }
};

// Lấy thông tin chat của user hiện tại
const getMyChatInfo = async (req, res) => {
    try {
        const userId = req.user?.id;
        const userIP = req.ip;
        
        // Đếm số lượt đã dùng hôm nay
        const dailyUsed = await ChatUsage.getDailyCount(userId, userIP);
        
        // Xác định cấp độ và giới hạn
        let chatLevel = 'guest';
        let dailyLimit = CHAT_LIMITS.guest;
        
        if (req.user) {
            if (req.user.role === 'Admin') {
                chatLevel = 'admin';
                dailyLimit = CHAT_LIMITS.admin;
            } else {
                chatLevel = 'user';
                dailyLimit = CHAT_LIMITS.user;
            }
        }

        // Lịch sử chat gần đây (nếu đã đăng nhập)
        let recentChats = [];
        if (userId) {
            recentChats = await ChatUsage.find({ userId })
                .sort({ date: -1 })
                .limit(10)
                .select('message response date responseTime model');
        }

        res.json({
            success: true,
            data: {
                chatLevel,
                dailyLimit,
                dailyUsed,
                remainingChats: dailyLimit > 0 ? dailyLimit - dailyUsed : -1,
                recentChats,
                upgradeInfo: {
                    current: chatLevel,
                    next: chatLevel === 'guest' ? 'user' : 'vip',
                    benefits: chatLevel === 'guest' 
                        ? ['50 lượt chat/ngày', 'Tư vấn chi tiết', 'Lưu lịch sử chat', 'Báo giá sơ bộ']
                        : ['Không giới hạn chat', 'Tư vấn chuyên sâu', 'Hỗ trợ ưu tiên', 'Báo giá chính xác']
                }
            }
        });
    } catch (error) {
        console.error('Get my chat info error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin chat',
            error: error.message
        });
    }
};

module.exports = {
    getChatStats,
    getMyChatInfo
};