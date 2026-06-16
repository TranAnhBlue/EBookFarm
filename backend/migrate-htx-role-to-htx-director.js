/**
 * Script migration: Cập nhật role HTX cũ sang HTX_DIRECTOR
 * 
 * Chuyển đổi:
 * - 'HTX' → 'HTX_DIRECTOR'
 * - 'Htx' → 'HTX_DIRECTOR'
 * - 'htx' → 'HTX_DIRECTOR'
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ebookfarm';

async function migrateHtxRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Tìm tất cả user có role là HTX (case-insensitive)
    const htxUsers = await User.find({
      role: { $in: ['HTX', 'Htx', 'htx'] }
    });

    console.log(`\n📊 Tìm thấy ${htxUsers.length} user có role HTX cũ\n`);

    if (htxUsers.length === 0) {
      console.log('✅ Không có user nào cần migrate');
      process.exit(0);
    }

    // Hiển thị danh sách sẽ được cập nhật
    console.log('Danh sách user sẽ được cập nhật:');
    htxUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.fullname || user.username} (${user.email}) - Role hiện tại: ${user.role}`);
    });

    console.log('\n🔄 Bắt đầu cập nhật...\n');

    // Cập nhật từng user
    let successCount = 0;
    let errorCount = 0;

    for (const user of htxUsers) {
      try {
        const oldRole = user.role;
        user.role = 'HTX_DIRECTOR';
        await user.save();
        
        console.log(`✅ [${successCount + 1}/${htxUsers.length}] Cập nhật thành công: ${user.fullname || user.username} (${oldRole} → HTX_DIRECTOR)`);
        successCount++;
      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật user ${user._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 KẾT QUẢ MIGRATION:');
    console.log(`   ✅ Thành công: ${successCount}/${htxUsers.length}`);
    if (errorCount > 0) {
      console.log(`   ❌ Thất bại: ${errorCount}/${htxUsers.length}`);
    }

    console.log('\n✅ Migration hoàn tất!');
    
  } catch (error) {
    console.error('❌ Lỗi khi thực hiện migration:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

// Chạy migration
migrateHtxRoles();
