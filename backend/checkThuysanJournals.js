require('dotenv/config');
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');

async function checkThuysanJournals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check all journals
    const allJournals = await FarmJournal.find().populate('schemaId');
    console.log(`Total journals: ${allJournals.length}\n`);

    // Check journals with thuysan schemas
    const thuysanSchemas = await FormSchema.find({ category: 'thuysan' });
    const thuysanSchemaIds = thuysanSchemas.map(s => s._id.toString());
    
    console.log(`Thuysan schemas (${thuysanSchemas.length}):`);
    thuysanSchemas.forEach(s => console.log(`  - ${s.name} (${s._id})`));
    console.log('');

    const thuysanJournals = allJournals.filter(j => 
      j.schemaId && thuysanSchemaIds.includes(j.schemaId._id.toString())
    );

    console.log(`Journals with thuysan schemas: ${thuysanJournals.length}`);
    if (thuysanJournals.length > 0) {
      thuysanJournals.forEach(j => {
        console.log(`  - ${j.qrCode} - Schema: ${j.schemaId?.name} - User: ${j.userId}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkThuysanJournals();
