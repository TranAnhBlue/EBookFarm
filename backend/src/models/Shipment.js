const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  // Liên kết lô hàng
  batchId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProductionBatch',
    required: true
  },
  
  // Thông tin vận chuyển
  shipmentCode: { type: String, trim: true }, // Mã vận đơn / mã chuyến
  
  fromLocation: {
    name: { type: String, required: true },   // Tên kho/cơ sở xuất
    province: { type: String },
    ward: { type: String },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  toLocation: {
    name: { type: String, required: true },   // Tên kho/điểm đến
    province: { type: String },
    ward: { type: String },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  
  // Đơn vị vận chuyển
  carrier: { type: String },            // Tên đơn vị vận chuyển
  vehicleNo: { type: String },          // Số xe / số tàu
  driverName: { type: String },         // Tên tài xế
  driverPhone: { type: String },
  
  // Thời gian
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date },
  estimatedArrival: { type: Date },
  
  // Điều kiện vận chuyển (IoT nếu có)
  temperature: {
    min: { type: Number },              // °C
    max: { type: Number },
    readings: [{
      value: { type: Number },
      recordedAt: { type: Date, default: Date.now }
    }]
  },
  humidity: {
    min: { type: Number },              // %
    max: { type: Number }
  },
  
  // Số lượng vận chuyển
  quantity: { type: Number },
  unit: { type: String },
  
  // Trạng thái chuyến hàng
  status: { 
    type: String, 
    enum: ['Preparing', 'InTransit', 'Delivered', 'Returned', 'Lost'],
    default: 'Preparing'
  },
  
  // Ghi chú và bằng chứng
  notes: { type: String },
  proofImages: [{ type: String }],      // Ảnh bằng chứng (Cloudinary URLs)
  
  // Người tạo record
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  
}, { timestamps: true });

shipmentSchema.index({ batchId: 1 });
shipmentSchema.index({ status: 1 });

const Shipment = mongoose.model('Shipment', shipmentSchema);
module.exports = Shipment;
