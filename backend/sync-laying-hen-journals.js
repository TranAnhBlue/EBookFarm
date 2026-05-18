const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

const syncLayingHenJournals = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const standardSchema = await FormSchema.findOne({ name: 'Gà đẻ trứng' });
    if (!standardSchema) {
      console.error('Standard Laying Hen Schema not found!');
      process.exit(1);
    }

    const otherSchemas = await FormSchema.find({ 
      name: { $regex: /Gà đẻ trứng/i }, 
      _id: { $ne: standardSchema._id } 
    });
    const otherSchemaIds = otherSchemas.map(s => s._id);

    const result = await FarmJournal.updateMany(
      { 
        $or: [
          { schemaId: { $in: otherSchemaIds } },
          { "entries.Thông tin chung.cayTrong": { $regex: /Gà đẻ trứng/i } }
        ]
      },
      { $set: { schemaId: standardSchema._id } }
    );

    console.log(`Successfully updated ${result.modifiedCount} journals to the standard VietGAHP Laying Hen schema.`);
    
    // Xóa schema cũ
    if (otherSchemaIds.length > 0) {
      await FormSchema.deleteMany({ _id: { $in: otherSchemaIds } });
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncLayingHenJournals();
