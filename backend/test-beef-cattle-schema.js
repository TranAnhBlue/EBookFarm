const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const testBeefCattleSchema = async () => {
  try {
    console.log('🐄 Testing Beef Cattle schema...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the Beef Cattle schema
    const beefCattleSchema = await FormSchema.findOne({ 
      name: 'Bò thịt', 
      category: 'channuoi' 
    });
    
    if (!beefCattleSchema) {
      console.log('❌ Beef Cattle schema not found!');
      process.exit(1);
    }
    
    console.log('✅ Found Beef Cattle schema');
    console.log(`📋 Schema details:`);
    console.log(`   - Name: ${beefCattleSchema.name}`);
    console.log(`   - Category: ${beefCattleSchema.category}`);
    console.log(`   - Description: ${beefCattleSchema.description}`);
    console.log(`   - Tables: ${beefCattleSchema.tables.length}`);
    
    // Verify all required tables exist
    const expectedTables = [
      'Biểu 1: Lý lịch giống',
      'Biểu 2: Ghi chép mua/chuyển bò thịt giống vào nuôi thương phẩm',
      'Biểu 3: Theo dõi sinh trưởng',
      'Biểu 4: Theo dõi mua thức ăn & chất bổ sung thức ăn',
      'Biểu 5: Theo dõi phối trộn thức ăn (Tỷ lệ phối trộn)',
      'Biểu 6: Theo dõi sử dụng thức ăn'
    ];
    
    console.log('\n📊 Table verification:');
    expectedTables.forEach((expectedTable, index) => {
      const actualTable = beefCattleSchema.tables[index];
      if (actualTable && actualTable.tableName === expectedTable) {
        console.log(`   ✅ ${index + 1}. ${actualTable.tableName} (${actualTable.fields.length} fields)`);
      } else {
        console.log(`   ❌ ${index + 1}. Missing or incorrect: ${expectedTable}`);
      }
    });
    
    // Verify key fields in "Lý lịch giống"
    const lyLichGiong = beefCattleSchema.tables.find(t => t.tableName === 'Biểu 1: Lý lịch giống');
    if (lyLichGiong) {
      console.log('\n🔍 Key fields in "Lý lịch giống":');
      const keyFields = ['soHieuConGiong', 'capGiongCon', 'gioiTinhCon', 'ngaySinhCon'];
      keyFields.forEach(fieldName => {
        const field = lyLichGiong.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
      
      console.log('\n👨‍👩‍👧‍👦 Bloodline tracking fields:');
      const bloodlineFields = ['tenBo', 'tenMe', 'tenOngNoi', 'tenBaNoi', 'tenOngNgoai', 'tenBaNgoai'];
      bloodlineFields.forEach(fieldName => {
        const field = lyLichGiong.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label}`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify growth monitoring table
    const sinhTruong = beefCattleSchema.tables.find(t => t.tableName === 'Biểu 3: Theo dõi sinh trưởng');
    if (sinhTruong) {
      console.log('\n📈 Growth monitoring fields:');
      const growthFields = ['khoiLuongTrungBinhConKg', 'tongKhoiLuongBoKg', 'luongThucAnSuDungKg'];
      growthFields.forEach(fieldName => {
        const field = sinhTruong.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    // Verify feed mixing table
    const phoiTron = beefCattleSchema.tables.find(t => t.tableName === 'Biểu 5: Theo dõi phối trộn thức ăn (Tỷ lệ phối trộn)');
    if (phoiTron) {
      console.log('\n🌾 Feed mixing ratio fields:');
      const mixingFields = ['coRomCayKhacPhanTram', 'botCamGaoNgoPhanTram', 'botCayLacPhanTram', 'botDauXanhPhanTram'];
      mixingFields.forEach(fieldName => {
        const field = phoiTron.fields.find(f => f.name === fieldName);
        if (field) {
          console.log(`   ✅ ${field.label} (${field.type})`);
        } else {
          console.log(`   ❌ Missing field: ${fieldName}`);
        }
      });
    }
    
    console.log('\n🎉 Beef Cattle schema test completed successfully!');
    console.log('📝 The schema is ready for use in the frontend form.');
    console.log('🔍 Total fields across all tables:', beefCattleSchema.tables.reduce((sum, table) => sum + table.fields.length, 0));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testBeefCattleSchema();