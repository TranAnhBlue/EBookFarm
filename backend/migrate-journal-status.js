const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

async function migrateJournals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Count journals to migrate
    const oldJournals = await FarmJournal.countDocuments({ status: 'Completed' });
    console.log(`📊 Found ${oldJournals} journals with status 'Completed'`);

    if (oldJournals === 0) {
      console.log('✅ No journals to migrate');
      process.exit(0);
    }

    // Update old journals: Completed → Submitted
    const result = await FarmJournal.updateMany(
      { status: 'Completed' },
      { 
        $set: { 
          status: 'Submitted',
          editCount: 0,
          submittedAt: new Date()
        } 
      }
    );

    console.log(`✅ Migrated ${result.modifiedCount} journals`);
    console.log('📝 Status changed: Completed → Submitted');
    console.log('📝 Added fields: editCount=0, submittedAt=now');

    // Show summary
    const statusCounts = await FarmJournal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Current status distribution:');
    statusCounts.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrateJournals();
