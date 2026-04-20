// Test đơn giản admin middleware
const express = require('express');
const { protect, admin } = require('./src/middlewares/authMiddleware');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const testAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Tạo admin user và token
        const adminUser = await User.findOne({ role: 'Admin' });
        console.log('👤 Admin user found:', {
            username: adminUser.username,
            role: adminUser.role,
            id: adminUser._id
        });
        
        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('🔑 Token created');
        
        // Tạo mock request/response
        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };
        
        const res = {
            status: (code) => ({
                json: (data) => {
                    console.log(`📡 Response ${code}:`, data);
                    return data;
                }
            })
        };
        
        // Test protect middleware
        console.log('\n🔐 Testing protect middleware...');
        await new Promise((resolve, reject) => {
            protect(req, res, (err) => {
                if (err) reject(err);
                else {
                    console.log('✅ Protect middleware passed');
                    console.log('👤 req.user:', {
                        id: req.user?._id,
                        username: req.user?.username,
                        role: req.user?.role
                    });
                    resolve();
                }
            });
        });
        
        // Test admin middleware
        console.log('\n👑 Testing admin middleware...');
        admin(req, res, () => {
            console.log('✅ Admin middleware passed - User is admin!');
        });
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

testAdmin();