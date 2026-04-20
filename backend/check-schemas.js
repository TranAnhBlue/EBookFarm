const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const checkSchemas = async () => {
  try {
    console.log('📋 Kiểm tra danh sách schemas...');
    
    const schemas = await FormSchema.find().sort({ createdAt: -1 });
    
    console.log(`\n✅ Tìm thấy ${schemas.length} schemas:`);
    
    schemas.forEach((schema, index) => {
      console.log(`\n${index + 1}. ${schema.name}`);
      console.log(`   ID: ${schema._id}`);
      console.log(`   Danh mục: ${schema.category}`);
      console.log(`   Số bảng: ${schema.tables.length}`);
      console.log(`   Tạo lúc: ${schema.createdAt}`);
      
      if (schema.name.includes('TCVN')) {
        console.log('   📊 Chi tiết các bảng:');
        schema.tables.forEach((table, tIndex) => {
          console.log(`      ${tIndex + 1}. ${table.tableName} (${table.fields.length} trường)`);
        });
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

checkSchemas();