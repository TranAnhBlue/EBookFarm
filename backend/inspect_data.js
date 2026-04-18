const mongoose = require('mongoose');
const FarmJournal = require('./src/models/FarmJournal');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

const inspect = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const journals = await FarmJournal.find().populate('schemaId').limit(1);
    console.log('Sample Journal Schema Populate:');
    if (journals.length > 0) {
        console.log('Schema Name:', journals[0].schemaId?.name);
        console.log('Tables Count:', journals[0].schemaId?.tables?.length);
        console.log('Tables:', JSON.stringify(journals[0].schemaId?.tables, null, 2));
    } else {
        console.log('No journals found');
    }
    
    process.exit(0);
};

inspect();
