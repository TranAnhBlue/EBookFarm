/**
 * Script sửa data bị mất - Cần nhập lại thủ công
 * 
 * Dữ liệu đã bị thay thế bằng U+FFFD (�) và KHÔNG THỂ phục hồi.
 * Script này sẽ:
 * 1. Tìm tất cả documents có ký tự �
 * 2. Hiển thị danh sách
 * 3. Bạn sẽ cần sửa thủ công từng document
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const COLLECTIONS_TO_CHECK = [
  'users',
  'htxmanagementrecords',
  'farmjournals',
  'htxjournals',
  'groups',
  'notifications',
  'news',
  'products'
];

async function findCorruptedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối\n');

    console.log('🔍 TÌM KIẾM DỮ LIỆU BỊ MẤT (có ký tự �)');
    console.log('='.repeat(70));

    let totalCorrupted = 0;
    const corruptedDocs = [];

    for (const collName of COLLECTIONS_TO_CHECK) {
      console.log(`\n📂 Collection: ${collName}`);
      
      const collection = mongoose.connection.db.collection(collName);
      const docs = await collection.find({}).toArray();
      
      let collectionCount = 0;
      
      for (const doc of docs) {
        const docStr = JSON.stringify(doc);
        if (docStr.includes('�') || docStr.includes('\ufffd')) {
          collectionCount++;
          totalCorrupted++;
          
          corruptedDocs.push({
            collection: collName,
            _id: doc._id,
            preview: getPreview(doc)
          });
          
          // Chỉ hiển thị 3 docs đầu tiên của mỗi collection
          if (collectionCount <= 3) {
            console.log(`   ❌ _id: ${doc._id}`);
            console.log(`      ${getPreview(doc)}`);
          }
        }
      }
      
      if (collectionCount > 0) {
        console.log(`   📊 Tổng: ${collectionCount} documents bị lỗi`);
      } else {
        console.log(`   ✅ OK`);
      }
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ TỔNG HỢP');
    console.log('='.repeat(70));
    console.log(`   Tổng documents bị lỗi: ${totalCorrupted}`);

    if (totalCorrupted > 0) {
      console.log('\n\n⚠️  DỮ LIỆU ĐÃ BỊ MẤT - KHÔNG THỂ PHỤC HỒI BẰNG CODE!');
      console.log('\n🔧 BẠN CẦN:');
      console.log('   1. Xem danh sách documents bị lỗi ở trên');
      console.log('   2. Sửa thủ công qua UI hoặc MongoDB Compass');
      console.log('   3. Hoặc tạo script riêng với data mapping');
      
      console.log('\n💡 VÍ DỤ SỬA BẰNG SCRIPT:');
      console.log(`
const fixes = {
  'user_id_123': { fullname: 'Hợp tác xã Nông nghiệp' },
  'user_id_456': { fullname: 'Nguyễn Văn A' }
};

// Rồi dùng updateMany để sửa
      `);

      console.log('\n📝 CÁCH PHÒNG TRÁNH SAU NÀY:');
      console.log('   ✅ Backend đã thêm UTF-8 header (server.js)');
      console.log('   ✅ Database test cho thấy lưu/đọc UTF-8 đúng');
      console.log('   → Dữ liệu MỚI sẽ không bị lỗi nữa');
      console.log('   → Chỉ cần sửa dữ liệu CŨ bị lỗi');
    } else {
      console.log('\n✅ Không có dữ liệu bị lỗi!');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

function getPreview(doc) {
  const fields = ['fullname', 'title', 'name', 'message', 'description', 'content'];
  
  for (const field of fields) {
    if (doc[field] && typeof doc[field] === 'string' && doc[field].includes('�')) {
      return `${field}: "${doc[field].substring(0, 60)}..."`;
    }
  }
  
  return JSON.stringify(doc).substring(0, 80);
}

findCorruptedData();
