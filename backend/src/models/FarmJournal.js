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