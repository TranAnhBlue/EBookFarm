const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const FormSchema = require('./src/models/FormSchema');

const checkSchemas = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const thuysanSchemas = await FormSchema.find({ category: 'thuysan' });
    console.log(`Found ${thuysanSchemas.length} schemas with category 'thuysan':`);
    thuysanSchemas.forEach(s => console.log(`  - ${s.name}`));

    console.log('\n');
    
    const oldSchemas = await FormSchema.find({ category: 'thuyssan' });
    console.log(`Found ${oldSchemas.length} schemas with OLD category 'thuyssan':`);
    oldSchemas.forEach(s => console.log(`  - ${s.name}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkSchemas();
