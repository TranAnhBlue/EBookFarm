const mongoose = require('mongoose');

const agriModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, enum: [0, 1, 2] }, // 0: Model, 1: Category, 2: Object
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgriModel', default: null },
  schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSchema', default: null }, // Only for level 2
  order: { type: Number, default: 0 }
}, { timestamps: true });

const AgriModel = mongoose.model('AgriModel', agriModelSchema);
module.exports = AgriModel;
