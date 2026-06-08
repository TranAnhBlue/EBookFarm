const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const farmJournalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSchema', required: true },
  htxJournalId: { type: mongoose.Schema.Types.ObjectId, ref: 'HtxJournal' },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionBatch' },
  qrCode: { type: String, default: () => uuidv4(), unique: true },
  entries: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Verified', 'Locked', 'Archived'],
    default: 'Draft'
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  documents: [{
    url: String,
    name: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  certifications: [{
    name: String,
    issuer: String,
    number: String,
    issueDate: Date,
    expiryDate: Date,
    fileUrl: String
  }],
  viewCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  submittedAt: { type: Date },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt: { type: Date },
  editCount: { type: Number, default: 0 },
  lastEditedAt: { type: Date },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  feedback: { type: String },
  htxStatus: { type: String },
  progress: { type: Number, default: 0 },
  complianceStatus: {
    type: String,
    enum: ['Unchecked', 'Passed', 'Warning', 'Blocked'],
    default: 'Unchecked'
  },
  complianceIssues: [{
    severity: { type: String, enum: ['warning', 'blocker'], default: 'warning' },
    message: String,
    checkedAt: { type: Date, default: Date.now }
  }],
  brandAuthorized: { type: Boolean, default: false },
  brandAuthorizedAt: { type: Date },
  brandAuthorizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const FarmJournal = mongoose.model('FarmJournal', farmJournalSchema);
module.exports = FarmJournal;
