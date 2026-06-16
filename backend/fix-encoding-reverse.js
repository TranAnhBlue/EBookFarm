/**
 * Script sửa encoding - Hướng ngược
 * 
 * Nếu database đang lưu đúng UTF-8 nhưng frontend hiển thị sai,
 * đây KHÔNG phải giải pháp đúng!
 * 
 * Chỉ chạy script này nếu:
 * - test-encoding-simple.js xác nhận "WRITE/READ OK"
 * - Nhưng data cũ vẫn bị lỗi (do import từ source sai encoding)
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const COLLECTIONS_TO_FIX = [
  'users',
  'htxmanagementrecords',
  'farmjournals',
  'htxjournals',
  'groups',
  'notifications'
];

const TEXT_FIELDS = [
  'name', 'fullname', 'username', 'title', 'description', 
  'content', 'note', 'notes', 'reason', 'feedback', 'bio',
  'organization', 'address', 'province', 'ward',
  'farmName', 'productName', 'message'
];

function detectAndFixEncoding(text) {
  if (typeof text !== 'string' || text.length === 0) return text;
  
  try {
    // Kiểm tra xem có byte sequence lỗi encoding không
    // Pattern: vá»«a, táº¡o, sá»•, káº¿, etc.
    const hasBrokenPattern = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i.test(text) === false &&
                            (/á»|áº|Ä'|Ă|Æ°|â€|Ã¡|Ã©|Ã³|Ãº|Ã½/).test(text);
    
    if (hasBrokenPattern) {
      // Text hiện tại: "vá»«a táº¡o sá»•" (double-encoded UTF-8)
      // Cần decode: Latin-1 bytes → UTF-8 string
      
      // Bước 1: Chuyển string thành buffer với encoding latin1
      const latin1Buffer = Buffer.from(text, 'latin1');
      
      // Bước 2: Đọc buffer như UTF-8
      const utf8String = latin1Buffer.toString('utf-8');
      
      // Bước 3: Verify kết quả có đúng không
      const hasProperVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(utf8String);
      
      if (hasProperVietnamese) {
        return utf8String;
      }
    }
    
    // Nếu không match pattern lỗi, giữ nguyên
    return text;
    
  } catch (error) {
    return text;
  }
}

function fixObjectFields(obj, path = '') {
  if (!obj || typeof obj !== 'object') return { obj, changed: false };
  
  let hasChanges = false;
  const fixed = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const [key, value] of Object.entries(fixed)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'string' && TEXT_FIELDS.includes(key)) {
      const fixedValue = detectAndFixEncoding(value);
      if (fixedValue !== value) {
        fixed[key] = fixedValue;
        hasChanges = true;
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const { obj: fixedNested, changed } = fixObjectFields(value, currentPath);
      if (changed) {
        fixed[key] = fixedNested;
        hasChanges = true;
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          const { obj: fixedItem, changed } = fixObjectFields(item, `${currentPath}[${index}]`);
          if (changed) {
            fixed[key][index] = fixedItem;
            hasChanges = true;
          }
        }
      });
    }
  }
  
  return { obj: fixed, changed: hasChanges };
}

async function fixCollection(collectionName) {
  console.log(`\n🔧 Đang sửa collection: ${collectionName}`);
  
  const collection = mongoose.connection.db.collection(collectionName);
  const cursor = collection.find({});
  
  let totalDocs = 0;
  let fixedDocs = 0;
  let samplesShown = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    totalDocs++;
    
    try {
      const { obj: fixed, changed } = fixObjectFields(doc);
      
      if (changed) {
        const { _id, ...updateData } = fixed;
        await collection.updateOne({ _id: doc._id }, { $set: updateData });
        fixedDocs++;
        
        // Hiển thị 3 samples đầu
        if (samplesShown < 3) {
          console.log(`   ✅ Sửa document _id: ${doc._id}`);
          
          for (const field of TEXT_FIELDS) {
            if (doc[field] && doc[field] !== fixed[field]) {
              console.log(`      "${field}":`);
              console.log(`         Trước: ${doc[field].substring(0, 60)}`);
              console.log(`         Sau:   ${fixed[field].substring(0, 60)}`);
            }
          }
          samplesShown++;
        }
      }
    } catch (error) {
      console.error(`   ❌ Lỗi document ${doc._id}:`, error.message);
    }
  }
  
  console.log(`   📊 Kết quả: ${fixedDocs}/${totalDocs} documents đã sửa`);
  return { total: totalDocs, fixed: fixedDocs };
}

async function main() {
  try {
    console.log('🔍 Kết nối MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối\n');

    console.log('⚠️  CẢNH BÁO: Script này sẽ SỬA DỮ LIỆU trong database!');
    console.log('📋 Đảm bảo bạn đã:');
    console.log('   1. Backup database');
    console.log('   2. Chạy test-encoding-simple.js trước');
    console.log('   3. Hiểu rõ vấn đề encoding của mình\n');
    
    console.log('⏳ Bắt đầu sau 5 giây...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const results = { totalDocs: 0, totalFixed: 0 };

    for (const collName of COLLECTIONS_TO_FIX) {
      try {
        const result = await fixCollection(collName);
        results.totalDocs += result.total;
        results.totalFixed += result.fixed;
      } catch (error) {
        console.error(`❌ Lỗi collection ${collName}:`, error.message);
      }
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 KẾT QUẢ TỔNG HỢP:');
    console.log('='.repeat(60));
    console.log(`   Tổng documents: ${results.totalDocs}`);
    console.log(`   Đã sửa: ${results.totalFixed}`);
    
    if (results.totalFixed > 0) {
      console.log(`\n✅ Hoàn tất! Bây giờ:`);
      console.log(`   1. Restart backend server`);
      console.log(`   2. Clear browser cache`);
      console.log(`   3. Kiểm tra lại UI`);
    } else {
      console.log(`\n⚪ Không có gì cần sửa`);
      console.log(`\n💡 Nếu UI vẫn hiển thị sai:`);
      console.log(`   → Vấn đề KHÔNG phải ở database`);
      console.log(`   → Kiểm tra API response headers`);
      console.log(`   → Kiểm tra frontend decode`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB\n');
    process.exit(0);
  }
}

main();
