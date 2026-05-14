const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const checkSchema = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const schema = await FormSchema.findOne({ name: 'Nhật ký sản xuất VietGAP (Trồng trọt)' });
    
    if (!schema) {
      console.log('❌ KHÔNG TÌM THẤY SCHEMA!');
    } else {
      console.log('✅ ĐÃ TÌM THẤY SCHEMA:', schema.name);
      schema.tables.forEach((t, i) => {
        console.log(`Bảng ${i+1}: ${t.tableName} | isMultiRow: ${t.isMultiRow}`);
      });
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkSchema();
