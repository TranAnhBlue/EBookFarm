/**
 * BƯỚC 3: TẠO DANH SÁCH CẦN REVIEW THỦ CÔNG
 * 
 * Script này sẽ:
 * 1. Tìm các documents còn có ký tự � (sau khi chạy step 2)
 * 2. Đưa ra suggestions cho các patterns không chắc chắn
 * 3. Export ra file CSV để review thủ công
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// DICTIONARY CÁC PATTERNS KHÔNG CHẮC CHẮN (cần review)
const UNCERTAIN_PATTERNS = {
  'B�n h�ng': {
    suggestions: ['Bàn họng', 'Bản hạng', 'Bán hàng'],
    note: 'Cần context để xác định'
  },
  'c� tra': {
    suggestions: ['cà tra', 'cỏ trà', 'có tra'],
    note: 'Tên loại cây hoặc địa danh?'
  },
  '�NG D�': {
    suggestions: ['ÔNG DƯ', 'ÔNG ĐƯ', 'ỨNG DỤ'],
    note: 'Địa danh - cần kiểm tra chính xác'
  },
  'Kr�ng P�c': {
    suggestions: ['Krông Păk', 'Krông Pắc', 'Krông Păc'],
    note: 'Địa danh Tây Nguyên'
  },
  '�y m�nh': {
    suggestions: ['uy mãnh', 'ấy mình', 'ấy mạnh'],
    note: 'Cần context'
  },
  '�t �nh': {
    suggestions: ['ít ảnh', 'ảnh hưởng', 'ít ảnh hưởng'],
    note: 'Có thể là "ít ảnh hưởng"'
  },
  'trong t�': {
    suggestions: ['trong tháng', 'trong tuần', 'trong tài'],
    note: 'Thời gian hoặc tài liệu?'
  }
};

const COLLECTIONS_TO_CHECK = [
  { name: 'users', fields: ['fullname', 'organization', 'address'], idField: 'email' },
  { name: 'htxmanagementrecords', fields: ['title', 'description'], idField: 'title' },
  { name: 'htxjournals', fields: ['name', 'description'], idField: 'name' },
  { name: 'groups', fields: ['name', 'description'], idField: 'name' },
  { name: 'notifications', fields: ['title', 'message'], idField: 'title' },
  { name: 'news', fields: ['title', 'content', 'summary'], idField: 'title' },
];

async function generateReviewList() {
  try {
    console.log('📝 BƯỚC 3: TẠO DANH SÁCH CẦN REVIEW');
    console.log('='.repeat(70));
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    const reviewItems = [];
    let totalRemaining = 0;

    for (const collectionInfo of COLLECTIONS_TO_CHECK) {
      const { name: collName, fields, idField } = collectionInfo;
      
      console.log(`\n📂 Đang kiểm tra collection: ${collName}`);
      
      const collection = mongoose.connection.db.collection(collName);
      const docs = await collection.find({}).toArray();
      
      let collectionRemaining = 0;
      
      for (const doc of docs) {
        for (const field of fields) {
          if (doc[field] && typeof doc[field] === 'string' && doc[field].includes('�')) {
            collectionRemaining++;
            totalRemaining++;
            
            const currentValue = doc[field];
            const suggestions = findSuggestions(currentValue);
            
            reviewItems.push({
              collection: collName,
              _id: doc._id.toString(),
              identifier: doc[idField] || doc._id.toString(),
              field,
              currentValue: currentValue.substring(0, 200),
              fullValue: currentValue,
              suggestions: suggestions.join(' | '),
              note: getNote(currentValue),
              status: 'PENDING'
            });
            
            // Hiển thị một vài ví dụ
            if (collectionRemaining <= 3) {
              console.log(`\n   ⚠️  Document _id: ${doc._id}`);
              console.log(`      Field: ${field}`);
              console.log(`      Hiện tại: ${currentValue.substring(0, 80)}${currentValue.length > 80 ? '...' : ''}`);
              console.log(`      Gợi ý: ${suggestions.join(', ')}`);
            }
          }
        }
      }
      
      console.log(`\n   📊 Còn lại: ${collectionRemaining} fields cần review`);
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ');
    console.log('='.repeat(70));
    console.log(`Tổng items cần review: ${totalRemaining}`);

    if (totalRemaining === 0) {
      console.log('\n🎉 HOÀN HẢO! Không còn lỗi encoding nào!');
      console.log('✅ Tất cả đã được sửa tự động trong bước 2.');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    // Export ra CSV
    const csvHeader = 'Collection,ID,Identifier,Field,Current Value,Suggestions,Note,Your Fix,Status\n';
    const csvRows = reviewItems.map(item => {
      return [
        item.collection,
        item._id,
        escapeCSV(item.identifier),
        item.field,
        escapeCSV(item.currentValue),
        escapeCSV(item.suggestions),
        escapeCSV(item.note),
        '', // Your Fix - để trống cho user điền
        item.status
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    fs.writeFileSync('step3-review-list.csv', csvContent, 'utf8');

    // Export ra JSON (dễ đọc hơn)
    fs.writeFileSync(
      'step3-review-list.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalItems: totalRemaining,
        items: reviewItems
      }, null, 2),
      'utf8'
    );

    console.log('\n✅ Đã tạo file review:');
    console.log('   - step3-review-list.csv (dùng Excel/Google Sheets)');
    console.log('   - step3-review-list.json (dễ đọc)');
    
    console.log('\n📋 HƯỚNG DẪN:');
    console.log('   1. Mở file step3-review-list.csv bằng Excel');
    console.log('   2. Cột "Current Value" là giá trị hiện tại (có lỗi)');
    console.log('   3. Cột "Suggestions" là các gợi ý');
    console.log('   4. Điền giá trị ĐÚNG vào cột "Your Fix"');
    console.log('   5. Đổi Status thành "APPROVED" cho các dòng đã sửa');
    console.log('   6. Lưu file và chạy step4-apply-reviewed-fixes.js');
    
    console.log('\n💡 Tips:');
    console.log('   - Nếu không chắc chắn, để trống "Your Fix" và Status = "SKIP"');
    console.log('   - Có thể Google tên địa danh để kiểm tra chính xác');
    console.log('   - Xem context trong cột "Current Value" để đoán đúng');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

function findSuggestions(text) {
  const suggestions = [];
  
  // Tìm trong dictionary UNCERTAIN_PATTERNS
  for (const [pattern, data] of Object.entries(UNCERTAIN_PATTERNS)) {
    if (text.includes(pattern)) {
      suggestions.push(...data.suggestions);
    }
  }
  
  // Nếu không có trong dictionary, đưa ra suggestions chung
  if (suggestions.length === 0) {
    // Phân tích context
    if (text.match(/^[A-Z�]/)) {
      suggestions.push('[Tên riêng - cần tra cứu]');
    }
    if (text.includes('HTX') || text.includes('H�p t�c')) {
      suggestions.push('[Liên quan HTX]');
    }
    if (text.match(/\d/)) {
      suggestions.push('[Có số - có thể là địa chỉ/mã]');
    }
  }
  
  return suggestions.length > 0 ? suggestions : ['[Cần xem context để xác định]'];
}

function getNote(text) {
  // Tìm note từ dictionary
  for (const [pattern, data] of Object.entries(UNCERTAIN_PATTERNS)) {
    if (text.includes(pattern)) {
      return data.note;
    }
  }
  
  // Gợi ý chung
  if (text.length < 20) {
    return 'Text ngắn - có thể là tên riêng';
  }
  if (text.includes('�') && text.split('�').length > 5) {
    return 'Nhiều lỗi - xem kỹ context';
  }
  return 'Xem context để xác định';
}

function escapeCSV(str) {
  if (!str) return '';
  // Escape quotes và wrap trong quotes nếu có comma
  const escaped = str.toString().replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
}

console.log('🚀 Bắt đầu tạo danh sách review...\n');
generateReviewList();
