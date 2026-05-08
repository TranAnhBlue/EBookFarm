const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // Phân bón, Thuốc BVTV, Giống, Khác
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // HTX hoặc Nông dân
}, { timestamps: true });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

const inventoryTransactionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  type: { type: String, enum: ['Import', 'Export', 'Distribute'], required: true },
  quantity: { type: Number, required: true },
  journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmJournal' },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Nông dân nhận (nếu HTX cấp phát)
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Người thực hiện giao dịch
  note: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = { InventoryItem, InventoryTransaction };