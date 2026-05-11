const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['REGISTER', 'CHANGE_PHONE'], required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // OTP expires after 5 minutes
});

module.exports = mongoose.model('Otp', otpSchema);
