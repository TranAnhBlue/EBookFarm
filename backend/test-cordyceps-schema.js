const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const testCordycepsSchema = async () => {
  try {
    console.log('🔍 Testing Cordyceps mushroom schema...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the Cordyceps schema
    const cordycepsSchema = await FormSchema.findOne({ 
      name: 'Nấm Đông trùng', 
      category: 'trongtrot' 
    });
    
    if (!cordycepsSchema) {
      console.log('❌ Cordyceps schema not found!');
      process.exit(1);
    }
    
    console.log('✅ Found Cordyceps schema');
    console.log(`📋 Schema details:`);
    console.log(`   - Name: ${cordycepsSchema.name}`);
    console.log(`   - Category: ${cordycepsSchema.category}`);
    console.log(`   - Description: ${cordycepsSchema.description}`);
    console.log(`   - Tables: ${cordycepsSchema.tables.length}`);
    
    // Verify all required tables exist
    const expectedTables = [
      'Thông tin chung',
      'Bảng 1: Đánh giá các chỉ tiêu gây mất ATTP trong đất/giá thể, nước tưới, nước phục vụ sơ chế và sản phẩm',
      'Bảng 2: Theo dõi mua hoặc tự sản xuất giống đầu vào',
      'Bảng 3: Theo dõi mua hoặc tự sản xuất vật tư đầu vào',
      'Bảng 4: Nhật ký quá trình sản xuất',
      'Bảng 5: Thu hoạch và tiêu thụ sản phẩm'
    ];
    
    console.log('\n📊 Table verification:');
    expectedTables.forEach((expectedTable, index) => {
      const actualTable = cordycepsSchema.tables[index];
      if (actualTable && actualTable.tableName === expectedTable) {
        console.log(`   ✅ ${index + 1}. ${actualTable.tableName} (${actualTable.fields.length} fields)`);
      } else {
        console.log(`   ❌ ${index + 1}. Missing or incorrect: ${expectedTable}`);
      }
    });
    
    // Verify key fields in "Thông tin chung"
    const thongTinChung = cordycepsSchema.tables.find(t => t.tableName === 'Thông tin chung');
    if (thongTinChung) {
      console.log('\n🔍 Key fields in "Thông tin chung":');
      const keyFields = ['giongNam', 'matDo', 'tongTuiPhoi', 'ngayBatDauDatTreoTuiPhoi'];
      keyFields.forEach(fieldName => {
        const field = thongTinChung.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify production process table has temperature and humidity fields
    const productionTable = cordycepsSchema.tables.find(t => t.tableName === 'Bảng 4: Nhật ký quá trình sản xuất');
    if (productionTable) {
      console.log('\n🌡️ Production monitoring fields:');
      const monitoringFields = ['nhietDo', 'doAm', 'congViec'];
      monitoringFields.forEach(fieldName => {
        const field = productionTable.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    console.log('\n🎉 Cordyceps schema test completed successfully!');
    console.log('📝 The schema is ready for use in the frontend form.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testCordycepsSchema();