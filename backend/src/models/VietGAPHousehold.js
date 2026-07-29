/**
 * Model: Danh sách hộ sản xuất VietGAP
 * 
 * Lưu trữ thông tin các hộ sản xuất VietGAP để tự động điền vào form
 */

const mongoose = require('mongoose');

const vietGAPHouseholdSchema = new mongoose.Schema({
  // Thông tin hộ
  tenHo: {
    type: String,
    required: true,
    trim: true
  },
  maSoNongHo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  dienTich: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Địa chỉ
  thon: {
    type: String,
    trim: true
  },
  xuDong: {
    type: String,
    trim: true
  },
  xa: {
    type: String,
    trim: true
  },
  huyen: {
    type: String,
    trim: true
  },
  tinh: {
    type: String,
    trim: true
  },
  
  // Thông tin liên hệ
  soDienThoai: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  
  // Thông tin sản xuất
  loaiHinh: {
    type: String,
    enum: ['Cây trồng', 'Chăn nuôi', 'Thủy sản', 'Khác'],
    default: 'Cây trồng'
  },
  cayTrong: [{
    type: String,
    trim: true
  }],
  
  // Thuộc HTX nào
  htxId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  htxName: {
    type: String,
    trim: true
  },
  
  // Trạng thái
  trangThai: {
    type: String,
    enum: ['Hoạt động', 'Tạm ngừng', 'Đã xóa'],
    default: 'Hoạt động'
  },
  
  // Ghi chú
  ghiChu: {
    type: String,
    trim: true
  },
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index
vietGAPHouseholdSchema.index({ maSoNongHo: 1 });
vietGAPHouseholdSchema.index({ htxId: 1 });
vietGAPHouseholdSchema.index({ trangThai: 1 });
vietGAPHouseholdSchema.index({ tenHo: 'text' });

module.exports = mongoose.model('VietGAPHousehold', vietGAPHouseholdSchema);
