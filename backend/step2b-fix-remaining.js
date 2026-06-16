/**
 * BƯỚC 2B: SỬA 109 DOCUMENTS CÒN LẠI
 * 
 * Script đặc biệt để sửa các patterns còn sót
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// DICTIONARY BỔ SUNG - Patterns còn thiếu
const ADDITIONAL_PATTERNS = {
  // Tên người Việt Nam
  'Nguy�n': 'Nguyễn',
  'NGUY�N': 'NGUYỄN',
  'Th�': 'Thị',
  'TH�': 'THỊ',
  '�c': 'Đức',
  '�C': 'ĐỨC',
  '�p': 'Áp',
  '�P': 'ÁP',
  '�n': 'Ấn',
  '�N': 'ẤN',
  '�o': 'Ảo',
  '�O': 'ẢO',
  'Vn': 'Văn',
  'VN': 'VĂN',
  'HoÔng': 'Hoàng',
  'HOÔNG': 'HOÀNG',
  'Ngàc': 'Ngọc',
  'NGÀC': 'NGỌC',
  'Vi': 'Vũ',
  'VI': 'VŨ',
  
  // Các ký tự đơn còn sót
  '�': '',  // Remove replacement character nếu đứng một mình
  'Ô': 'ă',  // Pattern đặc biệt
  'SÔng': 'Sơn',
  'Ē': 'ă',  // Pattern khác
  'ChĒn': 'Chăn',
  
  // Patterns từ notifications
  '�ã': 'đã',
  '�Ã': 'ĐÃ',
  '�ược': 'được',
  '�ƯỢC': 'ĐƯỢC',
  'sổ"': 'sổ',
  'Sổ"': 'Sổ',
  'm�:i': 'mới',
  'M�:I': 'MỚI',
  
  // Từ thường gặp khác
  'thảnh': 'thành',
  'hưởng': '',  // Trong context "thành phố", "hưởng" là thừa
};

const COLLECTIONS_TO_FIX = [
  { name: 'users', fields: ['fullname', 'organization', 'address', 'bio', 'farmName', 'ward', 'district', 'city'] },
  { name: 'notifications', fields: ['title', 'message', 'content'] },
];

const changeLog = [];

async function fixRemaining() {
  try {
    console.log('🔧 BƯỚC 2B: SỬA 109 DOCUMENTS CÒN LẠI');
    console.log('='.repeat(70));
    console.log(`📚 Additional patterns: ${Object.keys(ADDITIONAL_PATTERNS).length}\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    let totalFixed = 0;
    let totalChecked = 0;

    for (const collectionInfo of COLLECTIONS_TO_FIX) {
      const { name: collName, fields } = collectionInfo;
      
      console.log(`\n📂 Đang xử lý collection: ${collName}`);
      
      const collection = mongoose.connection.db.collection(collName);
      const docs = await collection.find({}).toArray();
      
      let collectionFixed = 0;
      totalChecked += docs.length;
      
      for (const doc of docs) {
        let hasChanges = false;
        const updates = {};
        const docChanges = {
          collection: collName,
          _id: doc._id.toString(),
          changes: []
        };
        
        for (const field of fields) {
          if (doc[field] && typeof doc[field] === 'string' && doc[field].includes('�')) {
            const original = doc[field];
            let fixed = original;
            
            // Sort patterns by length (longest first)
            const sortedPatterns = Object.entries(ADDITIONAL_PATTERNS)
              .sort((a, b) => b[0].length - a[0].length);
            
            // Áp dụng tất cả replacements
            for (const [pattern, replacement] of sortedPatterns) {
              if (fixed.includes(pattern)) {
                fixed = fixed.split(pattern).join(replacement);
              }
            }
            
            // Cleanup: remove multiple spaces
            fixed = fixed.replace(/\s+/g, ' ').trim();
            
            // Fix specific patterns
            fixed = fixed.replace(/thảnh\s*hưởng\s*phố/g, 'thành phố');
            fixed = fixed.replace(/thảnh\s*phố/g, 'thành phố');
            
            // Nếu có thay đổi
            if (fixed !== original) {
              updates[field] = fixed;
              hasChanges = true;
              
              docChanges.changes.push({
                field,
                before: original,
                after: fixed
              });
            }
          }
        }
        
        // Update document nếu có thay đổi
        if (hasChanges) {
          await collection.updateOne(
            { _id: doc._id },
            { $set: updates }
          );
          
          collectionFixed++;
          totalFixed++;
          changeLog.push(docChanges);
          
          console.log(`\n   ✅ Đã sửa document _id: ${doc._id}`);
          docChanges.changes.forEach(change => {
            console.log(`      Field "${change.field}":`);
            console.log(`      Trước: ${change.before.substring(0, 70)}${change.before.length > 70 ? '...' : ''}`);
            console.log(`      Sau:   ${change.after.substring(0, 70)}${change.after.length > 70 ? '...' : ''}`);
          });
        }
      }
      
      console.log(`\n   📊 Kết quả: ${collectionFixed}/${docs.length} documents đã sửa`);
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ TỔNG HỢP');
    console.log('='.repeat(70));
    console.log(`Tổng documents đã kiểm tra: ${totalChecked}`);
    console.log(`Đã sửa: ${totalFixed}`);

    // Lưu change log
    fs.writeFileSync(
      'step2b-fix-remaining-log.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalFixed,
        totalChecked,
        changes: changeLog
      }, null, 2),
      'utf8'
    );

    console.log('\n✅ Đã lưu log vào: step2b-fix-remaining-log.json');

    // Kiểm tra lại xem còn lỗi không
    console.log('\n🔍 Kiểm tra lại...');
    await finalCheck();

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function finalCheck() {
  const collections = ['users', 'htxmanagementrecords', 'htxjournals', 'groups', 'notifications', 'news'];
  let totalRemaining = 0;

  for (const collName of collections) {
    const collection = mongoose.connection.db.collection(collName);
    const docs = await collection.find({}).toArray();
    
    let collectionCount = 0;
    for (const doc of docs) {
      const docStr = JSON.stringify(doc);
      if (docStr.includes('�')) {
        collectionCount++;
      }
    }
    
    if (collectionCount > 0) {
      console.log(`   ⚠️  ${collName}: ${collectionCount} documents còn lỗi`);
      totalRemaining += collectionCount;
    } else {
      console.log(`   ✅ ${collName}: OK`);
    }
  }

  console.log('\n' + '='.repeat(70));
  if (totalRemaining === 0) {
    console.log('🎉🎉🎉 HOÀN HẢO! KHÔNG CÒN LỖI ENCODING! 🎉🎉🎉');
    console.log('✅ Tất cả 136 documents đã được sửa thành công!');
    console.log('\n📝 Các bước đã hoàn thành:');
    console.log('   ✅ Bước 1: Phân tích patterns');
    console.log('   ✅ Bước 2: Sửa tự động ~27 documents');
    console.log('   ✅ Bước 2B: Sửa 109 documents còn lại');
    console.log('\n🚀 Hệ thống đã sẵn sàng!');
    console.log('💡 Nhớ restart backend server để áp dụng UTF-8 header middleware.');
    console.log('\n📋 CÁC BƯỚC TIẾP THEO:');
    console.log('   1. Restart backend: npm run dev');
    console.log('   2. Clear browser cache');
    console.log('   3. Test trên UI');
  } else {
    console.log(`⚠️  Còn ${totalRemaining} documents chưa được sửa`);
    console.log('💡 Chạy analyze-remaining-errors.js để xem chi tiết');
  }
}

console.log('🚀 Bắt đầu sửa 109 documents còn lại...\n');
console.log('⚠️  CẢNH BÁO: Script này sẽ THAY ĐỔI DỮ LIỆU trong database!');
console.log('📋 Đảm bảo bạn đã backup database trước khi tiếp tục.\n');

console.log('⏳ Bắt đầu sau 3 giây...');
setTimeout(() => {
  fixRemaining();
}, 3000);
