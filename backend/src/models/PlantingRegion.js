const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
}, { _id: false });

const plantingRegionSchema = new mongoose.Schema({
  htxId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  cropName: { type: String, trim: true },
  standard: { type: String, trim: true, default: 'VietGAP' },
  province: { type: String, trim: true },
  ward: { type: String, trim: true },
  address: { type: String, trim: true },
  areaM2: { type: Number, default: 0 },
  center: {
    lat: { type: Number },
    lng: { type: Number },
  },
  boundary: [coordinateSchema],
  farmerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  allowedPesticides: [{
    tradeName: { type: String, trim: true },
    activeIngredient: { type: String, trim: true },
    phiDays: { type: Number, default: 0 },
    registrationNo: { type: String, trim: true },
  }],
  inspectionProfile: {
    trainingReady: { type: Boolean, default: false },
    internalAuditReady: { type: Boolean, default: false },
    harvestProfileReady: { type: Boolean, default: false },
    salesProfileReady: { type: Boolean, default: false },
    gaccReady: { type: Boolean, default: false },
    notes: { type: String, trim: true },
  },
  attachments: [{
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    type: { type: String, enum: ['image', 'document'], default: 'document' },
    mimeType: { type: String, trim: true },
    size: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  status: {
    type: String,
    enum: ['Draft', 'Active', 'Suspended', 'Archived'],
    default: 'Draft',
    index: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

plantingRegionSchema.index({ htxId: 1, code: 1 }, { unique: true });
plantingRegionSchema.index({ htxId: 1, status: 1 });

module.exports = mongoose.model('PlantingRegion', plantingRegionSchema);
