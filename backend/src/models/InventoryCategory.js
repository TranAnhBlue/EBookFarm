const mongoose = require('mongoose');

const inventoryCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  description: { type: String }
}, { timestamps: true });

const InventoryCategory = mongoose.model('InventoryCategory', inventoryCategorySchema);
module.exports = InventoryCategory;
