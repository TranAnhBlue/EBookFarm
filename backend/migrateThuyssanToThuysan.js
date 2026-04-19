/**
 * Migration script: Update category from 'thuyssan' to 'thuysan'
 * Fixes typo in FormSchema category field
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const FormSchema = require('./src/models/FormSchema');

const migrateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update all schemas with old category names
    const updates = [
      { old: 'thuyssan', new: 'thuysan' },
      { old: 'huuco_thuyssan', new: 'huuco_thuysan' }
    ];

    for (const update of updates) {
      const result = await FormSchema.updateMany(
        { category: update.old },
        { $set: { category: update.new } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${result.modifiedCount} schemas from '${update.old}' to '${update.new}'`);
      } else {
        console.log(`ℹ️  No schemas found with category '${update.old}'`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

migrateCategories();
