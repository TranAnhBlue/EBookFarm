const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const createTanQuanDirector = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in .env!');
    }
    
    console.log('Connecting to MongoDB Atlas database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');

    // Delete existing user if any to reset password properly
    await User.deleteOne({ 
      $or: [
        { username: 'tanquan_ecofarm' },
        { email: 'tanquan.ecofarm@ebookfarm.com' }
      ]
    });

    // Create HTX Director with PLAIN TEXT password (User model pre-save hook will hash it ONCE)
    const director = new User({
      username: 'tanquan_ecofarm',
      fullname: 'Ban Giám Đốc HTX Tân Quan Ecofarm',
      email: 'tanquan.ecofarm@ebookfarm.com',
      phone: '0978272652',
      password: 'Tanquan@2026', // Plain text -> Mongoose pre-save hook will hash it automatically
      role: 'HTX_DIRECTOR',
      status: 'Active',
      organization: 'HỢP TÁC XÃ SẦU RIÊNG TÂN QUAN ECOFARM',
      address: 'Ấp Sóc Trào A, Xã Tân Quan, TP Đồng Nai, Việt Nam',
      province: 'Tỉnh Đồng Nai',
      ward: 'Xã Tân Quan',
      farmName: 'Vùng nguyên liệu Sầu riêng Tân Quan Ecofarm (100 ha)',
      farmArea: 1000000,
      farmType: 'Trồng trọt',
      portalCredentials: {
        enterpriseCode: '3801354951',
        apiKey: 'TQ-ECOFARM-KEY-3801354951',
        portalStatus: 'Connected'
      }
    });

    await director.save();
    console.log('🎉 CREATED DIRECTOR ON ATLAS SUCCESSFULLY:');
    console.log('   - Username:', director.username);
    console.log('   - Email:', director.email);
    console.log('   - Password: Tanquan@2026');
    console.log('   - Role:', director.role);
    console.log('   - ID:', director._id);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating director:', error);
    process.exit(1);
  }
};

createTanQuanDirector();
