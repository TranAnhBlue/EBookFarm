/**
 * ROLLBACK BƯỚC 2
 * 
 * Script này sẽ restore lại database về trạng thái trước step2
 * bằng cách đọc log và apply ngược lại
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function rollback() {
  try {
    console.log('🔄 ROLLBACK BƯỚC 2');
    console.log('='.repeat(70));
    
    // Đọc log file
    if (!fs.existsSync('step2-auto-fix-log.json')) {
      console.error('❌ Không tìm thấy file step2-auto-fix-log.json');
      console.log('💡 Không có gì để rollback');
      process.exit(0);
    }

    const log = JSON.parse(fs.readFileSync('step2-auto-fix-log.json', 'utf8'));
    console.log(`📋 Tìm thấy ${log.changes.length} thay đổi cần rollback\n`);

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    let successCount = 0;
    let errorCount = 0;

    console.log('🔄 Bắt đầu rollback...\n');

    for (const change of log.changes) {
      try {
        const collection = mongoose.connection.db.collection(change.collection);
        
        // Tạo update object từ các changes
        const updates = {};
        change.changes.forEach(fieldChange => {
          updates[fieldChange.field] = fieldChange.before;
        });

        // Restore về giá trị cũ
        await collection.updateOne(
          { _id: new mongoose.Types.ObjectId(change._id) },
          { $set: updates }
        );

        successCount++;
        
        if (successCount <= 5) {
          console.log(`   ✅ Restored ${change.collection}._id=${change._id}`);
        } else if (successCount === 6) {
          console.log(`   ... (còn ${log.changes.length - 5} documents nữa)`);
        }

      } catch (error) {
        console.error(`   ❌ Lỗi: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ ROLLBACK');
    console.log('='.repeat(70));
    console.log(`✅ Đã rollback: ${successCount}`);
    console.log(`❌ Lỗi: ${errorCount}`);

    // Rename log file
    fs.renameSync('step2-auto-fix-log.json', 'step2-auto-fix-log.backup.json');
    console.log('\n✅ Đã đổi tên log file thành step2-auto-fix-log.backup.json');
    console.log('\n💡 Bây giờ có thể chạy lại step2 với dictionary đã cải thiện');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

console.log('🚀 Rollback database về trạng thái ban đầu...\n');
console.log('⏳ Bắt đầu sau 2 giây...');
setTimeout(() => {
  rollback();
}, 2000);
