/**
 * Script để cập nhật các user hiện có trong database
 * Thêm field mustChangePassword và lastPasswordChange
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

const updateExistingUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update all existing users
    const result = await User.updateMany(
      { mustChangePassword: { $exists: false } },
      { 
        $set: { 
          mustChangePassword: false,
          lastPasswordChange: new Date()
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with new security fields`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateExistingUsers();
