const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ChatUsage = require('./src/models/ChatUsage');
const User = require('./src/models/User');

dotenv.config();

const createTestChatData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Lấy users
        const adminUser = await User.findOne({ role: 'Admin' });
        const normalUser = await User.findOne({ role: 'User' });

        console.log('👥 Found users:', {
            admin: adminUser?.username,
            user: normalUser?.username
        });

        // Xóa dữ liệu chat cũ
        await ChatUsage.deleteMany({});
        console.log('🗑️ Cleared old chat data');

        // Tạo dữ liệu chat test cho 7 ngày qua
        const testData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            // Guest chats (5 lượt/ngày)
            for (let j = 0; j < Math.min(5, Math.floor(Math.random() * 8) + 1); j++) {
                const chatTime = new Date(date);
                chatTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
                
                testData.push({
                    userId: null,
                    userIP: `192.168.1.${Math.floor(Math.random() * 100) + 100}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    message: [
                        'Giá gói chuyên nghiệp bao nhiêu?',
                        'EBookFarm có những tính năng gì?',
                        'Làm sao để liên hệ hỗ trợ?',
                        'Có hỗ trợ TCVN không?',
                        'Tôi muốn đăng ký dùng thử'
                    ][Math.floor(Math.random() * 5)],
                    response: 'Cảm ơn bạn đã quan tâm đến EBookFarm! Để được tư vấn chi tiết, vui lòng liên hệ hotline 1900 1234.',
                    chatLevel: 'guest',
                    model: 'llama-3.1-8b-instant',
                    usage: {
                        prompt_tokens: Math.floor(Math.random() * 100) + 50,
                        completion_tokens: Math.floor(Math.random() * 150) + 100,
                        total_tokens: Math.floor(Math.random() * 250) + 150
                    },
                    responseTime: Math.floor(Math.random() * 2000) + 500,
                    date: chatTime
                });
            }

            // User chats (10-30 lượt/ngày)
            if (normalUser) {
                const userChats = Math.floor(Math.random() * 20) + 10;
                for (let j = 0; j < userChats; j++) {
                    const chatTime = new Date(date);
                    chatTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
                    
                    testData.push({
                        userId: normalUser._id,
                        userIP: '192.168.1.50',
                        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        message: [
                            'Hướng dẫn tạo nhật ký sản xuất',
                            'Cách tạo mã QR truy xuất',
                            'Báo cáo thống kê như thế nào?',
                            'Tích hợp với hệ thống ERP',
                            'Xuất dữ liệu Excel được không?',
                            'Backup dữ liệu tự động không?'
                        ][Math.floor(Math.random() * 6)],
                        response: 'Dựa trên thông tin thực tế từ hệ thống EBookFarm, tôi có thể hướng dẫn bạn chi tiết về tính năng này...',
                        chatLevel: 'user',
                        model: 'llama-3.1-8b-instant',
                        usage: {
                            prompt_tokens: Math.floor(Math.random() * 150) + 100,
                            completion_tokens: Math.floor(Math.random() * 200) + 150,
                            total_tokens: Math.floor(Math.random() * 350) + 250
                        },
                        responseTime: Math.floor(Math.random() * 1500) + 800,
                        date: chatTime
                    });
                }
            }

            // Admin chats (5-15 lượt/ngày)
            if (adminUser) {
                const adminChats = Math.floor(Math.random() * 10) + 5;
                for (let j = 0; j < adminChats; j++) {
                    const chatTime = new Date(date);
                    chatTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
                    
                    testData.push({
                        userId: adminUser._id,
                        userIP: '192.168.1.10',
                        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        message: [
                            'Thống kê người dùng hệ thống',
                            'Cấu hình RAG system',
                            'Kiểm tra hiệu suất AI',
                            'Backup database',
                            'Cập nhật tính năng mới',
                            'Phân tích log hệ thống'
                        ][Math.floor(Math.random() * 6)],
                        response: 'Với quyền Admin, bạn có thể truy cập đầy đủ các tính năng quản trị hệ thống. Dựa trên dữ liệu thực tế...',
                        chatLevel: 'admin',
                        model: 'llama-3.1-8b-instant',
                        usage: {
                            prompt_tokens: Math.floor(Math.random() * 200) + 150,
                            completion_tokens: Math.floor(Math.random() * 300) + 200,
                            total_tokens: Math.floor(Math.random() * 500) + 350
                        },
                        responseTime: Math.floor(Math.random() * 1200) + 600,
                        date: chatTime
                    });
                }
            }
        }

        // Lưu dữ liệu
        await ChatUsage.insertMany(testData);
        console.log(`📊 Created ${testData.length} chat records`);

        // Thống kê
        const stats = {
            total: testData.length,
            guest: testData.filter(d => d.chatLevel === 'guest').length,
            user: testData.filter(d => d.chatLevel === 'user').length,
            admin: testData.filter(d => d.chatLevel === 'admin').length,
            totalTokens: testData.reduce((sum, d) => sum + d.usage.total_tokens, 0),
            avgResponseTime: Math.round(testData.reduce((sum, d) => sum + d.responseTime, 0) / testData.length)
        };

        console.log('\n📈 Test Data Statistics:');
        console.log('- Total chats:', stats.total);
        console.log('- Guest chats:', stats.guest);
        console.log('- User chats:', stats.user);
        console.log('- Admin chats:', stats.admin);
        console.log('- Total tokens:', stats.totalTokens.toLocaleString());
        console.log('- Avg response time:', stats.avgResponseTime + 'ms');

        console.log('\n🎉 Test data created successfully!');
        console.log('📋 Now you can check the Chat AI Statistics page');

    } catch (error) {
        console.error('❌ Failed to create test data:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestChatData();