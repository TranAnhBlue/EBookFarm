require('dotenv').config();
const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');

async function fixCorruptedStatus() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find journals where status is an object instead of string
    const journals = await FarmJournal.find({});
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    
    for (const journal of journals) {
      // Check if status is stored in entries (corrupted)
      if (journal.entries && journal.entries.status) {
        console.log(`🔧 Fixing journal ${journal._id} (${journal.qrCode})`);
        console.log(`   Old status in entries:`, journal.entries.status);
        console.log(`   Current top-level status:`, journal.status);
        
        // Remove status from entries
        delete journal.entries.status;
        journal.markModified('entries');
        
        // Set proper status if not already set correctly
        if (!journal.status || journal.status === 'Completed') {
          journal.status = 'Draft';
        }
        
        await journal.save();
        console.log(`   ✅ Fixed! New status: ${journal.status}\n`);
        fixedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total journals: ${journals.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Already correct: ${alreadyCorrectCount}`);
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixCorruptedStatus();
