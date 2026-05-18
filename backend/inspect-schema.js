const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const inspectSchema = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);

    const schemas = await FormSchema.find({ 
      $or: [
        { name: { $regex: /cà phê/i } },
        { "tables.fields.label": { $regex: /cà phê/i } }
      ]
    });

    schemas.forEach(s => {
      console.log(`Schema: ${s.name}`);
      s.tables.forEach(t => {
        if (t.tableName === 'Thông tin chung' || t.fields.some(f => f.label.match(/cà phê/i))) {
          console.log(`- Table: ${t.tableName}, isMultiRow: ${t.isMultiRow}`);
          t.fields.forEach(f => {
            console.log(`  - Field: ${f.label} (${f.type})`);
          });
        }
      });
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspectSchema();
