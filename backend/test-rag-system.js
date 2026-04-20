const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

const testRAGSystem = async () => {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tìm admin user
        const adminUser = await User.findOne({ role: 'Admin' });
        if (!adminUser) {
            console.log('❌ No admin user found');
            return;
        }

        // Tạo token
        const token = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('🔑 Admin token created for:', adminUser.username);

        // Test RAG chat
        const testQuestions = [
            'Giá gói chuyên nghiệp bao nhiêu?',
            'EBookFarm có những tính năng gì?',
            'Làm sao để liên hệ hỗ trợ?',
            'Có hỗ trợ những tiêu chuẩn TCVN nào?'
        ];

        for (const question of testQuestions) {
            console.log(`\n🤖 Testing: "${question}"`);
            
            try {
                const response = await fetch('http://localhost:5000/api/rag/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: question,
                        conversationHistory: []
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ Response:', data.data.response.substring(0, 200) + '...');
                    console.log('📊 RAG Info:', {
                        documentsFound: data.data.ragInfo?.documentsFound,
                        hasSpecificContext: data.data.ragInfo?.hasSpecificContext,
                        chatLevel: data.data.chatLevel
                    });
                } else {
                    console.log('❌ Error:', data.message);
                }
            } catch (error) {
                console.log('❌ Request failed:', error.message);
            }
        }

        console.log('\n🎉 RAG test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testRAGSystem();