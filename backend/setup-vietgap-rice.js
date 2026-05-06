const mongoose = require('mongoose');
const FormSchema = require('./src/models/FormSchema');
const AgriModel = require('./src/models/AgriModel');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI);

const setupVietGAPRice = async () => {
  try {
    console.log('🚀 Bắt đầu thiết lập mô hình Nhật ký Lúa VietGAP...');

    // 1. Tạo Schema Nhật ký Lúa VietGAP
    const riceSchemaData = {
      name: 'Nhật ký Lúa VietGAP',
      description: 'Quy trình ghi chép sản xuất lúa theo tiêu chuẩn VietGAP (Trồng trọt)',
      category: 'trongtrot',
      tables: [
        {
          tableName: 'Thông tin Giống và Gieo sạ',
          fields: [
            { name: 'ngay_gieo', label: 'Ngày gieo sạ', type: 'date', required: true },
            { name: 'ten_giong', label: 'Tên giống lúa', type: 'text', required: true },
            { name: 'nguon_goc', label: 'Nguồn gốc giống', type: 'select', options: ['HTX cung cấp', 'Mua đại lý', 'Tự để giống'] },
            { name: 'dien_tich', label: 'Diện tích (m2)', type: 'number', required: true }
          ]
        },
        {
          tableName: 'Theo dõi Bón phân',
          fields: [
            { name: 'ngay_bon', label: 'Ngày bón', type: 'date', required: true },
            { name: 'loai_phan', label: 'Tên loại phân', type: 'text', required: true },
            { name: 'dot_bon', label: 'Đợt bón', type: 'select', options: ['Bón lót', 'Bón thúc 1', 'Bón thúc 2', 'Bón đón đòng'] },
            { name: 'lieu_luong', label: 'Liều lượng (kg/sào)', type: 'number' }
          ]
        },
        {
          tableName: 'Phòng trừ sâu bệnh',
          fields: [
            { name: 'ngay_phun', label: 'Ngày phun thuốc', type: 'date', required: true },
            { name: 'doi_tuong', label: 'Sâu bệnh gây hại', type: 'text', required: true },
            { name: 'ten_thuoc', label: 'Tên thuốc BVTV', type: 'text', required: true },
            { name: 'lieu_luong', label: 'Liều lượng phun', type: 'text' },
            { name: 'cach_ly', label: 'Thời gian cách ly (ngày)', type: 'number' }
          ]
        },
        {
          tableName: 'Thu hoạch và Tiêu thụ',
          fields: [
            { name: 'ngay_thu', label: 'Ngày thu hoạch', type: 'date', required: true },
            { name: 'san_luong', label: 'Sản lượng tươi (kg)', type: 'number', required: true },
            { name: 'ban_cho', label: 'Nơi tiêu thụ', type: 'text' }
          ]
        }
      ]
    };

    let schema = await FormSchema.findOne({ name: 'Nhật ký Lúa VietGAP' });
    if (schema) {
      await FormSchema.findByIdAndUpdate(schema._id, riceSchemaData);
      console.log('✅ Đã cập nhật Schema hiện có.');
    } else {
      schema = new FormSchema(riceSchemaData);
      await schema.save();
      console.log('✅ Đã tạo mới Schema Nhật ký Lúa VietGAP.');
    }

    // 2. Thiết lập Cây Nông nghiệp (AgriModel)
    
    // Level 0: VietGAP
    let model0 = await AgriModel.findOne({ name: 'VietGAP', level: 0 });
    if (!model0) {
      model0 = new AgriModel({ name: 'VietGAP', level: 0, order: 1 });
      await model0.save();
      console.log('✅ Đã tạo Danh mục: VietGAP');
    }

    // Level 1: Trồng trọt (con của VietGAP)
    let model1 = await AgriModel.findOne({ name: 'Trồng trọt', level: 1, parentId: model0._id });
    if (!model1) {
      model1 = new AgriModel({ name: 'Trồng trọt', level: 1, parentId: model0._id, order: 1 });
      await model1.save();
      console.log('✅ Đã tạo Danh mục: Trồng trọt (trong VietGAP)');
    }

    // Level 2: Cây Lúa (con của Trồng trọt) và Gắn Schema
    let model2 = await AgriModel.findOne({ name: 'Cây Lúa', level: 2, parentId: model1._id });
    if (model2) {
      model2.schemaId = schema._id;
      await model2.save();
      console.log('✅ Đã cập nhật Cây Lúa và liên kết với Biểu mẫu.');
    } else {
      model2 = new AgriModel({ 
        name: 'Cây Lúa', 
        level: 2, 
        parentId: model1._id, 
        schemaId: schema._id,
        order: 1 
      });
      await model2.save();
      console.log('✅ Đã tạo mới Cây Lúa và liên kết với Biểu mẫu.');
    }

    console.log('\n✨ THIẾT LẬP HOÀN TẤT! ✨');
    console.log('---------------------------');
    console.log(`- Biểu mẫu: ${schema.name}`);
    console.log(`- Liên kết với: VietGAP -> Trồng trọt -> ${model2.name}`);
    console.log('---------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi thiết lập:', error);
    process.exit(1);
  }
};

setupVietGAPRice();
