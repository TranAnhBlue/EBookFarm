const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
const AgriModel = require('./src/models/AgriModel');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const syncEverything = async () => {
  try {
    console.log('🔄 Bắt đầu đồng bộ cây danh mục nông nghiệp...');

    // 1. Lấy tất cả Schemas
    const allSchemas = await FormSchema.find({});
    console.log(`📋 Tìm thấy ${allSchemas.length} biểu mẫu trong hệ thống.`);

    // 2. Tạo/Lấy các danh mục gốc (Level 0)
    const roots = {
      'vietgap': await getOrCreate('VietGAP', 0),
      'huuco': await getOrCreate('Hữu cơ', 0)
    };

    // 3. Tạo/Lấy các danh mục cấp 1
    const categories = {
      'trongtrot': await getOrCreate('Trồng trọt', 1, roots.vietgap._id),
      'channuoi': await getOrCreate('Chăn nuôi', 1, roots.vietgap._id),
      'thuyssan': await getOrCreate('Thủy sản', 1, roots.vietgap._id),
      'huuco_caytrong': await getOrCreate('Trồng trọt (Hữu cơ)', 1, roots.huuco._id),
      'huuco_channuoi': await getOrCreate('Chăn nuôi (Hữu cơ)', 1, roots.huuco._id)
    };

    // 4. Lặp qua từng Schema để tạo Level 2
    let count = 0;
    for (const schema of allSchemas) {
      const parentId = categories[schema.category];
      if (parentId) {
        await AgriModel.findOneAndUpdate(
          { name: schema.name, level: 2, parentId: parentId },
          { 
            name: schema.name, 
            level: 2, 
            parentId: parentId, 
            schemaId: schema._id,
            order: count 
          },
          { upsert: true }
        );
        count++;
      }
    }

    console.log(`\n✅ Đã đồng bộ thành công ${count} đối tượng sản xuất vào cây danh mục!`);
    console.log('✨ Toàn bộ hệ thống đã được thiết lập tự động.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
};

async function getOrCreate(name, level, parentId = null) {
  let doc = await AgriModel.findOne({ name, level, parentId });
  if (!doc) {
    doc = new AgriModel({ name, level, parentId });
    await doc.save();
    console.log(`  + Đã tạo danh mục: ${name} (Level ${level})`);
  }
  return doc;
}

syncEverything();
