const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'Journal_Assigned',
      'Journal_Submitted',
      'Journal_Verified',
      'Journal_Revision_Requested',
      'Journal_Locked',
      'HTX_Management_Assigned',
      'HTX_Management_Updated',
      'HTX_Internal_Task',
      'Farmer_Feedback_Submitted',
      'Distribution_Finance_Submitted',
      'Distribution_Finance_Processed',
      'Accounting_Record_Created',
      'Supply_Request_Submitted',
      'Supply_Request_Processed',
      'Inventory_Distributed',
      'Farmer_Removed_From_HTX',
      'Brand_Authorized',
      'System',
      'Announcement',
    ],
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
