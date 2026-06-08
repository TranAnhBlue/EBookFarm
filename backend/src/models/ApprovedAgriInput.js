const mongoose = require('mongoose');

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const approvedAgriInputSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['PESTICIDE', 'FERTILIZER'],
    required: true,
    index: true,
  },
  scope: {
    type: String,
    enum: ['GLOBAL', 'HTX'],
    default: 'HTX',
    index: true,
  },
  htxId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  tradeName: { type: String, required: true, trim: true },
  activeIngredient: { type: String, trim: true },
  registrationNo: { type: String, trim: true },
  manufacturer: { type: String, trim: true },
  category: { type: String, trim: true },
  cropName: { type: String, trim: true },
  targetPest: { type: String, trim: true },
  dosage: { type: String, trim: true },
  phiDays: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['ALLOWED', 'SUSPENDED', 'EXPIRED'],
    default: 'ALLOWED',
    index: true,
  },
  legalDocumentNo: { type: String, trim: true },
  legalDocumentDate: { type: Date },
  effectiveFrom: { type: Date },
  effectiveTo: { type: Date },
  sourceUrl: { type: String, trim: true },
  sourceFileUrl: { type: String, trim: true },
  version: { type: String, trim: true },
  notes: { type: String, trim: true },
  normalizedTradeName: { type: String, index: true },
  normalizedActiveIngredient: { type: String, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

approvedAgriInputSchema.pre('validate', function normalizeFields(next) {
  this.normalizedTradeName = normalizeText(this.tradeName);
  this.normalizedActiveIngredient = normalizeText(this.activeIngredient);
  if (this.scope === 'GLOBAL') this.htxId = undefined;
  next();
});

approvedAgriInputSchema.index(
  { type: 1, scope: 1, htxId: 1, normalizedTradeName: 1, registrationNo: 1 },
  { unique: true, partialFilterExpression: { normalizedTradeName: { $type: 'string' } } }
);
approvedAgriInputSchema.index({ type: 1, normalizedTradeName: 1, normalizedActiveIngredient: 1, status: 1 });

approvedAgriInputSchema.statics.normalizeText = normalizeText;

module.exports = mongoose.model('ApprovedAgriInput', approvedAgriInputSchema);
