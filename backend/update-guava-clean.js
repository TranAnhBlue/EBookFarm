/**
 * Script: Cập nhật schema Ổi VietGAP (CLEAN - không có household fields)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Dynamically import schema
const { guavaVietgapSchema } = await import('./schemas/guavaVietgapSchema.js');

const FormSchema = mongoose.model('FormSchema', new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  tables: Array,
  createdAt: Date,
  updatedAt: Date
}), 'formschemas');

async function updateSchema() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const existingSchema = await FormSchema.findOne({ 
      $or: [
        { name: 'Ổi' },
        { name: 'Ổi VietGAP' },
        { name: { $regex: /^Ổi/i } }
      ]
    });

    if (!existingSchema) {
      console.log('❌ Không tìm thấy schema Ổi VietGAP');
      process.exit(1);
    }

    console.log(`📋 Schema hiện tại: "${existingSchema.name}"`);
    console.log(`📝 Schema ID: ${existingSchema._id}`);
    console.log(`📊 Số bảng: ${existingSchema.tables.length} → ${guavaVietgapSchema.tables.length}\n`);

    // Count household fields in old schema
    let oldHouseholdFieldCount = 0;
    existingSchema.tables.forEach(table => {
      table.fields.forEach(field => {
        if (['tt', 'ttHo', 'tenHo', 'dienTichHo', 'maSoNongHo'].includes(field.name)) {
          oldHouseholdFieldCount++;
        }
      });
    });

    // Count household fields in new schema
    let newHouseholdFieldCount = 0;
    guavaVietgapSchema.tables.forEach(table => {
      table.fields.forEach(field => {
        if (['tt', 'ttHo', 'tenHo', 'dienTichHo', 'maSoNongHo'].includes(field.name)) {
          newHouseholdFieldCount++;
        }
      });
    });

    console.log('🔄 Thay đổi:');
    console.log(`  ❌ XÓA: ${oldHouseholdFieldCount} household fields (tt, tenHo, dienTichHo, maSoNongHo)`);
    console.log(`  ✅ GIỮ LẠI: ${newHouseholdFieldCount} household fields trong "Thông tin chung"`);
    console.log(`  ✏️  Loại dòng options: "theo hộ" → chỉ còn "Nhập/mua" hoặc "sử dụng"\n`);

    // Update
    existingSchema.name = guavaVietgapSchema.name;
    existingSchema.description = guavaVietgapSchema.description;
    existingSchema.category = guavaVietgapSchema.category;
    existingSchema.tables = guavaVietgapSchema.tables;
    existingSchema.updatedAt = new Date();

    await existingSchema.save();
    console.log('✅ Đã cập nhật schema thành công!\n');

    // Display structure
    console.log('📋 CẤU TRÚC MỚI:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    guavaVietgapSchema.tables.forEach((table, idx) => {
      console.log(`\n${idx + 1}. ${table.tableName}`);
      console.log(`   ${table.isMultiRow ? '📝 Multi-row' : '📄 Single-row'}`);
      console.log(`   📊 Số trường: ${table.fields.length}`);
      
      // Check for household fields (should only be in "Thông tin chung")
      const householdFields = table.fields.filter(f => 
        ['tt', 'ttHo', 'tenHo', 'dienTichHo', 'maSoNongHo'].includes(f.name)
      );
      
      if (householdFields.length > 0) {
        console.log(`   ℹ️  Có ${householdFields.length} household field(s): ${householdFields.map(f => f.name).join(', ')}`);
      } else {
        console.log(`   ✅ Không có household fields`);
      }
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✨ HOÀN THÀNH!');
    console.log('📌 Thông tin hộ giờ chỉ có trong "Thông tin chung"');
    console.log('   và được tự động điền từ thông tin user đang đăng nhập\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Đã ngắt kết nối MongoDB');
  }
}

updateSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
