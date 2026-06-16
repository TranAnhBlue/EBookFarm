/**
 * Script chẩn đoán hướng lỗi encoding
 * 
 * Xác định:
 * 1. Database lưu sai → Frontend đúng (cần fix DB)
 * 2. Database đúng → Frontend sai (cần fix response/frontend)
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';

// Test cases
const testCases = [
  {
    correct: 'Sẵn nhật ký HTX mới',
    broken: 'Sáº¯n nhẫº¯t kÃ½ HTX máº›i',
    description: 'Tiêu đề thông báo'
  },
  {
    correct: 'Hợp tác xã',
    broken: 'Háº£p tĂ¡c xĂŁ',
    description: 'Tên tổ chức'
  },
  {
    correct: 'Bò mua hè',
    broken: 'BĂ² mua hĂš',
    description: 'Ghi chú'
  }
];

function analyzeText(text, testCase) {
  console.log(`\n📝 Phân tích: "${testCase.description}"`);
  console.log(`   Text trong DB: ${text.substring(0, 50)}...`);
  
  // Kiểm tra text có phải UTF-8 thuần không
  const isValidUtf8 = !(/[\xC0-\xFF][\x80-\xBF]/.test(text) || /[Ã¡Ã©Ã³ÃºÃ½ÄáºáÂ]/.test(text));
  
  if (text === testCase.correct) {
    console.log(`   ✅ Trạng thái: DB lưu ĐÚNG UTF-8`);
    console.log(`   💡 Vấn đề: Frontend hiển thị SAI`);
    console.log(`   🔧 Giải pháp: Sửa API response headers hoặc frontend decode`);
    return 'DB_CORRECT_FRONTEND_WRONG';
  } 
  else if (text === testCase.broken || !isValidUtf8) {
    console.log(`   ❌ Trạng thái: DB lưu SAI (double-encoded)`);
    console.log(`   💡 Vấn đề: Database encoding sai`);
    console.log(`   🔧 Giải pháp: Chạy fix-encoding.js để sửa DB`);
    return 'DB_WRONG';
  }
  else {
    console.log(`   ⚠️  Trạng thái: KHÔNG KHỚP test case`);
    console.log(`   Text mong đợi: ${testCase.correct}`);
    console.log(`   Text thực tế: ${text}`);
    return 'UNKNOWN';
  }
}

async function diagnose() {
  try {
    console.log('🔍 Đang kết nối MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    console.log('🔬 CHẨN ĐOÁN HƯỚNG LỖI ENCODING\n');
    console.log('=' .repeat(60));

    const results = {
      DB_CORRECT_FRONTEND_WRONG: 0,
      DB_WRONG: 0,
      UNKNOWN: 0
    };

    // Kiểm tra collection htxmanagementrecords (có thông báo HTX)
    const HtxRecord = mongoose.connection.db.collection('htxmanagementrecords');
    const samples = await HtxRecord.find({}).limit(10).toArray();
    
    console.log(`\n📊 Kiểm tra ${samples.length} documents mẫu...\n`);

    for (const doc of samples) {
      if (doc.title && typeof doc.title === 'string') {
        // Tìm test case phù hợp
        const matchedCase = testCases.find(tc => 
          doc.title.includes(tc.correct.substring(0, 10)) ||
          doc.title.includes(tc.broken.substring(0, 10))
        );
        
        if (matchedCase) {
          const result = analyzeText(doc.title, matchedCase);
          results[result]++;
        }
      }
    }

    // Kiểm tra users collection
    const Users = mongoose.connection.db.collection('users');
    const userSamples = await Users.find({ fullname: { $exists: true } }).limit(5).toArray();
    
    console.log(`\n📊 Kiểm tra ${userSamples.length} users...\n`);
    
    for (const user of userSamples) {
      if (user.fullname) {
        // Kiểm tra có ký tự đặc biệt không
        const hasSpecialChars = /[Ã¡Ã©Ã³ÃºÃ½ÄáºáÂ]/.test(user.fullname);
        const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(user.fullname);
        
        console.log(`\n📝 User: ${user.username}`);
        console.log(`   Tên: ${user.fullname}`);
        
        if (hasSpecialChars) {
          console.log(`   ❌ Có byte sequence lỗi encoding`);
          results.DB_WRONG++;
        } else if (hasVietnamese) {
          console.log(`   ✅ Tiếng Việt đúng trong DB`);
          results.DB_CORRECT_FRONTEND_WRONG++;
        }
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ CHẨN ĐOÁN:');
    console.log('='.repeat(60));
    console.log(`   Database đúng, Frontend sai: ${results.DB_CORRECT_FRONTEND_WRONG}`);
    console.log(`   Database sai: ${results.DB_WRONG}`);
    console.log(`   Không xác định: ${results.UNKNOWN}`);

    if (results.DB_CORRECT_FRONTEND_WRONG > results.DB_WRONG) {
      console.log('\n\n🎯 CHẨN ĐOÁN: DATABASE ĐÚNG, FRONTEND HIỂN THỊ SAI');
      console.log('\n💡 NGUYÊN NHÂN CÓ THỂ:');
      console.log('   1. API response không có header: Content-Type: application/json; charset=utf-8');
      console.log('   2. Frontend decode response với encoding sai');
      console.log('   3. Browser hoặc HTTP client setting encoding không đúng');
      
      console.log('\n🔧 GIẢI PHÁP:');
      console.log('   ✅ ĐÃ SỬA: backend/src/server.js - thêm UTF-8 header');
      console.log('   📋 CẦN LÀM:');
      console.log('      1. Restart backend server');
      console.log('      2. Clear browser cache');
      console.log('      3. Hard reload (Ctrl+F5)');
      console.log('      4. Kiểm tra Network tab → Response Headers');
      
      console.log('\n⚠️  KHÔNG CẦN:');
      console.log('   ❌ KHÔNG chạy fix-encoding.js (sẽ làm hỏng data đúng!)');
      console.log('   ❌ KHÔNG sửa database');
      
    } else if (results.DB_WRONG > results.DB_CORRECT_FRONTEND_WRONG) {
      console.log('\n\n🎯 CHẨN ĐOÁN: DATABASE LƯU SAI ENCODING');
      console.log('\n🔧 GIẢI PHÁP:');
      console.log('   1. Backup database');
      console.log('   2. Chạy: node fix-encoding.js');
      console.log('   3. Restart backend');
      console.log('   4. Test lại');
      
    } else {
      console.log('\n\n⚠️  Không đủ dữ liệu để chẩn đoán');
      console.log('\n💡 Gợi ý:');
      console.log('   - Kiểm tra thủ công một vài documents');
      console.log('   - Xem log API response trong browser DevTools');
      console.log('   - So sánh data trong MongoDB Compass vs UI');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

diagnose();
