const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
const FarmJournal = require('./src/models/FarmJournal');
require('dotenv').config();

const syncCattleJournals = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // 1. Tìm ID của mẫu sổ chuẩn
    const standardSchema = await FormSchema.findOne({ name: 'VietGAHP Chăn nuôi Bò' });
    if (!standardSchema) {
      console.error('Standard Cattle Schema not found! Please run the seeder first.');
      process.exit(1);
    }
    console.log(`Standard Schema ID: ${standardSchema._id}`);

    // 2. Tìm tất cả các schemas khác có liên quan đến bò (nếu có)
    const otherCattleSchemas = await FormSchema.find({ 
      name: { $regex: /bò/i }, 
      _id: { $ne: standardSchema._id } 
    });
    const otherSchemaIds = otherCattleSchemas.map(s => s._id);
    console.log(`Found ${otherSchemaIds.length} other cattle schemas to migrate from.`);

    // 3. Cập nhật toàn bộ Nhật ký đang dùng các mẫu cũ sang mẫu chuẩn
    // Hoặc những nhật ký có entries chứa thông tin "Bò" nhưng schemaId bị lệch
    const result = await FarmJournal.updateMany(
      { 
        $or: [
          { schemaId: { $in: otherSchemaIds } },
          { "entries.Thông tin chung.cayTrong": { $regex: /bò/i } },
          { "entries.Thông tin chung.tenGiongBo": { $exists: true } }
        ]
      },
      { $set: { schemaId: standardSchema._id } }
    );

    console.log(`Successfully updated ${result.modifiedCount} journals to the standard VietGAHP Cattle schema.`);
    
    // 4. (Tùy chọn) Xóa các mẫu cũ để tránh nhầm lẫn
    if (otherSchemaIds.length > 0) {
      const deleteResult = await FormSchema.deleteMany({ _id: { $in: otherSchemaIds } });
      console.log(`Deleted ${deleteResult.deletedCount} obsolete cattle schemas.`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncCattleJournals();
