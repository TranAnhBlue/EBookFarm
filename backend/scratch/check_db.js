const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ username: 'fintviet' }); // Username từ ảnh của bạn
    if (!user) {
      const userByPhone = await User.findOne({ phone: '0981439283' });
      console.log('User found by phone:', userByPhone);
    } else {
      console.log('User found by username:', user);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUser();
