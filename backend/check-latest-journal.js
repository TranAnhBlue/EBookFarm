const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
const User = require('./src/models/User');
require('dotenv').config();

async function checkLatestJournal() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get latest journal
    const journal = await FarmJournal.findOne()
      .sort({ createdAt: -1 })
      .populate('schemaId')
      .populate('userId', 'username fullname');

    if (!journal) {
      console.log('❌ Không có nhật ký nào');
      process.exit(0);
    }

    console.log('\n📝 Nhật ký mới nhất:');
    console.log('=====================================');
    console.log(`ID: ${journal._id}`);
    console.log(`QR Code: ${journal.qrCode}`);
    console.log(`Schema: ${journal.schemaId?.name || 'N/A'}`);
    console.log(`Schema ID: ${journal.schemaId?._id || 'N/A'}`);
    console.log(`Category: ${journal.schemaId?.category || 'N/A'}`);
    console.log(`User: ${journal.userId?.fullname || journal.userId?.username || 'N/A'}`);
    console.log(`Status: ${journal.status}`);
    console.log(`Created: ${journal.createdAt}`);
    console.log(`Updated: ${journal.updatedAt}`);
    
    console.log('\n📊 Entries:');
    if (journal.entries && Object.keys(journal.entries).length > 0) {
      for (const [tableName, tableData] of Object.entries(journal.entries)) {
        console.log(`\n  Table: ${tableName}`);
        console.log(`  Fields: ${Object.keys(tableData).length}`);
        for (const [field, value] of Object.entries(tableData)) {
          console.log(`    - ${field}: ${value}`);
        }
      }
    } else {
      console.log('  (Chưa có dữ liệu)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

checkLatestJournal();
