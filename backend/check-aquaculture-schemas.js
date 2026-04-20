const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    const schemas = await FormSchema.find({ category: 'thuyssan' });
    console.log('=== SCHEMAS THỦY SẢN ===');
    console.log(`Tổng số: ${schemas.length} schema`);
    
    schemas.forEach((schema, index) => {
      console.log(`${index + 1}. ID: ${schema._id}`);
      console.log(`   Tên: ${schema.name}`);
      console.log(`   Mô tả: ${schema.description}`);
      console.log(`   Số bảng: ${schema.tables.length}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
});