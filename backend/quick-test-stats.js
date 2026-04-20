// Test nhanh API stats với admin token
const testStatsAPI = async () => {
    try {
        // Test với admin token từ localStorage (giả lập)
        const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MjNkNzE4ZjU4YzQwMDAxMjM0NTY3OCIsImlhdCI6MTcxMzYyNzQ1NiwiZXhwIjoxNzEzNjMxMDU2fQ.example'; // Token mẫu
        
        console.log('🧪 Testing Stats API...');
        
        // Test 1: Kiểm tra dữ liệu có trong database không
        const mongoose = require('mongoose');
        const dotenv = require('dotenv');
        const ChatUsage = require('./src/models/ChatUsage');
        
        dotenv.config();
        await mongoose.connect(process.env.MONGO_URI);
        
        const totalChats = await ChatUsage.countDocuments();
        console.log('📊 Total chats in database:', totalChats);
        
        if (totalChats === 0) {
            console.log('❌ No chat data found! Run create-chat-test-data.js first');
            process.exit(1);
        }
        
        // Test 2: Kiểm tra API endpoint
        const response = await fetch('http://localhost:5000/api/chat/stats');
        console.log('📡 API Response status:', response.status);
        
        if (response.status === 401) {
            console.log('🔐 Need authentication - this is expected');
        }
        
        // Test 3: Kiểm tra với token (cần tạo token thực)
        const User = require('./src/models/User');
        const jwt = require('jsonwebtoken');
        
        const adminUser = await User.findOne({ role: 'Admin' });
        const realToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        const authResponse = await fetch('http://localhost:5000/api/chat/stats', {
            headers: {
                'Authorization': `Bearer ${realToken}`
            }
        });
        
        console.log('🔑 Authenticated API status:', authResponse.status);
        
        if (authResponse.ok) {
            const data = await authResponse.json();
            console.log('✅ Stats API working!');
            console.log('📈 Overview:', data.data?.overview);
        } else {
            const errorData = await authResponse.json();
            console.log('❌ Stats API failed:', errorData.message);
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
    
    process.exit(0);
};

testStatsAPI();