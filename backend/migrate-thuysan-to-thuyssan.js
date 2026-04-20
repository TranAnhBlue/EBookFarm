const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const migrateThuysan = async () => {
  try {
    console.log('🔄 Di chuyển schema từ "thuysan" sang "thuyssan"...');

    // Tìm tất cả schema có category 'thuysan' (sai)
    const oldSchemas = await FormSchema.find({ category: 'thuysan' });
    console.log(`📋 Tìm thấy ${oldSchemas.length} schema cần di chuyển`);

    if (oldSchemas.length === 0) {
      console.log('✅ Không có schema nào cần di chuyển');
      process.exit(0);
    }

    let migratedCount = 0;

    // Cập nhật từng schema
    for (const schema of oldSchemas) {
      try {
        await FormSchema.findByIdAndUpdate(schema._id, {
          category: 'thuyssan'
        });

        console.log(`✅ Đã di chuyển: ${schema.name}`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Lỗi di chuyển schema ${schema.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã di chuyển ${migratedCount}/${oldSchemas.length} schema`);
    console.log('📋 Tất cả schema thủy sản hiện đã ở category "thuyssan"');

    // Kiểm tra lại
    const newSchemas = await FormSchema.find({ category: 'thuyssan' });
    console.log(`📊 Hiện có ${newSchemas.length} schema trong category "thuyssan"`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi di chuyển schema:', error);
    process.exit(1);
  }
};

migrateThuysan();