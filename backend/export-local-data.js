// Script to export data from local MongoDB
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local MongoDB connection
const LOCAL_MONGO_URI = 'mongodb://localhost:27017/ebookfarm';

// Collections to export
const collections = [
  'users',
  'formschemas',
  'farmjournals',
  'journalhistories',
  'inventories',
  'logs',
  'agrimodels',
  'groups',
  'news',
  'consultations',
  'chatmessages',
  'chatstats'
];

async function exportData() {
  try {
    console.log('🔌 Connecting to local MongoDB...');
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log('✅ Connected to local MongoDB');

    const db = mongoose.connection.db;
    const exportDir = path.join(__dirname, 'data-export');

    // Create export directory
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    console.log('\n📦 Exporting collections...\n');

    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count === 0) {
          console.log(`⏭️  ${collectionName}: Empty, skipping`);
          continue;
        }

        const data = await collection.find({}).toArray();
        const filePath = path.join(exportDir, `${collectionName}.json`);
        
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ ${collectionName}: ${count} documents exported`);
      } catch (error) {
        console.log(`⚠️  ${collectionName}: Collection not found, skipping`);
      }
    }

    console.log('\n✅ Export completed!');
    console.log(`📁 Data exported to: ${exportDir}`);
    console.log('\n📝 Next steps:');
    console.log('1. Run: node import-to-atlas.js');
    console.log('2. Or manually import using MongoDB Compass');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

exportData();
