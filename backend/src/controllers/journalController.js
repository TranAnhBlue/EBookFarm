const FarmJournal = require('../models/FarmJournal');

const createJournal = async (req, res) => {
  try {
    const journal = new FarmJournal({
      ...req.body,
      userId: req.user._id,
    });
    const createdJournal = await journal.save();
    res.status(201).json({ success: true, data: createdJournal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJournals = async (req, res) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { userId: req.user._id };

    // Lấy tất cả journals với category của schema
    const journals = await FarmJournal.find(filter)
      .populate('schemaId', 'name category')
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
    const journal = await FarmJournal.findOne({ qrCode: req.params.qrCode }).populate('schemaId').populate('userId', 'username');
    if (journal) {
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
          if (journal.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
              return res.status(403).json({ success: false, message: 'Not authorized' });
          }
          journal.entries = req.body.entries || journal.entries;
          journal.status = req.body.status || journal.status;
          const updated = await journal.save();
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
    // Only owner or admin can view
    if (journal.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền xem nhật ký này' });
    }
    res.json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJournal, getJournals, getJournalByQr, getJournalById, updateJournal };