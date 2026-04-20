const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const allSchemas = await FormSchema.find({});
    console.log('=== TẤT CẢ SCHEMAS TRONG DATABASE ===');
    console.log(`Tổng số: ${allSchemas.length} schema`);
    console.log('');
    
    // Nhóm theo category
    const schemasByCategory = {};
    allSchemas.forEach(schema => {
      const cat = schema.category || 'undefined';
      if (!schemasByCategory[cat]) {
        schemasByCategory[cat] = [];
      }
      schemasByCategory[cat].push(schema);
    });
    
    Object.keys(schemasByCategory).forEach(category => {
      console.log(`📂 CATEGORY: ${category.toUpperCase()}`);
      schemasByCategory[category].forEach((schema, index) => {
        console.log(`   ${index + 1}. ${schema.name}`);
        console.log(`      ID: ${schema._id}`);
        console.log(`      Mô tả: ${schema.description}`);
        console.log(`      Số bảng: ${schema.tables.length}`);
        console.log(`      Ngày tạo: ${schema.createdAt}`);
        console.log('      ---');
      });
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
});