const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullname: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['Admin', 'Farmer', 'HTX', 'User', 'Htx', 'ADMIN', 'FARMER', 'HTX_DIRECTOR', 'HTX_TECHNICAL', 'HTX_DISTRIBUTION', 'HTX_ACCOUNTANT', 'HTX_SUPERVISOR'], default: 'Farmer' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  htxId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Liên kết nông dân với một HTX cụ thể
  
  // Bảo mật
  mustChangePassword: { type: Boolean, default: false }, // Bắt buộc đổi mật khẩu lần đầu
  lastPasswordChange: { type: Date }, // Lần đổi mật khẩu cuối
  
  // Thông tin cá nhân
  phone: { type: String, unique: true, sparse: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
  avatar: { type: String }, // URL ảnh đại diện
  bio: { type: String }, // Giới thiệu ngắn
  
  // Địa chỉ (sau sáp nhập 07/2025: Tỉnh/TP → Phường/Xã, không còn cấp Huyện)
  address: { type: String },
  province: { type: String },
  ward: { type: String },
  
  // Thông tin nông trại (cho User/Farmer)
  farmName: { type: String },
  farmCode: { type: String },
  farmArea: { type: Number }, // Diện tích (m²)
  farmType: { type: String, enum: ['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Hỗn hợp'] },
  plantingRegionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlantingRegion' },
  plantingRegionCode: { type: String },
  farmCoordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  certifications: [{
    name: String, // VietGAP, Hữu cơ, GlobalGAP...
    code: String, // Số hiệu chứng chỉ
    issueDate: Date,
    expiryDate: Date,
    issuer: String, // Tổ chức cấp
    fileUrl: String, // Link file scan
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    feedback: { type: String }
  }],
  organization: { type: String }, // Tổ chức/HTX/Công ty
  
  // === Thông tin Cổng TXNG Quốc Gia (dành cho role HTX) ===
  portalCredentials: {
    enterpriseCode: { type: String },    // Mã doanh nghiệp trên cổng quốc gia
    apiKey: { type: String },            // API Key được cổng cấp
    apiSecret: { type: String },         // API Secret (nếu có)
    portalUsername: { type: String },    // Tài khoản đăng nhập cổng
    registeredAt: { type: Date },        // Ngày đăng ký
    isVerified: { type: Boolean, default: false }, // Đã xác thực với cổng chưa
    lastSyncAt: { type: Date }           // Lần đồng bộ gần nhất
  },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
