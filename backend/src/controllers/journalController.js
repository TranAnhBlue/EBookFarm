const FarmJournal = require('../models/FarmJournal');
const { createLog } = require('./logController');

const createJournal = async (req, res) => {
  try {
    const journal = new FarmJournal({
      ...req.body,
      userId: req.user._id,
    });
    const createdJournal = await journal.save();
    
    // Log action
    await createLog(req.user._id, 'Tạo nhật ký sản xuất', createdJournal._id, 'FarmJournal', {
      qrCode: createdJournal.qrCode,
      schemaId: createdJournal.schemaId
    });
    
    res.status(201).json({ success: true, data: createdJournal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJournals = async (req, res) => {
  try {
    const filter = req.user.role?.toUpperCase() === 'ADMIN' ? {} : { userId: req.user._id };

    // Lấy tất cả journals với category của schema
    const journals = await FarmJournal.find(filter)
      .populate('schemaId')
      .populate('userId', 'username');

    // Nếu có query ?category= thì lọc theo category của schema
    const { category } = req.query;
    const result = category
      ? journals.filter(j => j.schemaId?.category === category)
      : journals;

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJournalByQr = async (req, res) => {
  try {
    const journal = await FarmJournal.findOne({ qrCode: req.params.qrCode }).populate('schemaId').populate('userId', 'username fullname');
    if (journal) {
      // Increment view count
      journal.viewCount = (journal.viewCount || 0) + 1;
      journal.lastViewedAt = new Date();
      await journal.save();
      
      res.json({ success: true, data: journal });
    } else {
      res.status(404).json({ success: false, message: 'Journal not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateJournal = async (req, res) => {
    try {
      const journal = await FarmJournal.findById(req.params.id);
      if(journal) {
          let hasAccess = false;
          if (journal.userId.toString() === req.user._id.toString() || req.user.role?.toUpperCase() === 'ADMIN') {
             hasAccess = true;
          } else if (req.user.role?.toUpperCase() === 'HTX' && journal.htxJournalId) {
             const HtxJournal = require('../models/HtxJournal');
             const htxJournal = await HtxJournal.findById(journal.htxJournalId);
             if (htxJournal && htxJournal.htxId.toString() === req.user._id.toString()) {
                hasAccess = true;
             }
          }
          if (!hasAccess) {
              return res.status(403).json({ success: false, message: 'Not authorized' });
          }
          journal.entries = req.body.entries || journal.entries;
          journal.status = req.body.status || journal.status;
          const updated = await journal.save();
          
          // Đồng bộ trạng thái lên HtxJournal nếu có
          if (updated.htxJournalId && req.body.status) {
             const HtxJournal = require('../models/HtxJournal');
             const htxJournal = await HtxJournal.findById(updated.htxJournalId);
             if (htxJournal) {
                 const farmerEntry = htxJournal.farmers.find(f => f.farmJournalId && f.farmJournalId.toString() === updated._id.toString());
                 if (farmerEntry) {
                     if (updated.status === 'Submitted') farmerEntry.status = 'Chờ duyệt';
                     if (updated.status === 'Draft') farmerEntry.status = 'Đang nhập';
                     await htxJournal.save();
                 }
             }
          }

          // Log action
          await createLog(req.user._id, 'Cập nhật nhật ký sản xuất', updated._id, 'FarmJournal', {
            qrCode: updated.qrCode,
            status: updated.status
          });
          
          res.json({ success: true, data: updated });
      } else {
          res.status(404).json({ success: false, message: 'Journal not found' });
      }
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getJournalById = async (req, res) => {
  try {
    const journal = await FarmJournal.findById(req.params.id)
      .populate('schemaId')
      .populate('userId', 'username fullname');
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhật ký' });
    }
    // Only owner, admin, or HTX can view
    let hasAccess = false;
    if (journal.userId._id.toString() === req.user._id.toString() || req.user.role?.toUpperCase() === 'ADMIN') {
       hasAccess = true;
    } else if (req.user.role?.toUpperCase() === 'HTX' && journal.htxJournalId) {
       const HtxJournal = require('../models/HtxJournal');
       const htxJournal = await HtxJournal.findById(journal.htxJournalId);
       if (htxJournal && htxJournal.htxId.toString() === req.user._id.toString()) {
          hasAccess = true;
       }
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem nhật ký này' });
    }
    res.json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJournal, getJournals, getJournalByQr, getJournalById, updateJournal };