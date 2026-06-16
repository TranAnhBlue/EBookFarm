/**
 * Script sửa lỗi encoding UTF-8 trong database
 * 
 * Chuyển đổi: "Sáº¯n nhẫº¯t kÃ½ HTX máº›i" → "Sẵn nhật ký HTX mới"
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const iconv = require('iconv-lite');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';

// Danh sách collections cần kiểm tra (có thể chứa text tiếng Việt)
const COLLECTIONS_TO_FIX = [
  'users',
  'farmjournals', 
  'htxjournals',
  'formschemas',
  'groups',
  'news',
  'products',
  'productionbatches',
  'htxmanagementrecords',
  'consultations',
  'notifications'
];

// Danh sách fields thường chứa tiếng Việt
const TEXT_FIELDS = [
  'name', 'fullname', 'username', 'description', 'title', 
  'content', 'note', 'notes', 'reason', 'feedback', 'bio',
  'organization', 'address', 'province', 'ward', 'district',
  'farmName', 'productName', 'batchCode'
];

function fixEncoding(text) {
  if (typeof text !== 'string') return text;
  
  try {
    // Vấn đề NGƯỢC: Database đúng UTF-8, nhưng Frontend hiển thị sai
    // Cần decode UTF-8 bytes thành Latin1 string để frontend hiển thị đúng
    
    // Kiểm tra nếu text là UTF-8 thuần túy (không có byte sequence lỗi)
    const hasOnlyValidUtf8 = !/[\xC0-\xFF][\x80-\xBF]/.test(text) && 
                             !/[Ã¡Ã©Ã³ÃºÃ½ÄáºáÂ]/.test(text);
    
    if (hasOnlyValidUtf8) {
      // Text hiện tại là UTF-8 đúng
      // Chuyển thành Latin1 để frontend có thể đọc đúng
      const utf8Buffer = Buffer.from(text, 'utf8');
      return utf8Buffer.toString('latin1');
    }
    
    return text;
  } catch (error) {
    console.error(`   ⚠️  Không thể fix text: ${text.substring(0, 50)}`);
    return text;
  }
}

function fixObjectFields(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  let hasChanges = false;
  const fixed = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const [key, value] of Object.entries(fixed)) {
    if (typeof value === 'string' && TEXT_FIELDS.includes(key)) {
      const fixedValue = fixEncoding(value);
      if (fixedValue !== value) {
        fixed[key] = fixedValue;
        hasChanges = true;
      }
    } else if (typeof value === 'object' && value !== null) {
      const fixedNested = fixObjectFields(value);
      if (fixedNested !== value) {
        fixed[key] = fixedNested;
        hasChanges = true;
      }
    }
  }
  
  return hasChanges ? fixed : obj;
}

async function fixEncodingInCollection(collectionName) {
  console.log(`\n🔧 Đang sửa collection: ${collectionName}`);
  
  const collection = mongoose.connection.db.collection(collectionName);
  const cursor = collection.find({});
  
  let totalDocs = 0;
  let fixedDocs = 0;
  let errorDocs = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    totalDocs++;
    
    try {
      const fixed = fixObjectFields(doc);
      
      if (fixed !== doc) {
        const { _id, ...updateData } = fixed;
        await collection.updateOne({ _id: doc._id }, { $set: updateData });
        fixedDocs++;
        
        if (fixedDocs <= 5) {
          console.log(`   ✅ Đã sửa document _id: ${doc._id}`);
          
          // Hiển thị sample trước/sau
          for (const field of TEXT_FIELDS) {
            if (doc[field] && doc[field] !== fixed[field]) {
              console.log(`      "${field}": "${doc[field]}" → "${fixed[field]}"`);
            }
          }
        }
      }
    } catch (error) {
      errorDocs++;
      console.error(`   ❌ Lỗi khi sửa document _id ${doc._id}:`, error.message);
    }
  }
  
  console.log(`   📊 Kết quả: ${fixedDocs}/${totalDocs} documents đã được sửa`);
  if (errorDocs > 0) {
    console.log(`   ⚠️  ${errorDocs} documents gặp lỗi`);
  }
  
  return { total: totalDocs, fixed: fixedDocs, errors: errorDocs };
}

async function main() {
  try {
    console.log('🔍 Đang kết nối MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    const results = {
      totalDocs: 0,
      totalFixed: 0,
      totalErrors: 0
    };

    for (const collName of COLLECTIONS_TO_FIX) {
      try {
        const result = await fixEncodingInCollection(collName);
        results.totalDocs += result.total;
        results.totalFixed += result.fixed;
        results.totalErrors += result.errors;
      } catch (error) {
        console.error(`❌ Lỗi khi xử lý collection ${collName}:`, error.message);
      }
    }

    console.log(`\n\n📊 KẾT QUẢ TỔNG HỢP:`);
    console.log(`   Tổng documents: ${results.totalDocs}`);
    console.log(`   Đã sửa: ${results.totalFixed}`);
    console.log(`   Lỗi: ${results.totalErrors}`);
    
    if (results.totalFixed > 0) {
      console.log(`\n✅ Đã sửa xong! Vui lòng:`);
      console.log(`   1. Restart backend server`);
      console.log(`   2. Clear browser cache và reload trang`);
      console.log(`   3. Kiểm tra lại hiển thị tiếng Việt`);
    } else {
      console.log(`\n⚪ Không có gì cần sửa`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Đã ngắt kết nối MongoDB');
    process.exit(0);
  }
}

main();
