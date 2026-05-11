const mongoose = require('mongoose');

const syncLogSchema = new mongoose.Schema({
  // Đối tượng đồng bộ
  entityType: { 
    type: String, 
    enum: ['Product', 'ProductionBatch', 'FarmJournal'],
    required: true
  },
  entityId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'entityType'
  },
  
  // Người thực hiện
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  
  // Loại thao tác
  action: { 
    type: String, 
    enum: ['RegisterProduct', 'SyncBatch', 'UpdateBatch', 'RecallBatch', 'DeleteBatch'],
    required: true
  },
  
  // Kết quả đồng bộ
  status: { 
    type: String, 
    enum: ['Success', 'Failed', 'Pending', 'Retrying'],
    required: true 
  },
  
  // HTTP request/response với cổng quốc gia
  requestPayload: { type: mongoose.Schema.Types.Mixed }, // Dữ liệu gửi đi
  responseData: { type: mongoose.Schema.Types.Mixed },   // Phản hồi từ cổng
  httpStatus: { type: Number },                           // HTTP status code (200, 400, 500...)
  errorMessage: { type: String },                         // Nội dung lỗi nếu thất bại
  
  // Thông tin kết nối
  portalEndpoint: { type: String },    // URL endpoint đã gọi
  retryCount: { type: Number, default: 0 },
  
  // Dữ liệu trả về từ cổng (nếu thành công)
  portalEntityId: { type: String },    // ID phía cổng quốc gia cấp
  
}, { timestamps: true });

syncLogSchema.index({ entityId: 1, entityType: 1 });
syncLogSchema.index({ status: 1, createdAt: -1 });
syncLogSchema.index({ performedBy: 1 });

const SyncLog = mongoose.model('SyncLog', syncLogSchema);
module.exports = SyncLog;
