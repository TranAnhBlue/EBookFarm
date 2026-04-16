const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Phân bón', 'Thuốc BVTV', 'Hạt giống', 'Công cụ', 'Khác'],
    default: 'Khác'
  },
  unit: { type: String, required: true }, // kg, l, túi, etc.
  quantity: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 0 }, // For low stock alerts
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
