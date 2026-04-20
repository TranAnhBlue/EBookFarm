const ChatUsage = require('../models/ChatUsage');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Giới hạn chat theo cấp độ
const CHAT_LIMITS = {
    guest: 5,      // 5 lượt/ngày cho khách vãng lai
    user: 50,      // 50 lượt/ngày cho user đã đăng ký
    admin: -1,     // Không giới hạn cho admin
    vip: -1        // Không giới hạn cho VIP (có thể thêm sau)
};

const checkChatPermission = async (req, res, next) => {
    try {
        // Lấy thông tin user từ token (nếu có)
        let user = null;
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token && token !== 'null' && token !== 'undefined') {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                user = await User.findById(decoded.id);
            } catch (error) {
                // Token không hợp lệ, coi như khách vãng lai
                console.log('Invalid token, treating as guest');
            }
        }

        // Lấy IP và User Agent
        const userIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';

        // Xác định cấp độ chat
        let chatLevel = 'guest';
        let dailyLimit = CHAT_LIMITS.guest;
        
        if (user) {
            if (user.role === 'Admin') {  // Sửa từ 'admin' thành 'Admin'
                chatLevel = 'admin';
                dailyLimit = CHAT_LIMITS.admin;
            } else {
                chatLevel = 'user';
                dailyLimit = CHAT_LIMITS.user;
            }
        }

        // Kiểm tra số lượt đã sử dụng trong ngày
        const dailyUsed = await ChatUsage.getDailyCount(user?._id, userIP);
        
        // Kiểm tra giới hạn (trừ admin/vip)
        if (dailyLimit > 0 && dailyUsed >= dailyLimit) {
            const message = chatLevel === 'guest' 
                ? 'Bạn đã hết lượt chat miễn phí hôm nay (5 lượt). Vui lòng đăng ký tài khoản để có thêm 50 lượt/ngày!'
                : 'Bạn đã hết lượt chat hôm nay (50 lượt). Liên hệ admin để nâng cấp VIP không giới hạn.';
                
            return res.json({
                success: false,
                message: message,
                chatLevel: chatLevel,
                dailyUsed: dailyUsed,
                dailyLimit: dailyLimit,
                requireUpgrade: true,
                upgradeInfo: {
                    current: chatLevel,
                    next: chatLevel === 'guest' ? 'user' : 'vip',
                    benefits: chatLevel === 'guest' 
                        ? ['50 lượt chat/ngày', 'Tư vấn chi tiết', 'Lưu lịch sử chat']
                        : ['Không giới hạn chat', 'Tư vấn chuyên sâu', 'Hỗ trợ ưu tiên']
                }
            });
        }

        // Gắn thông tin vào request
        req.chatPermission = {
            user: user,
            userId: user?._id,
            userIP: userIP,
            userAgent: userAgent,
            chatLevel: chatLevel,
            dailyLimit: dailyLimit,
            dailyUsed: dailyUsed,
            remainingChats: dailyLimit > 0 ? dailyLimit - dailyUsed : -1
        };

        next();
    } catch (error) {
        console.error('Chat permission middleware error:', error);
        
        // Fallback: cho phép chat như khách vãng lai
        req.chatPermission = {
            user: null,
            userId: null,
            userIP: req.ip,
            userAgent: req.headers['user-agent'] || '',
            chatLevel: 'guest',
            dailyLimit: CHAT_LIMITS.guest,
            dailyUsed: 0,
            remainingChats: CHAT_LIMITS.guest
        };
        
        next();
    }
};

// Middleware để log chat usage
const logChatUsage = async (req, res, next) => {
    // Lưu response gốc
    const originalSend = res.json;
    
    res.json = function(data) {
        // Nếu chat thành công, log usage
        if (data.success && data.data && req.chatPermission && req.body.message) {
            const startTime = req.chatStartTime || Date.now();
            const responseTime = Date.now() - startTime;
            
            // Async log (không chờ)
            ChatUsage.create({
                userId: req.chatPermission.userId,
                userIP: req.chatPermission.userIP,
                userAgent: req.chatPermission.userAgent,
                message: req.body.message,
                response: data.data.response,
                chatLevel: req.chatPermission.chatLevel,
                model: data.data.model || 'llama-3.1-8b-instant',
                usage: data.data.usage || {},
                responseTime: responseTime
            }).catch(error => {
                console.error('Failed to log chat usage:', error);
            });
        }
        
        // Gọi response gốc
        originalSend.call(this, data);
    };
    
    // Ghi nhận thời gian bắt đầu
    req.chatStartTime = Date.now();
    next();
};

module.exports = {
    checkChatPermission,
    logChatUsage,
    CHAT_LIMITS
};