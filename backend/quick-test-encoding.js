/**
 * Quick test - Không dùng deprecated options
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

console.log('🔍 MONGO_URI:', MONGODB_URI ? 'Found' : 'NOT FOUND');

async function quickTest() {
  try {
    console.log('\n⏳ Đang kết nối...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Kết nối thành công!\n');

    // Test đơn giản: Tạo và đọc document với tiếng Việt
    const TestCollection = mongoose.connection.db.collection('_encoding_test');
    
    const testData = {
      text1: 'Sẵn nhật ký HTX mới',
      text2: 'Hợp tác xã',
      text3: 'Bò mua hè',
      timestamp: new Date()
    };
    
    console.log('📝 Tạo document test...');
    const result = await TestCollection.insertOne(testData);
    console.log('✅ Đã tạo với _id:', result.insertedId);
    
    console.log('\n📖 Đọc lại document...');
    const retrieved = await TestCollection.findOne({ _id: result.insertedId });
    
    console.log('\n📊 KẾT QUẢ:');
    console.log('='.repeat(60));
    console.log('Gốc     :', testData.text1);
    console.log('Đọc lại :', retrieved.text1);
    console.log('');
    console.log('Gốc     :', testData.text2);
    console.log('Đọc lại :', retrieved.text2);
    console.log('');
    console.log('Gốc     :', testData.text3);
    console.log('Đọc lại :', retrieved.text3);
    console.log('='.repeat(60));
    
    if (retrieved.text1 === testData.text1 && 
        retrieved.text2 === testData.text2 &&
        retrieved.text3 === testData.text3) {
      console.log('\n🟢 PASS: Database lưu và đọc UTF-8 đúng!');
      console.log('\n💡 Vậy vấn đề là:');
      console.log('   - Dữ liệu CŨ đã bị lưu sai từ trước');
      console.log('   - Hoặc frontend hiển thị sai');
      console.log('\n🔧 Giải pháp:');
      console.log('   1. Restart backend (đã thêm UTF-8 header)');
      console.log('   2. Clear browser cache');
      console.log('   3. Nếu vẫn sai → Chạy fix-encoding-reverse.js');
    } else {
      console.log('\n🔴 FAIL: Database encoding có vấn đề!');
      console.log('\n🔍 Debug info:');
      console.log('   Expected:', Buffer.from(testData.text1, 'utf8'));
      console.log('   Got:     ', Buffer.from(retrieved.text1, 'utf8'));
    }
    
    // Xóa test document
    await TestCollection.deleteOne({ _id: result.insertedId });
    console.log('\n🧹 Đã xóa document test');
    
    // Kiểm tra data thực tế
    console.log('\n\n📊 Kiểm tra data thực tế...');
    console.log('='.repeat(60));
    
    const Users = mongoose.connection.db.collection('users');
    const sampleUser = await Users.findOne({ role: /htx/i });
    
    if (sampleUser) {
      console.log('User:', sampleUser.username);
      console.log('Fullname:', sampleUser.fullname);
      
      if (sampleUser.fullname) {
        // Check encoding issue
        const hasIssue = /[Ã¡Ã©Ã³ÃºÃ½ÄáºáÂ]/.test(sampleUser.fullname);
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(sampleUser.fullname);
        
        if (hasIssue) {
          console.log('🔴 Data cũ bị lỗi encoding!');
          console.log('   → Cần chạy: node fix-encoding-reverse.js');
        } else if (hasVietnamese) {
          console.log('🟢 Data đúng UTF-8');
          console.log('   → Nếu UI hiển thị sai, restart backend + clear cache');
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Lỗi:', error.message);
    console.error('\n🔍 Stack:', error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối\n');
    process.exit(0);
  }
}

if (!MONGODB_URI) {
  console.error('❌ Không tìm thấy MONGO_URI hoặc MONGODB_URI trong .env');
  console.error('💡 Kiểm tra file backend/.env');
  process.exit(1);
}

quickTest();
