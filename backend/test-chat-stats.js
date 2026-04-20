const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

const testChatStats = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tạo admin token
        const adminUser = await User.findOne({ role: 'Admin' });
        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Test stats API
        console.log('📊 Testing chat stats API...');
        const response = await fetch('http://localhost:5000/api/chat/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Stats API working!');
            console.log('📈 Overview:', data.data.overview);
            console.log('📅 Daily stats count:', data.data.dailyStats?.length || 0);
            console.log('👥 User stats count:', data.data.userStats?.length || 0);
        } else {
            console.log('❌ Stats API failed:', data.message);
        }

        // Test my-info API
        console.log('\n🔍 Testing my-info API...');
        const infoResponse = await fetch('http://localhost:5000/api/chat/my-info', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const infoData = await infoResponse.json();
        
        if (infoData.success) {
            console.log('✅ My-info API working!');
            console.log('👤 User info:', {
                chatLevel: infoData.data.chatLevel,
                dailyLimit: infoData.data.dailyLimit,
                dailyUsed: infoData.data.dailyUsed,
                remainingChats: infoData.data.remainingChats
            });
        } else {
            console.log('❌ My-info API failed:', infoData.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testChatStats();