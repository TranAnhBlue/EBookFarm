const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, default: 0 }
}, { timestamps: true });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

const inventoryTransactionSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
  type: { type: String, enum: ['Import', 'Export'], required: true },
  quantity: { type: Number, required: true },
  journalId: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmJournal' },
  note: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = { InventoryItem, InventoryTransaction };