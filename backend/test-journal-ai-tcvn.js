const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const testJournalAI = async () => {
  try {
    console.log('🤖 Test Journal AI với schema TCVN...');
    
    // Lấy schema TCVN
    const tcvnSchema = await FormSchema.findOne({ name: /TCVN/ });
    
    if (!tcvnSchema) {
      console.log('❌ Không tìm thấy schema TCVN');
      return;
    }
    
    console.log(`✅ Tìm thấy schema: ${tcvnSchema.name}`);
    console.log(`📋 ID: ${tcvnSchema._id}`);
    
    // Test với các trường khác nhau
    const testCases = [
      {
        fieldName: 'tenVatTu',
        fieldValue: 'Phân NPK 16-16-8',
        description: 'Test gợi ý cho phân bón'
      },
      {
        fieldName: 'congViec', 
        fieldValue: 'Phun thuốc trừ sâu',
        description: 'Test gợi ý cho công việc phun thuốc'
      },
      {
        fieldName: 'mucDichSuDung',
        fieldValue: 'Diệt sâu cuốn lá',
        description: 'Test gợi ý cho mục đích sử dụng thuốc'
      },
      {
        fieldName: 'chatLuongSanPham',
        fieldValue: 'Không đạt',
        description: 'Test cảnh báo khi chất lượng không đạt'
      }
    ];
    
    console.log('\n🧪 Chạy test cases...\n');
    
    for (const testCase of testCases) {
      console.log(`📝 ${testCase.description}`);
      console.log(`   Trường: ${testCase.fieldName}`);
      console.log(`   Giá trị: ${testCase.fieldValue}`);
      
      try {
        // Test API endpoint
        const response = await fetch('http://localhost:5000/api/journal-ai-test-suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            schemaId: tcvnSchema._id,
            fieldName: testCase.fieldName,
            fieldValue: testCase.fieldValue,
            schemaCategory: 'trongtrot'
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          console.log(`   ✅ Gợi ý: ${data.data.suggestions[0]}`);
        } else {
          console.log(`   ❌ Lỗi: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ Lỗi kết nối: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎯 Test hoàn thành!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

testJournalAI();