const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

dotenv.config();

const fixAdminToken = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Tìm admin user
        const adminUser = await User.findOne({ role: 'Admin' });
        console.log('👤 Admin user:', {
            username: adminUser.username,
            email: adminUser.email,
            role: adminUser.role,
            id: adminUser._id
        });

        // Tạo token mới với thời hạn dài
        const newToken = jwt.sign(
            { id: adminUser._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // 7 ngày
        );

        console.log('\n🔑 New Admin Token (copy this):');
        console.log('=====================================');
        console.log(newToken);
        console.log('=====================================');

        console.log('\n📋 Instructions:');
        console.log('1. Open browser Developer Tools (F12)');
        console.log('2. Go to Console tab');
        console.log('3. Run this command:');
        console.log(`localStorage.setItem('token', '${newToken}');`);
        console.log('4. Refresh the page');
        console.log('5. Check Chat AI Statistics page');

        // Test token ngay
        console.log('\n🧪 Testing new token...');
        const response = await fetch('http://localhost:5000/api/chat/stats', {
            headers: {
                'Authorization': `Bearer ${newToken}`
            }
        });

        console.log('📡 API Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Token works! Stats preview:', {
                totalChats: data.data?.overview?.totalChats,
                totalUsers: data.data?.overview?.totalUsers
            });
        } else {
            const errorData = await response.json();
            console.log('❌ Token failed:', errorData.message);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fixAdminToken();