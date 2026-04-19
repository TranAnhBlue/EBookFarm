const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullname: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  
  // Bảo mật
  mustChangePassword: { type: Boolean, default: false }, // Bắt buộc đổi mật khẩu lần đầu
  lastPasswordChange: { type: Date }, // Lần đổi mật khẩu cuối
  
  // Thông tin cá nhân
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'] },
  avatar: { type: String }, // URL ảnh đại diện
  bio: { type: String }, // Giới thiệu ngắn
  
  // Địa chỉ
  address: { type: String },
  province: { type: String },
  district: { type: String },
  ward: { type: String },
  
  // Thông tin nông trại (cho User/Farmer)
  farmName: { type: String },
  farmCode: { type: String },
  farmArea: { type: Number }, // Diện tích (m²)
  farmType: { type: String, enum: ['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Hỗn hợp'] },
  certifications: [{ type: String }], // VietGAP, Hữu cơ, GlobalGAP...
  organization: { type: String }, // Tổ chức/HTX/Công ty
  
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