/**
 * Debug encoding - Xem raw bytes
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function debugBytes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Đã kết nối\n');

    const Users = mongoose.connection.db.collection('users');
    const htxUser = await Users.findOne({ role: /htx/i });
    
    if (!htxUser || !htxUser.fullname) {
      console.log('❌ Không tìm thấy user HTX có fullname');
      return;
    }

    const text = htxUser.fullname;
    
    console.log('📊 PHÂN TÍCH ENCODING CHI TIẾT');
    console.log('='.repeat(70));
    console.log('Text hiển thị:', text);
    console.log('Length:', text.length);
    console.log('');
    
    // Show bytes
    console.log('Raw bytes (hex):');
    const buffer = Buffer.from(text, 'utf8');
    console.log(buffer.toString('hex').match(/.{1,2}/g).join(' '));
    console.log('');
    
    // Show char codes
    console.log('Char codes:');
    for (let i = 0; i < Math.min(text.length, 20); i++) {
      const char = text[i];
      const code = text.charCodeAt(i);
      console.log(`  [${i}] '${char}' → U+${code.toString(16).toUpperCase().padStart(4, '0')} (${code})`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🧪 THỬ CÁC CÁCH DECODE:');
    console.log('='.repeat(70));
    
    // Thử 1: UTF-8 buffer → Latin1 string
    try {
      const attempt1 = Buffer.from(text, 'utf8').toString('latin1');
      console.log('\n1️⃣  UTF-8 → Latin1:');
      console.log('   ', attempt1.substring(0, 50));
    } catch (e) {
      console.log('1️⃣  Failed:', e.message);
    }
    
    // Thử 2: Latin1 buffer → UTF-8 string
    try {
      const attempt2 = Buffer.from(text, 'latin1').toString('utf8');
      console.log('\n2️⃣  Latin1 → UTF-8:');
      console.log('   ', attempt2.substring(0, 50));
      
      // Check if this looks correct
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(attempt2);
      if (hasVietnamese) {
        console.log('   ✅ CÓ TIẾNG VIỆT CHUẨN!');
      }
    } catch (e) {
      console.log('2️⃣  Failed:', e.message);
    }
    
    // Thử 3: Decode từng byte như Latin1
    try {
      const bytes = [];
      for (let i = 0; i < text.length; i++) {
        bytes.push(text.charCodeAt(i));
      }
      const attempt3 = Buffer.from(bytes).toString('utf8');
      console.log('\n3️⃣  Byte array → UTF-8:');
      console.log('   ', attempt3.substring(0, 50));
      
      const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(attempt3);
      if (hasVietnamese) {
        console.log('   ✅ CÓ TIẾNG VIỆT CHUẨN!');
      }
    } catch (e) {
      console.log('3️⃣  Failed:', e.message);
    }
    
    // Thử 4: iconv-lite (nếu có)
    try {
      const iconv = require('iconv-lite');
      const attempt4 = iconv.decode(Buffer.from(text, 'binary'), 'utf8');
      console.log('\n4️⃣  iconv-lite binary → UTF-8:');
      console.log('   ', attempt4.substring(0, 50));
    } catch (e) {
      console.log('\n4️⃣  iconv-lite not available or failed');
    }

    console.log('\n\n' + '='.repeat(70));
    console.log('💡 PHÂN TÍCH:');
    console.log('='.repeat(70));
    
    // Phát hiện pattern
    if (/H.p t.c x/.test(text)) {
      console.log('Pattern phát hiện: "H?p t?c x?" (replacement characters)');
      console.log('→ Dữ liệu đã BỊ MẤT khi lưu vào database');
      console.log('→ KHÔNG THỂ phục hồi bằng decode');
      console.log('→ Cần nhập lại dữ liệu gốc');
    } else if (/[Ã¡Ã©Ã³Ãº]/.test(text)) {
      console.log('Pattern phát hiện: Double-encoded UTF-8');
      console.log('→ Có thể fix bằng: Latin1 → UTF-8');
    } else {
      console.log('Pattern: Không xác định');
      console.log('→ Cần xem raw bytes để phân tích');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugBytes();
