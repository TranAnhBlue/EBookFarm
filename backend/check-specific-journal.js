require('dotenv').config();
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
const User = require('./src/models/User'); // Add this

async function checkJournal() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the most recent journal without populate first
    const journal = await FarmJournal.findOne()
      .sort({ updatedAt: -1 });

    if (!journal) {
      console.log('❌ No journals found');
      await mongoose.connection.close();
      return;
    }

    // Manually populate
    const schema = await FormSchema.findById(journal.schemaId);
    const user = await User.findById(journal.userId);

    console.log('📝 Nhật ký mới nhất:');
    console.log('=====================================');
    console.log('ID:', journal._id);
    console.log('QR Code:', journal.qrCode);
    console.log('Schema:', schema?.name);
    console.log('User:', user?.fullname || user?.username);
    console.log('Status:', journal.status);
    console.log('Created:', journal.createdAt);
    console.log('Updated:', journal.updatedAt);
    console.log('\n📊 Full Entries Object:');
    console.log(JSON.stringify(journal.entries, null, 2));
    
    console.log('\n📋 Tables in Schema:');
    if (schema?.tables) {
      schema.tables.forEach((table, idx) => {
        console.log(`\n${idx + 1}. ${table.tableName}`);
        const tableData = journal.entries?.[table.tableName];
        if (tableData && Object.keys(tableData).length > 0) {
          console.log('   ✅ Has data:', Object.keys(tableData).length, 'fields');
          Object.entries(tableData).forEach(([key, value]) => {
            console.log(`      - ${key}: ${value}`);
          });
        } else {
          console.log('   ❌ No data');
        }
      });
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkJournal();
