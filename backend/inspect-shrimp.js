const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm');
  console.log('Connected');

  const schemas = await FormSchema.find({ name: { $regex: /tôm/i } });
  schemas.forEach(s => {
    console.log(`ID: ${s._id}, Name: "${s.name}", Category: "${s.category}"`);
    s.tables.forEach(t => {
      console.log(`  Table: "${t.tableName}"`);
    });
  });

  process.exit(0);
};

run();
