/**
 * Script: Kiểm tra thông tin user "Bùi Thị Luân"
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  fullname: String,
  email: String,
  farmCode: String,
  farmArea: Number,
  address: String,
  ward: String,
  province: String,
  farmName: String,
  role: String
}, { timestamps: true }), 'users');

async function checkUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    // Tìm user có tên chứa "Luân" hoặc "Luan"
    const users = await User.find({
      $or: [
        { fullname: /luân/i },
        { fullname: /luan/i },
        { username: /luan/i }
      ]
    });

    if (users.length === 0) {
      console.log('❌ Không tìm thấy user "Bùi Thị Luân"\n');
      console.log('📋 Danh sách tất cả users:');
      const allUsers = await User.find().limit(10);
      allUsers.forEach((u, idx) => {
        console.log(`${idx + 1}. ${u.fullname} (@${u.username}) - ${u.email}`);
      });
    } else {
      console.log(`✅ Tìm thấy ${users.length} user:\n`);
      
      users.forEach((user, idx) => {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`USER ${idx + 1}:`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`👤 Username:        ${user.username || 'N/A'}`);
        console.log(`📝 Fullname:        ${user.fullname || 'N/A'}`);
        console.log(`📧 Email:           ${user.email || 'N/A'}`);
        console.log(`🎭 Role:            ${user.role || 'N/A'}`);
        console.log(`\n🌾 FARM INFO:`);
        console.log(`   Farm Name:       ${user.farmName || 'N/A'}`);
        console.log(`   Farm Code:       ${user.farmCode || 'N/A'}`);
        console.log(`   Farm Area:       ${user.farmArea ? user.farmArea + ' m²' : 'N/A'}`);
        console.log(`\n📍 ADDRESS:`);
        console.log(`   Address:         ${user.address || 'N/A'}`);
        console.log(`   Ward:            ${user.ward || 'N/A'}`);
        console.log(`   Province:        ${user.province || 'N/A'}`);
        console.log(`\n🔑 ID:              ${user._id}`);
        console.log(``);
      });

      console.log(`\n📌 THÔNG TIN SẼ TỰ ĐỘNG ĐIỀN:`);
      const user = users[0];
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`1. Họ và tên người ghi chép: ${user.fullname || user.username || 'N/A'}`);
      console.log(`2. Trưởng nhóm:               ${user.htxLeader || '(để trống)'}`);
      console.log(`3. Mã số nông hộ:             ${user.farmCode || '(để trống)'}`);
      console.log(`4. Địa chỉ sản xuất:          ${user.address || user.ward || '(để trống)'}`);
      console.log(`5. Diện tích (m2):            ${user.farmArea || '(để trống)'}`);
      console.log(`6. Cây trồng:                 (Từ schema name)`);
      console.log(`7. Quy trình sản xuất:        (Auto-detect)`);
      console.log(`8. Năm sản xuất:              ${new Date().getFullYear()}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối');
  }
}

checkUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
