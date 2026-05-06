const mongoose = require('mongoose');

const htxJournalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  htxId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemaId: { type: mongoose.Schema.Types.ObjectId, ref: 'FormSchema', required: true },
  farmers: [{
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmJournalId: { type: mongoose.Schema.Types.ObjectId, ref: 'FarmJournal' },
    status: { 
      type: String, 
      enum: ['Chưa nhập', 'Đang nhập', 'Chờ duyệt', 'Đã duyệt', 'Cần chỉnh sửa', 'Không đạt'],
      default: 'Chưa nhập'
    },
    feedback: { type: String } // Nhận xét của HTX
  }],
  status: { type: String, enum: ['Active', 'Completed', 'Archived'], default: 'Active' },
}, { timestamps: true });

const HtxJournal = mongoose.model('HtxJournal', htxJournalSchema);
module.exports = HtxJournal;
