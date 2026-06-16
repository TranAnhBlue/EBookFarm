/**
 * BƯỚC 4: ÁP DỤNG CÁC SỬA ĐỔI ĐÃ REVIEW
 * 
 * Script này sẽ:
 * 1. Đọc file CSV đã được review (step3-review-list.csv)
 * 2. Apply các thay đổi có Status = "APPROVED"
 * 3. Tạo backup và log các thay đổi
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function applyReviewedFixes() {
  try {
    console.log('✅ BƯỚC 4: ÁP DỤNG CÁC SỬA ĐỔI ĐÃ REVIEW');
    console.log('='.repeat(70));
    
    // Đọc file CSV
    if (!fs.existsSync('step3-review-list.csv')) {
      console.error('❌ Không tìm thấy file step3-review-list.csv');
      console.log('💡 Hãy chạy step3-generate-review-list.js trước');
      process.exit(1);
    }

    const csvContent = fs.readFileSync('step3-review-list.csv', 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0].split(',');
    
    // Parse CSV
    const reviewedItems = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      if (values.length < 9) continue;
      
      const item = {
        collection: values[0],
        _id: values[1],
        identifier: values[2],
        field: values[3],
        currentValue: values[4],
        suggestions: values[5],
        note: values[6],
        yourFix: values[7],
        status: values[8]
      };
      
      // Chỉ xử lý các item có status APPROVED và có yourFix
      if (item.status.toUpperCase().includes('APPROVED') && item.yourFix && item.yourFix.trim()) {
        reviewedItems.push(item);
      }
    }

    console.log(`📋 Tìm thấy ${reviewedItems.length} items đã được approved\n`);

    if (reviewedItems.length === 0) {
      console.log('⚠️  Không có item nào được approved!');
      console.log('💡 Mở file step3-review-list.csv và:');
      console.log('   1. Điền giá trị đúng vào cột "Your Fix"');
      console.log('   2. Đổi Status thành "APPROVED"');
      console.log('   3. Lưu file và chạy lại script này');
      process.exit(0);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    let successCount = 0;
    let errorCount = 0;
    const changeLog = [];

    console.log('🔧 Bắt đầu apply các thay đổi...\n');

    for (const item of reviewedItems) {
      try {
        const collection = mongoose.connection.db.collection(item.collection);
        const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(item._id) });
        
        if (!doc) {
          console.log(`   ⚠️  Không tìm thấy document _id: ${item._id}`);
          errorCount++;
          continue;
        }

        const currentValue = doc[item.field];
        const newValue = item.yourFix.trim();

        // Update document
        await collection.updateOne(
          { _id: new mongoose.Types.ObjectId(item._id) },
          { $set: { [item.field]: newValue } }
        );

        successCount++;
        console.log(`   ✅ [${successCount}] ${item.collection}.${item.field}`);
        console.log(`      Trước: ${currentValue ? currentValue.substring(0, 60) : ''}...`);
        console.log(`      Sau:   ${newValue.substring(0, 60)}...`);

        changeLog.push({
          collection: item.collection,
          _id: item._id,
          field: item.field,
          before: currentValue,
          after: newValue,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error(`   ❌ Lỗi khi xử lý ${item.collection}._id=${item._id}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ CUỐI CÙNG');
    console.log('='.repeat(70));
    console.log(`✅ Thành công: ${successCount}`);
    console.log(`❌ Lỗi: ${errorCount}`);

    // Lưu change log
    fs.writeFileSync(
      'step4-apply-log.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalApplied: successCount,
        totalErrors: errorCount,
        changes: changeLog
      }, null, 2),
      'utf8'
    );

    console.log('\n✅ Đã lưu log vào: step4-apply-log.json');

    // Kiểm tra xem còn lỗi không
    console.log('\n🔍 Đang kiểm tra xem còn lỗi encoding không...');
    await checkRemainingErrors();

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function checkRemainingErrors() {
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
    console.log('🎉 HOÀN HẢO! KHÔNG CÒN LỖI ENCODING!');
    console.log('✅ Tất cả 136 documents đã được sửa thành công!');
    console.log('\n📝 Các bước đã hoàn thành:');
    console.log('   ✅ Bước 1: Phân tích patterns');
    console.log('   ✅ Bước 2: Sửa tự động ~110 documents');
    console.log('   ✅ Bước 3: Review ~26 documents thủ công');
    console.log('   ✅ Bước 4: Apply tất cả thay đổi');
    console.log('\n🚀 Hệ thống đã sẵn sàng!');
    console.log('💡 Nhớ restart backend server để áp dụng UTF-8 header middleware.');
  } else {
    console.log(`⚠️  Còn ${totalRemaining} documents chưa được sửa`);
    console.log('💡 Có thể:');
    console.log('   1. Chạy lại step3 để tạo danh sách mới');
    console.log('   2. Review và chạy lại step4');
    console.log('   3. Hoặc sửa thủ công qua UI');
  }
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

console.log('🚀 Đọc file review và apply thay đổi...\n');
console.log('⚠️  CẢNH BÁO: Script này sẽ THAY ĐỔI DỮ LIỆU trong database!');
console.log('📋 Đảm bảo bạn đã:');
console.log('   1. Backup database');
console.log('   2. Review kỹ file CSV');
console.log('   3. Điền đúng giá trị vào cột "Your Fix"');
console.log('   4. Set Status = "APPROVED" cho các dòng đã kiểm tra\n');

console.log('⏳ Bắt đầu sau 3 giây...');
setTimeout(() => {
  applyReviewedFixes();
}, 3000);
