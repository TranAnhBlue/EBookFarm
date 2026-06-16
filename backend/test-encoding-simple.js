/**
 * Test encoding đơn giản - Kiểm tra database có đang lưu đúng UTF-8 không
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';

async function testEncoding() {
  try {
    console.log('🔍 Kết nối MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối\n');

    // Test 1: Xem raw data trong users
    console.log('📊 TEST 1: Kiểm tra Users collection');
    console.log('='.repeat(60));
    
    const User = mongoose.connection.db.collection('users');
    const users = await User.find({ role: /htx/i }).limit(3).toArray();
    
    users.forEach((user, i) => {
      console.log(`\n${i + 1}. User: ${user.username}`);
      console.log(`   Fullname: ${user.fullname}`);
      console.log(`   Organization: ${user.organization || 'N/A'}`);
      
      // Kiểm tra encoding
      if (user.fullname) {
        const hasIssue = /[Ã¡Ã©Ã³ÃºÃ½ÄáºáÂ]/.test(user.fullname);
        const hasVietnames = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(user.fullname);
        
        if (hasIssue) {
          console.log(`   🔴 ENCODING LỖI - Có byte sequence sai`);
          console.log(`   💡 Cần sửa database`);
        } else if (hasVietnames) {
          console.log(`   🟢 ENCODING OK - UTF-8 đúng`);
          console.log(`   💡 Nếu UI hiển thị sai → Vấn đề ở frontend/API`);
        } else {
          console.log(`   ⚪ Không có tiếng Việt để test`);
        }
      }
    });

    // Test 2: Tạo document mới với tiếng Việt
    console.log('\n\n📊 TEST 2: Tạo document test');
    console.log('='.repeat(60));
    
    const TestModel = mongoose.connection.db.collection('encoding_test');
    
    const testDoc = {
      title: 'Sẵn nhật ký HTX mới',
      description: 'Hợp tác xã nông nghiệp',
      note: 'Bò mua hè',
      createdAt: new Date()
    };
    
    const inserted = await TestModel.insertOne(testDoc);
    console.log('\n✅ Đã tạo document test với ID:', inserted.insertedId);
    
    // Đọc lại để xem có đúng không
    const retrieved = await TestModel.findOne({ _id: inserted.insertedId });
    
    console.log('\n📖 Đọc lại từ database:');
    console.log(`   Title: ${retrieved.title}`);
    console.log(`   Description: ${retrieved.description}`);
    console.log(`   Note: ${retrieved.note}`);
    
    // So sánh
    if (retrieved.title === testDoc.title) {
      console.log('\n🟢 WRITE/READ OK - Database lưu và đọc đúng UTF-8');
    } else {
      console.log('\n🔴 WRITE/READ LỖI - Database encoding sai');
      console.log(`   Mong đợi: ${testDoc.title}`);
      console.log(`   Nhận được: ${retrieved.title}`);
    }
    
    // Clean up
    await TestModel.deleteOne({ _id: inserted.insertedId });
    console.log('\n🧹 Đã xóa document test\n');

    // Test 3: Kiểm tra htxmanagementrecords (từ hình của bạn)
    console.log('📊 TEST 3: Kiểm tra HtxManagementRecords');
    console.log('='.repeat(60));
    
    const HtxRecords = mongoose.connection.db.collection('htxmanagementrecords');
    const records = await HtxRecords.find({}).limit(5).toArray();
    
    if (records.length === 0) {
      console.log('⚪ Collection rỗng');
    } else {
      records.forEach((rec, i) => {
        console.log(`\n${i + 1}. Record:`, rec._id);
        if (rec.title) console.log(`   Title: ${rec.title}`);
        if (rec.description) console.log(`   Description: ${rec.description.substring(0, 50)}...`);
        
        const textToCheck = rec.title || rec.description || '';
        if (textToCheck) {
          const hasIssue = /[Ã¡Ã©Ã³ÃºÃ½ÄáºáÂ]/.test(textToCheck);
          if (hasIssue) {
            console.log(`   🔴 ENCODING LỖI`);
          } else {
            console.log(`   🟢 ENCODING OK`);
          }
        }
      });
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 KẾT LUẬN:');
    console.log('='.repeat(60));
    console.log(`
    1. Nếu TEST 2 hiển thị "WRITE/READ OK":
       → Database hoạt động đúng với UTF-8
       → Vấn đề có thể ở:
         - Dữ liệu cũ đã bị lưu sai trước đây
         - Frontend đọc API response sai
    
    2. Nếu TEST 2 hiển thị "WRITE/READ LỖI":
       → MongoDB connection hoặc driver có vấn đề
       → Cần kiểm tra MONGO_URI và driver version
    
    3. Nếu TEST 1 hoặc TEST 3 có "ENCODING LỖI":
       → Dữ liệu cũ đã bị lưu sai
       → Cần chạy script sửa: node fix-encoding-reverse.js
    `);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB\n');
    process.exit(0);
  }
}

testEncoding();
