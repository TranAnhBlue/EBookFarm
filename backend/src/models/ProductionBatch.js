const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productionBatchSchema = new mongoose.Schema({
  // Mã định danh
  batchCode: { 
    type: String, 
    required: true,
    trim: true
  },
  traceId: { 
    type: String, 
    unique: true, 
    default: () => `TXN-${uuidv4().split('-')[0].toUpperCase()}`
    // Ví dụ: TXN-A1B2C3D4
  },
  
  // Liên kết sản phẩm & nhật ký
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  htxJournalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'HtxJournal'
    // Sổ tổng của HTX (tập hợp nhiều FarmJournal)
  },
  farmJournalIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FarmJournal'
    // Các nhật ký nông dân thuộc lô này
  }],
  
  // Thông tin lô hàng
  productionDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true }, // kg, hộp, chai, ...
  
  // Địa điểm sản xuất
  productionLocation: {
    name: { type: String },
    province: { type: String },
    ward: { type: String },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  // Người tạo lô (HTX)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
  // Ghi chú
  notes: { type: String },
  
  // Trạng thái lô
  status: { 
    type: String, 
    enum: ['Active', 'Distributed', 'Recalled', 'Expired'],
    default: 'Active'
  },
  
  // QR Code (GS1 Digital Link hoặc URL nội bộ)
  qrCodeUrl: { type: String },        // URL đầy đủ nhúng trong QR
  qrCodeImage: { type: String },      // Base64 hoặc URL ảnh QR đã render
  
  // === Đồng bộ Cổng TXNG Quốc Gia ===
  portalBatchId: { type: String },    // ID lô trên cổng quốc gia (nhận về sau sync)
  portalSyncStatus: { 
    type: String, 
    enum: ['NotSynced', 'Pending', 'Synced', 'Failed', 'SyncedWithWarning'],
    default: 'NotSynced'
  },
  portalSyncedAt: { type: Date },
  portalSyncAttempts: { type: Number, default: 0 },
  portalLastError: { type: String },  // Lỗi lần sync gần nhất
  
}, { timestamps: true });

productionBatchSchema.index({ batchCode: 1 });
productionBatchSchema.index({ productId: 1 });
productionBatchSchema.index({ traceId: 1 });
productionBatchSchema.index({ portalSyncStatus: 1 });

const ProductionBatch = mongoose.model('ProductionBatch', productionBatchSchema);
module.exports = ProductionBatch;
