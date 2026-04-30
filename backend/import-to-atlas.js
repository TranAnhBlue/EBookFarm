// Script to import data to MongoDB Atlas
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB Atlas connection
const ATLAS_MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://trananhblue:TRANANHBLUE@ebook-farm.xgc0r6q.mongodb.net/Ebook-Farm?retryWrites=true&w=majority';

async function importData() {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(ATLAS_MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const db = mongoose.connection.db;
    const exportDir = path.join(__dirname, 'data-export');

    if (!fs.existsSync(exportDir)) {
      console.error('❌ Export directory not found!');
      console.log('Please run: node export-local-data.js first');
      process.exit(1);
    }

    const files = fs.readdirSync(exportDir).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      console.error('❌ No export files found!');
      process.exit(1);
    }

    console.log('\n📦 Importing collections...\n');

    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const filePath = path.join(exportDir, file);
      
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (data.length === 0) {
          console.log(`⏭️  ${collectionName}: Empty, skipping`);
          continue;
        }

        const collection = db.collection(collectionName);
        
        // Check if collection already has data
        const existingCount = await collection.countDocuments();
        if (existingCount > 0) {
          console.log(`⚠️  ${collectionName}: Already has ${existingCount} documents`);
          console.log(`   Do you want to replace? (This will delete existing data)`);
          console.log(`   Skipping for safety. Delete manually if needed.`);
          continue;
        }

        // Insert data
        await collection.insertMany(data);
        console.log(`✅ ${collectionName}: ${data.length} documents imported`);
      } catch (error) {
        console.error(`❌ ${collectionName}: Import failed -`, error.message);
      }
    }

    console.log('\n✅ Import completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Check MongoDB Atlas dashboard');
    console.log('2. Test your app: https://e-book-farm.vercel.app');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

importData();
