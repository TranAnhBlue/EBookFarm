const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    const users = [
      {
        username: 'admin',
        fullname: 'Quản trị viên Hệ thống',
        email: 'admin@gmail.com',
        password: '123',
        role: 'Admin',
        status: 'Active'
      },
      {
        username: 'farmer',
        fullname: 'Nông dân Việt',
        email: 'farmer@gmail.com',
        password: '123',
        role: 'User',
        status: 'Active'
      },
      {
        username: 'technician',
        fullname: 'Kỹ thuật viên 01',
        email: 'tech@gmail.com',
        password: '123',
        role: 'User',
        status: 'Active'
      }
    ];

    for (const u of users) {
      await User.create(u);
      console.log(`Created user: ${u.email}`);
    }

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
