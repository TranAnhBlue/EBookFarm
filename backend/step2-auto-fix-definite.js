/**
 * BƯỚC 2: TỰ ĐỘNG SỬA CÁC PATTERNS CHẮC CHẮN
 * 
 * Script này sẽ:
 * 1. Sử dụng dictionary các patterns có độ tin cậy cao
 * 2. Tự động thay thế trong tất cả collections
 * 3. Lưu log các thay đổi
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const fs = require('fs');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// DICTIONARY CÁC PATTERNS CHẮC CHẮN (99% độ tin cậy)
const DEFINITE_REPLACEMENTS = {
  // Từ vựng cơ bản
  'H�p t�c x�': 'Hợp tác xã',
  'h�p t�c x�': 'hợp tác xã',
  'H�P T�C X�': 'HỢP TÁC XÃ',
  'HTX': 'HTX', // Giữ nguyên viết tắt
  
  // Chức danh
  'C�n b�': 'Cán bộ',
  'c�n b�': 'cán bộ',
  'Gi�m �ốc': 'Giám đốc',
  'gi�m �ốc': 'giám đốc',
  'GIÁM ��C': 'GIÁM ĐỐC',
  
  // Bộ phận
  'Ban k� thu�t': 'Ban kỹ thuật',
  'Ban K� thu�t': 'Ban Kỹ thuật',
  'k� thu�t': 'kỹ thuật',
  'K� thu�t': 'Kỹ thuật',
  'K� THU�T': 'KỸ THUẬT',
  
  'Ban ph�n ph�i': 'Ban phân phối',
  'Ban Ph�n ph�i': 'Ban Phân phối',
  'ph�n ph�i': 'phân phối',
  'Ph�n ph�i': 'Phân phối',
  'PH�N PH�I': 'PHÂN PHỐI',
  
  'Ban thanh tra': 'Ban thanh tra',
  'thanh tra': 'thanh tra',
  'Thanh tra': 'Thanh tra',
  
  'k� to�n': 'kế toán',
  'K� to�n': 'Kế toán',
  'K� TO�N': 'KẾ TOÁN',
  
  // Hành động
  'C�p nh�t': 'Cập nhật',
  'c�p nh�t': 'cập nhật',
  'C�P NH�T': 'CẬP NHẬT',
  
  'tr�ng th�i': 'trạng thái',
  'Tr�ng th�i': 'Trạng thái',
  'TR�NG TH�I': 'TRẠNG THÁI',
  
  's�': 'sổ',
  'S�': 'Sổ',
  's� s�ch': 'sổ sách',
  's� k� ho�ch': 'sổ kế hoạch',
  's� nh�t k�': 'sổ nhật ký',
  
  // Nông nghiệp
  'N�ng nghi�p': 'Nông nghiệp',
  'n�ng nghi�p': 'nông nghiệp',
  'N�NG NGHI�P': 'NÔNG NGHIỆP',
  
  'D�ch v�': 'Dịch vụ',
  'd�ch v�': 'dịch vụ',
  'D�CH V�': 'DỊCH VỤ',
  
  'N�ng cao': 'Nâng cao',
  'n�ng cao': 'nâng cao',
  
  'gi� tr�': 'giá trị',
  'Gi� tr�': 'Giá trị',
  'GI� TR�': 'GIÁ TRỊ',
  
  'n�ng s�n': 'nông sản',
  'N�ng s�n': 'Nông sản',
  'N�NG S�N': 'NÔNG SẢN',
  
  'xu�t kh�u': 'xuất khẩu',
  'Xu�t kh�u': 'Xuất khẩu',
  'XU�T KH�U': 'XUẤT KHẨU',
  
  'nh�p kh�u': 'nhập khẩu',
  'Nh�p kh�u': 'Nhập khẩu',
  
  'th� tr��ng': 'thị trường',
  'Th� tr��ng': 'Thị trường',
  'TH� TR��NG': 'THỊ TRƯỜNG',
  
  's�u ri�ng': 'sầu riêng',
  'S�u ri�ng': 'Sầu riêng',
  
  'c� ph�': 'cà phê',
  'C� ph�': 'Cà phê',
  'C� PH�': 'CÀ PHÊ',
  
  'truy xu�t': 'truy xuất',
  'Truy xu�t': 'Truy xuất',
  
  'ngu�n g�c': 'nguồn gốc',
  'Ngu�n g�c': 'Nguồn gốc',
  
  // Động vật
  'Ch�n nu�i': 'Chăn nuôi',
  'ch�n nu�i': 'chăn nuôi',
  'CH�N NU�I': 'CHĂN NUÔI',
  
  'b�': 'bò',
  'B�': 'Bò',
  'l�n': 'lợn',
  'L�n': 'Lợn',
  'g�': 'gà',
  'G�': 'Gà',
  'v�t': 'vịt',
  'V�t': 'Vịt',
  
  // Thủy sản
  'Th�y s�n': 'Thủy sản',
  'th�y s�n': 'thủy sản',
  'TH�Y S�N': 'THỦY SẢN',
  
  't�m': 'tôm',
  'T�m': 'Tôm',
  'c�': 'cá',
  'C�': 'Cá',
  
  // Địa danh thường gặp
  'Vi�t Nam': 'Việt Nam',
  'vi�t nam': 'việt nam',
  'VI�T NAM': 'VIỆT NAM',
  
  'H� N�i': 'Hà Nội',
  'h� n�i': 'hà nội',
  'H� N�I': 'HÀ NỘI',
  'ph� H� N�i': 'phố Hà Nội',
  'thảnh hưởng phố Hà Nội': 'thành phố Hà Nội',
  
  '��k L�k': 'Đắk Lắk',
  '��K L�K': 'ĐẮK LẮK',
  
  // Địa chỉ cụ thể - patterns dài trước
  'thảnh hưởng phố': 'thành phố',
  'thảnh hưởng ph�': 'thành phố',
  'x� B�t Tr�ng': 'xã Bát Tràng',
  'x� Bát Tràng': 'xã Bát Tràng',
  'x� �ng Bãi ven sông': 'xã Ông Bãi ven sông',
  'X� �ng ngoài Bãi': 'Xã Ông ngoài Bãi',
  '�ng D�': 'Ông Dừ',
  '�NG D�': 'ÔNG DỪ',
  'Th�n': 'Thôn',
  'TH�N': 'THÔN',
  'B�t': 'Bát',
  'Tr�ng': 'Tràng',
  's�ng': 'sông',
  'ven s�ng': 'ven sông',
  'ven sảng': 'ven sông',
  'B�i': 'Bãi',
  'H�': 'Hạ',
  'ngo�i': 'ngoài',
  'x�': 'xã',
  'X�': 'Xã',
  '�ng': 'Ông',
  'ph�': 'phố',
  'PH�': 'PHỐ',
  
  // Tên địa danh Tây Nguyên
  'Kr�ng': 'Krông',
  'P�c': 'Păk',
  'Kr�ng P�c': 'Krông Păk',
  
  // Từ Hán Việt
  'Qu�c': 'Quốc',
  'qu�c': 'quốc',
  'QU�C': 'QUỐC',
  'Trung Qu�c': 'Trung Quốc',
  
  // Patterns còn thiếu
  'nh�n': 'nhân',
  'NH�N': 'NHÂN',
  'cá nh�n': 'cá nhân',
  
  // Cụm từ HTX
  'HTX D�CH V� N�NG NGHI�P': 'HTX DỊCH VỤ NÔNG NGHIỆP',
  'H�p t�c x� D�ch v� N�ng nghi�p': 'Hợp tác xã Dịch vụ Nông nghiệp',
  
  // 19 patterns còn thiếu - bổ sung đầy đủ
  'Bòn': 'Bản',
  'bòn': 'bản',
  'BÒN': 'BẢN',
  'Bòt': 'Bát',
  'bòt': 'bát',
  'BÒT': 'BÁT',
  'Bòi': 'Bãi',
  'bòi': 'bãi',
  'BÒI': 'BÃI',
  'thảnh': 'thành',
  'hưởng ph�': 'phố',
  'thảnh hưởng ph�': 'thành phố',
  'sảng': 'sông',
  'SẢNG': 'SÔNG',
  'ven sảng': 'ven sông',
  'soít': 'soát',
  'SOÍT': 'SOÁT',
  'ki�m soít': 'kiểm soát',
  'mảnh': 'mạnh',
  'mảnh hưởng': 'mạnh',
  'uy mảnh': 'uy mạnh',
  'uy mảnh hưởng': 'uy mạnh',
  
  // Patterns từ trước
  'B�n': 'Bản',
  'h�ng': 'hạng',
  'B�n h�ng': 'Bản hạng',
  'B�n tin': 'Bản tin',
  'sổn': 'sản',
  'n�ng sổn': 'nông sản',
  'sổu': 'sầu',
  'sổu ri�ng': 'sầu riêng',
  'Gi�': 'Giá',
  'gi�': 'giá',
  'v�': 'và',
  'V�': 'Và',
  '�t': 'ít',
  '�nh': 'ảnh hưởng',
  '�t �nh': 'ít ảnh hưởng',
  'tu�n': 'tuần',
  'trong tu�n': 'trong tuần',
  'qua': 'qua',
  'Nh�t': 'Nhật',
  'nh�t': 'nhật',
  'k�': 'ký',
  'K�': 'Ký',
  'Nh�t k�': 'Nhật ký',
  'nh�t k�': 'nhật ký',
  'cá nh�n': 'cá nhân',
  'gài': 'gửi',
  'duy�t': 'duyệt',
  'gài duy�t': 'gửi duyệt',
  'ki�m': 'kiểm',
  'so�t': 'soát',
  'ki�m so�t': 'kiểm soát',
  '�y': 'uy',
  'm�nh': 'mãnh',
  '�y m�nh': 'uy mãnh',
  
  // Thêm các patterns đơn lẻ còn thiếu
  'h�a': 'hóa',
  'H�A': 'HÓA',
  'hạng h�a': 'hạng hóa',
  'ri�ng': 'riêng',
  'RI�NG': 'RIÊNG',
  'sầu ri�ng': 'sầu riêng',
  's�u ri�ng': 'sầu riêng',
  'm�:i': 'mới',
  'M�:I': 'MỚI',
  'sổ"': 'sổ',
  'Sổ"': 'Sổ',
  'T�o': 'Tạo',
  't�o': 'tạo',
  'T�O': 'TẠO',
  't�': 'tờ',
  'T�': 'Tờ',
  'T�o t�': 'Tạo tờ',
  '�i': 'trình',
  '�I': 'TRÌNH',
  't� �i': 'tờ trình',
  
  // Thông báo hệ thống
  'C�p nh�t tr�ng th�i s�': 'Cập nhật trạng thái sổ',
  'Th�m m�i': 'Thêm mới',
  'th�m m�i': 'thêm mới',
  'Ch�nh s�a': 'Chỉnh sửa',
  'ch�nh s�a': 'chỉnh sửa',
  'X�a': 'Xóa',
  'x�a': 'xóa',
  
  // Thời gian
  'ng�y': 'ngày',
  'Ng�y': 'Ngày',
  'th�ng': 'tháng',
  'Th�ng': 'Tháng',
  'n�m': 'năm',
  'N�m': 'Năm',
};

const COLLECTIONS_TO_FIX = [
  { name: 'users', fields: ['fullname', 'organization', 'address'] },
  { name: 'htxmanagementrecords', fields: ['title', 'description', 'content'] },
  { name: 'htxjournals', fields: ['name', 'description', 'content'] },
  { name: 'groups', fields: ['name', 'description'] },
  { name: 'notifications', fields: ['title', 'message', 'content'] },
  { name: 'news', fields: ['title', 'content', 'summary'] },
];

const changeLog = [];

async function autoFixDefinite() {
  try {
    console.log('🔧 BƯỚC 2: TỰ ĐỘNG SỬA CÁC PATTERNS CHẮC CHẮN');
    console.log('='.repeat(70));
    console.log(`📚 Dictionary: ${Object.keys(DEFINITE_REPLACEMENTS).length} patterns\n`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB\n');

    let totalFixed = 0;
    let totalChecked = 0;

    for (const collectionInfo of COLLECTIONS_TO_FIX) {
      const { name: collName, fields } = collectionInfo;
      
      console.log(`\n📂 Đang xử lý collection: ${collName}`);
      console.log('   Fields: ' + fields.join(', '));
      
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
            
            // Sort patterns by length (longest first) để tránh replace nhầm
            const sortedPatterns = Object.entries(DEFINITE_REPLACEMENTS)
              .sort((a, b) => b[0].length - a[0].length);
            
            // Áp dụng tất cả replacements
            for (const [pattern, replacement] of sortedPatterns) {
              if (fixed.includes(pattern)) {
                fixed = fixed.split(pattern).join(replacement);
              }
            }
            
            // Nếu có thay đổi
            if (fixed !== original) {
              updates[field] = fixed;
              hasChanges = true;
              
              docChanges.changes.push({
                field,
                before: original.substring(0, 100),
                after: fixed.substring(0, 100)
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
          
          // Hiển thị một vài ví dụ
          if (collectionFixed <= 3) {
            console.log(`\n   ✅ Đã sửa document _id: ${doc._id}`);
            docChanges.changes.forEach(change => {
              console.log(`      Field "${change.field}":`);
              console.log(`      Trước: ${change.before}${change.before.length >= 100 ? '...' : ''}`);
              console.log(`      Sau:   ${change.after}${change.after.length >= 100 ? '...' : ''}`);
            });
          }
        }
      }
      
      console.log(`\n   📊 Kết quả: ${collectionFixed}/${docs.length} documents đã sửa`);
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('📊 KẾT QUẢ TỔNG HỢP');
    console.log('='.repeat(70));
    console.log(`Tổng documents đã kiểm tra: ${totalChecked}`);
    console.log(`Đã sửa tự động: ${totalFixed}`);
    console.log(`Tỷ lệ: ${((totalFixed / totalChecked) * 100).toFixed(1)}%`);

    // Lưu change log
    fs.writeFileSync(
      'step2-auto-fix-log.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        totalFixed,
        totalChecked,
        changes: changeLog
      }, null, 2),
      'utf8'
    );

    console.log('\n✅ Đã lưu log vào: step2-auto-fix-log.json');
    console.log('\n💡 Tiếp theo: Chạy step3-generate-review-list.js để xem các documents còn lại cần review');

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

console.log('🚀 Bắt đầu sửa tự động...\n');
console.log('⚠️  CẢNH BÁO: Script này sẽ THAY ĐỔI DỮ LIỆU trong database!');
console.log('📋 Đảm bảo bạn đã backup database trước khi tiếp tục.\n');

// Delay 3 giây để user có thể Ctrl+C nếu muốn hủy
console.log('⏳ Bắt đầu sau 3 giây...');
setTimeout(() => {
  autoFixDefinite();
}, 3000);
