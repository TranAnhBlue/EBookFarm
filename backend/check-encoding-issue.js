/**
 * Script kiểm tra và sửa lỗi encoding UTF-8 trong database
 * 
 * Vấn đề: Chữ tiếng Việt bị hiển thị sai dấu (Sẵn nhật ký HTX mới thành Sáº¯n nhẫº¯t kÃ½...)
 * Nguyên nhân: Dữ liệu được lưu với encoding sai hoặc đọc với encoding sai
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';

async function checkEncodingIssues() {
  try {
    console.log('🔍 Đang kết nối MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    // Lấy tất cả collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Tìm thấy ${collections.length} collections:\n`);

    let totalIssues = 0;

    for (const collInfo of collections) {
      const collName = collInfo.name;
      console.log(`\n🔍 Đang kiểm tra collection: ${collName}`);

      const collection = mongoose.connection.db.collection(collName);
      
      // Lấy một vài documents mẫu
      const samples = await collection.find({}).limit(5).toArray();
      
      if (samples.length === 0) {
        console.log(`   ⚪ Rỗng`);
        continue;
      }

      let collectionHasIssues = false;

      for (const doc of samples) {
        // Kiểm tra các field có dấu lỗi encoding
        const docStr = JSON.stringify(doc);
        
        // Pattern phát hiện lỗi encoding: ký tự có dấu � hoặc các byte sequence sai
        const hasEncodingIssue = 
          docStr.includes('Ã') || 
          docStr.includes('Ã¡') || 
          docStr.includes('Ã©') ||
          docStr.includes('Ã³') ||
          docStr.includes('Ãº') ||
          docStr.includes('Ã½') ||
          docStr.includes('Ä') ||
          docStr.includes('á»') ||
          docStr.includes('áº') ||
          /[\xC0-\xFF][\x80-\xBF]/.test(docStr); // UTF-8 byte sequence

        if (hasEncodingIssue) {
          collectionHasIssues = true;
          totalIssues++;
          
          console.log(`   ❌ Phát hiện lỗi encoding trong document _id: ${doc._id}`);
          
          // Hiển thị các field bị lỗi
          for (const [key, value] of Object.entries(doc)) {
            if (typeof value === 'string' && /[Ã¡Ã©Ã³ÃºÃ½ÄáºÂ]/.test(value)) {
              console.log(`      Field "${key}": ${value.substring(0, 100)}...`);
            }
          }
        }
      }

      if (!collectionHasIssues) {
        console.log(`   ✅ OK - Không có lỗi encoding`);
      }
    }

    console.log(`\n\n📊 KẾT QUẢ:`);
    console.log(`   Tổng số collections: ${collections.length}`);
    console.log(`   Documents có vấn đề: ${totalIssues}`);

    if (totalIssues > 0) {
      console.log(`\n⚠️  CÓ VẤN ĐỀ ENCODING!`);
      console.log(`\n💡 GIẢI PHÁP:`);
      console.log(`   1. Chạy script fix-encoding.js để sửa dữ liệu hiện có`);
      console.log(`   2. Đảm bảo MongoDB connection string có: ?useUnicode=true&characterEncoding=UTF-8`);
      console.log(`   3. Kiểm tra Content-Type trong API responses: application/json; charset=utf-8`);
      console.log(`   4. Đảm bảo form submissions sử dụng UTF-8 encoding`);
    } else {
      console.log(`\n✅ Không phát hiện vấn đề encoding!`);
      console.log(`\n💡 Nếu vẫn thấy lỗi hiển thị, kiểm tra:`);
      console.log(`   - Frontend: <meta charset="UTF-8">`);
      console.log(`   - API response headers: Content-Type: application/json; charset=utf-8`);
      console.log(`   - Browser console có lỗi character encoding không`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

checkEncodingIssues();
