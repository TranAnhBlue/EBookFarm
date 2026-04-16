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
    const journals = await FarmJournal.find(filter).populate('schemaId', 'name').populate('userId', 'username');
    res.json({ success: true, data: journals });
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

module.exports = { createJournal, getJournals, getJournalByQr, updateJournal };