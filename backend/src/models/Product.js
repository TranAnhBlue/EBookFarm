const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Thông tin nhận diện GS1
  gtin: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    // GTIN-13 (EAN-13) hoặc GTIN-8, GTIN-14
    match: [/^\d{8}(\d{5})?$|^\d{13}$|^\d{14}$/, 'GTIN không hợp lệ. Phải là 8, 13 hoặc 14 chữ số.']
  },
  gs1Prefix: { type: String }, // Tiền tố GS1 của đơn vị (VD: 893 = Việt Nam)
  
  // Thông tin sản phẩm
  name: { type: String, required: true, trim: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['trongtrot', 'channuoi', 'thuysan', 'huuco', 'thucpham', 'khac'],
    required: true
  },
  unit: { type: String }, // Đơn vị tính: kg, hộp, chai, ...
  weight: { type: Number }, // Trọng lượng tịnh (gram)
  
  // Nhà sản xuất / HTX
  manufacturerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  manufacturerName: { type: String }, // Snapshot tên đơn vị SX
  
  // Hình ảnh
  images: [{ type: String }], // URLs từ Cloudinary
  
  // Trạng thái
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Recalled'],
    default: 'Active'
  },
  
  // Đồng bộ cổng quốc gia
  portalProductId: { type: String }, // ID sản phẩm trên cổng quốc gia (nhận về sau khi đăng ký)
  portalRegisteredAt: { type: Date },
  portalSyncStatus: { 
    type: String, 
    enum: ['NotRegistered', 'Pending', 'Registered', 'Failed'],
    default: 'NotRegistered'
  },
  
  // Liên kết FormSchema (loại nhật ký sản xuất áp dụng)
  schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSchema' },
  
}, { timestamps: true });

productSchema.index({ manufacturerId: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
