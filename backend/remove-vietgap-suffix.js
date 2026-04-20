const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const removeVietGAPSuffix = async () => {
  try {
    console.log('✂️ Bỏ chữ "VietGAP" khỏi tên schema thủy sản...');

    // Tìm tất cả schema thủy sản có chữ "VietGAP" trong tên
    const schemas = await FormSchema.find({ 
      category: 'thuyssan',
      name: { $regex: 'VietGAP', $options: 'i' }
    });
    
    console.log(`📋 Tìm thấy ${schemas.length} schema cần cập nhật tên`);

    if (schemas.length === 0) {
      console.log('✅ Không có schema nào cần cập nhật');
      process.exit(0);
    }

    let updatedCount = 0;

    // Cập nhật từng schema
    for (const schema of schemas) {
      try {
        // Bỏ chữ "VietGAP" khỏi tên
        const newName = schema.name
          .replace(/\s*VietGAP\s*/gi, '')  // Bỏ "VietGAP" và khoảng trắng xung quanh
          .trim();  // Bỏ khoảng trắng đầu cuối

        if (newName !== schema.name) {
          await FormSchema.findByIdAndUpdate(schema._id, {
            name: newName
          });

          console.log(`✅ ${schema.name} → ${newName}`);
          updatedCount++;
        } else {
          console.log(`⏭️ Bỏ qua: ${schema.name} (không có VietGAP)`);
        }
      } catch (error) {
        console.error(`❌ Lỗi cập nhật schema ${schema.name}:`, error.message);
      }
    }

    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updatedCount} schema`);

    // Hiển thị danh sách schema sau khi cập nhật
    const updatedSchemas = await FormSchema.find({ category: 'thuyssan' });
    console.log('\n📋 Danh sách schema thủy sản sau khi cập nhật:');
    updatedSchemas.forEach((schema, index) => {
      console.log(`   ${index + 1}. ${schema.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi cập nhật schema:', error);
    process.exit(1);
  }
};

removeVietGAPSuffix();