const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., 'Update User Status', 'Delete Journal', 'Create Item'
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetType: { type: String }, // e.g., 'User', 'Journal', 'Item'
  details: { type: Object }, // e.g., { oldValues: {}, newValues: {} }
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
