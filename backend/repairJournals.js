const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const repair = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const FormSchema = mongoose.model('FormSchema', new mongoose.Schema({}, { strict: false }), 'formschemas');
    const FarmJournal = mongoose.model('FarmJournal', new mongoose.Schema({
      schemaId: mongoose.Schema.Types.ObjectId,
      entries: Object
    }, { strict: false }), 'farmjournals');

    const schemas = await FormSchema.find({});
    const schemaMap = {};
    schemas.forEach(s => {
      schemaMap[s.name] = s._id;
    });

    const journals = await FarmJournal.find({});
    console.log(`Checking ${journals.length} journals...`);

    let repairedCount = 0;

    for (const j of journals) {
      const existingSchema = await FormSchema.findById(j.schemaId);
      if (!existingSchema) {
        console.log(`\nJournal ${j._id} has broken schema link (ID: ${j.schemaId})`);
        
        let targetSchemaName = null;

        // Try to guess by entries
        const e = j.entries || {};
        const keys = Object.keys(e);
        
        // Flatten keys to check inside objects
        const allKeys = [...keys];
        keys.forEach(k => {
          if (typeof e[k] === 'object' && e[k] !== null) {
             allKeys.push(...Object.keys(e[k]));
          }
        });

        if (allKeys.includes('Xuất chuồng') || allKeys.includes('export_date') || allKeys.includes('head_exported')) {
          targetSchemaName = 'Bò thịt'; // Most likely livestock
        } else if (allKeys.includes('melon_variety') || e['Gieo trồng'] || e['Dinh dưỡng & Tưới']) {
          targetSchemaName = 'Dưa lưới';
        } else if (allKeys.includes('rice_variety') || allKeys.includes('season')) {
          targetSchemaName = 'Lúa';
        } else if (allKeys.includes('tea_variety')) {
          targetSchemaName = 'Chè búp';
        } else if (allKeys.includes('mushroom_type')) {
          targetSchemaName = 'Nấm';
        } else if (allKeys.includes('Bảng 1. Đánh giá ATTP')) {
           // This looks like an old VietGAP template (could be anything, default to Lúa)
           targetSchemaName = 'Lúa';
        }

        if (targetSchemaName && schemaMap[targetSchemaName]) {
          console.log(`   -> Found potential match: ${targetSchemaName}. Updating...`);
          await FarmJournal.updateOne({ _id: j._id }, { $set: { schemaId: schemaMap[targetSchemaName] } });
          repairedCount++;
        } else {
          console.log(`   !! Could not determine schema for journal ${j._id}. Top-level Keys: ${keys.join(', ')}`);
        }
      }
    }

    console.log(`\n✅ Repaired ${repairedCount} journals.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

repair();
