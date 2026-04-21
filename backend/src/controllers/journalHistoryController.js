const JournalHistory = require('../models/JournalHistory');
const FarmJournal = require('../models/FarmJournal');

/**
 * Get history for a specific journal
 * @route GET /api/journals/:id/history
 */
const getJournalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if journal exists and user has access
    const journal = await FarmJournal.findById(id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Check permission: owner, admin, or technician can view history
    const canView = 
      journal.userId.toString() === req.user.id ||
      req.user.role === 'Admin' ||
      req.user.role === 'Technician';

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem lịch sử nhật ký này'
      });
    }

    // Get history with pagination
    const skip = (page - 1) * limit;
    const history = await JournalHistory.find({ journalId: id })
      .populate('userId', 'username fullname email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await JournalHistory.countDocuments({ journalId: id });

    // Format history for display
    const formattedHistory = history.map(h => ({
      _id: h._id,
      action: h.action,
      actionLabel: getActionLabel(h.action),
      user: {
        id: h.userId._id,
        name: h.userId.fullname || h.userId.username,
        email: h.userId.email
      },
      changes: h.getFormattedChanges(),
      reason: h.reason,
      timestamp: h.createdAt,
      metadata: h.metadata
    }));

    res.json({
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          pages: Math.ceil(total / limit)
        },
        journal: {
          id: journal._id,
          qrCode: journal.qrCode,
          status: journal.status,
          editCount: journal.editCount || 0,
          lastEditedAt: journal.lastEditedAt
        }
      }
    });

  } catch (error) {
    console.error('Get journal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy lịch sử nhật ký: ' + error.message
    });
  }
};

/**
 * Get history summary for a journal
 * @route GET /api/journals/:id/history/summary
 */
const getHistorySummary = async (req, res) => {
  try {
    const { id } = req.params;

    const journal = await FarmJournal.findById(id);
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhật ký'
      });
    }

    // Get history stats
    const totalEdits = await JournalHistory.countDocuments({ 
      journalId: id,
      action: 'update'
    });

    const statusChanges = await JournalHistory.countDocuments({ 
      journalId: id,
      action: 'status_change'
    });

    const lastEdit = await JournalHistory.findOne({ 
      journalId: id 
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'username fullname');

    // Get unique editors
    const editors = await JournalHistory.distinct('userId', { journalId: id });

    res.json({
      success: true,
      data: {
        totalEdits,
        statusChanges,
        uniqueEditors: editors.length,
        lastEdit: lastEdit ? {
          user: lastEdit.userId.fullname || lastEdit.userId.username,
          timestamp: lastEdit.createdAt,
          action: getActionLabel(lastEdit.action)
        } : null,
        journal: {
          status: journal.status,
          createdAt: journal.createdAt,
          editCount: journal.editCount || 0
        }
      }
    });

  } catch (error) {
    console.error('Get history summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy tóm tắt lịch sử: ' + error.message
    });
  }
};

/**
 * Compare two versions of journal
 * @route GET /api/journals/:id/history/compare
 */
const compareVersions = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp timestamp "from" và "to"'
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get all changes between two timestamps
    const changes = await JournalHistory.find({
      journalId: id,
      createdAt: { $gte: fromDate, $lte: toDate }
    })
      .populate('userId', 'username fullname')
      .sort({ createdAt: 1 });

    // Aggregate all changes
    const aggregatedChanges = {};
    
    changes.forEach(history => {
      history.changes.forEach(change => {
        const key = `${change.table}.${change.field}`;
        if (!aggregatedChanges[key]) {
          aggregatedChanges[key] = {
            table: change.table,
            field: change.fieldLabel || change.field,
            firstValue: change.oldValue,
            lastValue: change.newValue,
            changeCount: 1,
            editors: [history.userId.fullname || history.userId.username]
          };
        } else {
          aggregatedChanges[key].lastValue = change.newValue;
          aggregatedChanges[key].changeCount++;
          if (!aggregatedChanges[key].editors.includes(history.userId.fullname || history.userId.username)) {
            aggregatedChanges[key].editors.push(history.userId.fullname || history.userId.username);
          }
        }
      });
    });

    res.json({
      success: true,
      data: {
        period: {
          from: fromDate,
          to: toDate
        },
        totalChanges: changes.length,
        changes: Object.values(aggregatedChanges)
      }
    });

  } catch (error) {
    console.error('Compare versions error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi so sánh phiên bản: ' + error.message
    });
  }
};

/**
 * Get action label in Vietnamese
 */
function getActionLabel(action) {
  const labels = {
    'create': 'Tạo mới',
    'update': 'Cập nhật',
    'status_change': 'Thay đổi trạng thái',
    'delete': 'Xóa',
    'restore': 'Khôi phục'
  };
  return labels[action] || action;
}

module.exports = {
  getJournalHistory,
  getHistorySummary,
  compareVersions
};
