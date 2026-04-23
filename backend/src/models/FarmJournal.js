const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const farmJournalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSchema', required: true },
  qrCode: { type: String, default: () => uuidv4(), unique: true },
  entries: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { 
    type: String, 
    enum: ['Draft', 'Submitted', 'Verified', 'Locked', 'Archived'], 
    default: 'Draft' 
  },
  // Images
  images: [{ 
    url: String, 
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Certifications
  certifications: [{
    name: String, // VietGAP, Organic, GlobalGAP, etc.
    issuer: String, // Tổ chức cấp
    number: String, // Số chứng nhận
    issueDate: Date,
    expiryDate: Date,
    fileUrl: String
  }],
  // View tracking
  viewCount: { type: Number, default: 0 },
  lastViewedAt: { type: Date },
  // History tracking
  submittedAt: { type: Date },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lockedAt: { type: Date },
  editCount: { type: Number, default: 0 },
  lastEditedAt: { type: Date },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const FarmJournal = mongoose.model('FarmJournal', farmJournalSchema);
module.exports = FarmJournal;