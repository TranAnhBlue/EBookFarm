const JournalHistory = require('../models/JournalHistory');
const FarmJournal = require('../models/FarmJournal');
const FormSchema = require('../models/FormSchema');

/**
 * Middleware to track journal changes
 * Saves history before updating journal
 */
const trackJournalChanges = async (req, res, next) => {
  try {
    const journalId = req.params.id;
    const userId = req.user.id;
    const { entries, status, reason } = req.body;

    // Get original journal
    const originalJournal = await FarmJournal.findById(journalId).populate('schemaId');
    if (!originalJournal) {
      return next();
    }

    // Detect changes
    const changes = [];

    // Check status change
    if (status && status !== originalJournal.status) {
      changes.push({
        table: 'System',
        field: 'status',
        fieldLabel: 'Trạng thái',
        oldValue: originalJournal.status,
        newValue: status
      });
    }

    // Check entries changes
    if (entries) {
      const schema = originalJournal.schemaId;
      
      for (const tableName in entries) {
        const newTableData = entries[tableName];
        const oldTableData = originalJournal.entries[tableName] || {};
        
        // Find table definition
        const tableSchema = schema.tables.find(t => t.tableName === tableName);
        if (!tableSchema) continue;

        // Compare each field
        for (const field of tableSchema.fields) {
          const oldValue = oldTableData[field.name];
          const newValue = newTableData[field.name];

          // Check if value changed
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changes.push({
              table: tableName,
              field: field.name,
              fieldLabel: field.label,
              oldValue: oldValue,
              newValue: newValue
            });
          }
        }
      }
    }

    // Only save history if there are changes
    if (changes.length > 0) {
      const history = new JournalHistory({
        journalId: journalId,
        userId: userId,
        action: status && status !== originalJournal.status ? 'status_change' : 'update',
        changes: changes,
        reason: reason || '',
        metadata: {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          previousStatus: originalJournal.status,
          newStatus: status || originalJournal.status
        }
      });

      await history.save();

      // Update journal edit metadata
      await FarmJournal.findByIdAndUpdate(journalId, {
        $inc: { editCount: 1 },
        lastEditedAt: new Date(),
        lastEditedBy: userId
      });

      console.log(`📝 Saved history for journal ${journalId}: ${changes.length} changes`);
    }

    next();
  } catch (error) {
    console.error('Error tracking journal changes:', error);
    // Don't block the request if history fails
    next();
  }
};

/**
 * Middleware to track journal creation
 */
const trackJournalCreation = async (req, res, next) => {
  try {
    // Store original send function
    const originalSend = res.json;

    // Override send function to capture response
    res.json = function(data) {
      // Restore original send
      res.json = originalSend;

      // If journal was created successfully
      if (data.success && data.data && data.data._id) {
        const journalId = data.data._id;
        const userId = req.user.id;

        // Save creation history (async, don't wait)
        JournalHistory.create({
          journalId: journalId,
          userId: userId,
          action: 'create',
          changes: [],
          reason: 'Tạo mới nhật ký',
          metadata: {
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
          }
        }).then(() => {
          console.log(`📝 Saved creation history for journal ${journalId}`);
        }).catch(err => {
          console.error('Error saving creation history:', err);
        });
      }

      // Send response
      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('Error tracking journal creation:', error);
    next();
  }
};

/**
 * Check if user can edit journal based on status and role
 */
const checkEditPermission = async (req, res, next) => {
  try {
    const journalId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const journal = await FarmJournal.findById(journalId);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check permissions based on status and role
    const canEdit = checkPermission(journal.status, userRole, journal.userId.toString(), userId);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: `Không thể chỉnh sửa nhật ký ở trạng thái "${journal.status}". ${getPermissionMessage(journal.status, userRole)}`
      });
    }

    // If editing Submitted/Verified, require reason
    if (['Submitted', 'Verified'].includes(journal.status) && !req.body.reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập lý do chỉnh sửa',
        requireReason: true
      });
    }

    next();
  } catch (error) {
    console.error('Error checking edit permission:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra quyền chỉnh sửa'
    });
  }
};

/**
 * Check if user has permission to edit based on status and role
 */
function checkPermission(status, role, ownerId, userId) {
  // Admin can edit anything except Archived
  if (role === 'Admin' && status !== 'Archived') {
    return true;
  }

  // Check by status
  switch (status) {
    case 'Draft':
      // Owner can edit Draft
      return ownerId === userId;
    
    case 'Submitted':
      // Owner and Technician can edit Submitted
      return ownerId === userId || role === 'Technician';
    
    case 'Verified':
      // Only Technician and Admin can edit Verified
      return role === 'Technician' || role === 'Admin';
    
    case 'Locked':
      // Only Admin can edit Locked
      return role === 'Admin';
    
    case 'Archived':
      // No one can edit Archived
      return false;
    
    default:
      return false;
  }
}

/**
 * Get permission message for user
 */
function getPermissionMessage(status, role) {
  switch (status) {
    case 'Submitted':
      return 'Bạn có thể chỉnh sửa nhưng cần ghi rõ lý do.';
    case 'Verified':
      return role === 'Technician' || role === 'Admin' 
        ? 'Bạn có thể chỉnh sửa nhưng cần ghi rõ lý do.'
        : 'Chỉ kỹ thuật viên hoặc quản trị viên mới có thể chỉnh sửa nhật ký đã xác minh.';
    case 'Locked':
      return 'Nhật ký đã bị khóa. Chỉ quản trị viên mới có thể mở khóa.';
    case 'Archived':
      return 'Nhật ký đã được lưu trữ và không thể chỉnh sửa.';
    default:
      return '';
  }
}

module.exports = {
  trackJournalChanges,
  trackJournalCreation,
  checkEditPermission
};
