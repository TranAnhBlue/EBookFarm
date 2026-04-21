const mongoose = require('mongoose');

const journalHistorySchema = new mongoose.Schema({
  journalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FarmJournal', 
    required: true,
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    enum: ['create', 'update', 'status_change', 'delete', 'restore'],
    required: true 
  },
  changes: [{
    table: { type: String },
    field: { type: String },
    fieldLabel: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
  }],
  reason: { 
    type: String,
    default: '' 
  },
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    previousStatus: { type: String },
    newStatus: { type: String }
  }
}, { 
  timestamps: true 
});

// Index for faster queries
journalHistorySchema.index({ journalId: 1, createdAt: -1 });
journalHistorySchema.index({ userId: 1, createdAt: -1 });

// Virtual for user info
journalHistorySchema.virtual('userInfo', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Method to format changes for display
journalHistorySchema.methods.getFormattedChanges = function() {
  return this.changes.map(change => {
    let oldDisplay = change.oldValue;
    let newDisplay = change.newValue;

    // Format dates
    if (change.oldValue instanceof Date) {
      oldDisplay = change.oldValue.toLocaleDateString('vi-VN');
    }
    if (change.newValue instanceof Date) {
      newDisplay = change.newValue.toLocaleDateString('vi-VN');
    }

    // Format booleans
    if (typeof change.oldValue === 'boolean') {
      oldDisplay = change.oldValue ? 'Có' : 'Không';
    }
    if (typeof change.newValue === 'boolean') {
      newDisplay = change.newValue ? 'Có' : 'Không';
    }

    // Handle null/undefined
    if (change.oldValue === null || change.oldValue === undefined) {
      oldDisplay = '(Trống)';
    }
    if (change.newValue === null || change.newValue === undefined) {
      newDisplay = '(Trống)';
    }

    return {
      table: change.table,
      field: change.fieldLabel || change.field,
      oldValue: oldDisplay,
      newValue: newDisplay
    };
  });
};

const JournalHistory = mongoose.model('JournalHistory', journalHistorySchema);
module.exports = JournalHistory;
