const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Journal_Assigned', 'Journal_Submitted', 'Journal_Verified', 'Journal_Revision_Requested', 'System', 'Announcement'],
    required: true 
  },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // Link to Journal, HtxJournal, etc.
  relatedModel: { type: String }, // 'FarmJournal' or 'HtxJournal'
  categoryLabel: { type: String }, // 'VietGAP Trồng trọt', etc.
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
