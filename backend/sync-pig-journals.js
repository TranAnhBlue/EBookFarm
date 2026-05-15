const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

const syncPigJournals = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // 1. Tìm ID của mẫu sổ chuẩn
    const standardSchema = await FormSchema.findOne({ name: 'Lợn thịt' });
    if (!standardSchema) {
      console.error('Standard Pig Schema not found!');
      process.exit(1);
    }
    console.log(`Standard Schema ID: ${standardSchema._id}`);

    // 2. Tìm tất cả các schemas khác có liên quan đến lợn
    const otherPigSchemas = await FormSchema.find({ 
      name: { $regex: /lợn/i }, 
      _id: { $ne: standardSchema._id } 
    });
    const otherSchemaIds = otherPigSchemas.map(s => s._id);

    // 3. Cập nhật toàn bộ Nhật ký
    const result = await FarmJournal.updateMany(
      { 
        $or: [
          { schemaId: { $in: otherSchemaIds } },
          { "entries.Thông tin chung.cayTrong": { $regex: /lợn/i } }
        ]
      },
      { $set: { schemaId: standardSchema._id } }
    );

    console.log(`Successfully updated ${result.modifiedCount} journals to the standard VietGAHP Pig schema.`);
    
    if (otherSchemaIds.length > 0) {
      await FormSchema.deleteMany({ _id: { $in: otherSchemaIds } });
      console.log(`Deleted ${otherSchemaIds.length} obsolete pig schemas.`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncPigJournals();
