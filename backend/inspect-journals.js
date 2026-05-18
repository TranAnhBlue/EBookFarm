const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const inspectJournals = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Find the most recently updated journals
    const journals = await FarmJournal.find().sort({ updatedAt: -1 }).limit(5).populate('schemaId');
    
    journals.forEach((j, idx) => {
      console.log(`\n--- Journal ${idx + 1} ---`);
      console.log(`ID: ${j._id}`);
      console.log(`Schema: ${j.schemaId ? j.schemaId.name : 'Unknown'}`);
      
      if (j.entries && j.entries['Thông tin chung']) {
        const ttc = j.entries['Thông tin chung'];
        console.log(`Thông tin chung isArray? ${Array.isArray(ttc)}`);
        console.log(`Data:`, JSON.stringify(ttc).substring(0, 200));
      } else {
        console.log('No Thông tin chung found');
      }
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

inspectJournals();
