const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

const testAdminPermission = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tìm admin user
        const adminUser = await User.findOne({ role: 'Admin' });
        console.log('👤 Admin user:', {
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role
        });

        // Tạo token
        const token = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Test chat info endpoint
        console.log('\n🔍 Testing chat info...');
        const infoResponse = await fetch('http://localhost:5000/api/chat/my-info', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const infoData = await infoResponse.json();
        console.log('📊 Chat Info:', {
            chatLevel: infoData.data?.chatLevel,
            dailyLimit: infoData.data?.dailyLimit,
            remainingChats: infoData.data?.remainingChats
        });

        // Test RAG chat
        console.log('\n🤖 Testing RAG chat...');
        const chatResponse = await fetch('http://localhost:5000/api/rag/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                message: 'Giá gói chuyên nghiệp bao nhiêu?'
            })
        });

        const chatData = await chatResponse.json();
        console.log('💬 Chat Result:', {
            success: chatData.success,
            chatLevel: chatData.data?.chatLevel,
            remainingChats: chatData.data?.remainingChats,
            response: chatData.data?.response?.substring(0, 100) + '...'
        });

        if (chatData.data?.chatLevel === 'admin') {
            console.log('\n🎉 SUCCESS: Admin được nhận diện đúng!');
        } else {
            console.log('\n❌ FAILED: Admin vẫn bị nhận diện sai!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testAdminPermission();