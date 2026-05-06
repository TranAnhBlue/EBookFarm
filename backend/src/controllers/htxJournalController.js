const HtxJournal = require('../models/HtxJournal');
const FarmJournal = require('../models/FarmJournal');
const User = require('../models/User');

const createHtxJournal = async (req, res) => {
  try {
    const { name, description, schemaId } = req.body;
    if (req.user.role?.toUpperCase() !== 'HTX' && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo sổ.' });
    }

    const htxJournal = new HtxJournal({
      name,
      description,
      schemaId,
      htxId: req.user._id,
      farmers: []
    });

    const saved = await htxJournal.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHtxJournals = async (req, res) => {
  try {
    const filter = req.user.role?.toUpperCase() === 'ADMIN' ? {} : { htxId: req.user._id };
    const journals = await HtxJournal.find(filter)
      .populate('schemaId')
      .populate('htxId', 'fullname username')
      .populate('farmers.farmerId', 'fullname username email')
      .populate('farmers.farmJournalId');
    res.json({ success: true, data: journals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addFarmersToJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { farmerIds } = req.body; // Array of farmer IDs

    const htxJournal = await HtxJournal.findById(id);
    if (!htxJournal) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ.' });

    if (htxJournal.htxId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    const addedFarmers = [];
    for (const farmerId of farmerIds) {
      // Check if farmer already exists
      if (htxJournal.farmers.some(f => f.farmerId.toString() === farmerId.toString())) {
        continue; // Skip if already added
      }

      // Create FarmJournal for the farmer
      const farmJournal = new FarmJournal({
        userId: farmerId,
        schemaId: htxJournal.schemaId,
        htxJournalId: htxJournal._id,
        entries: {},
        status: 'Draft'
      });
      await farmJournal.save();

      htxJournal.farmers.push({
        farmerId,
        farmJournalId: farmJournal._id,
        status: 'Chưa nhập'
      });
      addedFarmers.push(farmerId);
    }

    await htxJournal.save();
    res.json({ success: true, message: `Đã thêm ${addedFarmers.length} nông dân vào sổ.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFarmerStatus = async (req, res) => {
  try {
    const { id, farmerId } = req.params;
    const { status, feedback } = req.body;

    const htxJournal = await HtxJournal.findById(id);
    if (!htxJournal) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ.' });

    if (htxJournal.htxId.toString() !== req.user._id.toString() && req.user.role?.toUpperCase() !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    const farmerEntry = htxJournal.farmers.find(f => f.farmerId.toString() === farmerId.toString());
    if (!farmerEntry) return res.status(404).json({ success: false, message: 'Nông dân không thuộc sổ này.' });

    if (status) {
      farmerEntry.status = status;
      
      // Đồng bộ trạng thái xuống FarmJournal
      if (farmerEntry.farmJournalId) {
        let farmJournalStatus = 'Draft';
        if (status === 'Chờ duyệt') farmJournalStatus = 'Submitted';
        if (status === 'Đã duyệt') farmJournalStatus = 'Verified';
        if (status === 'Cần chỉnh sửa' || status === 'Không đạt') farmJournalStatus = 'Draft';
        
        await FarmJournal.findByIdAndUpdate(farmerEntry.farmJournalId, { 
          status: farmJournalStatus 
        });
      }
    }
    
    if (feedback !== undefined) farmerEntry.feedback = feedback;

    await htxJournal.save();
    res.json({ success: true, data: htxJournal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// For Farmers to get their assigned HTX journals
const getMyHtxJournals = async (req, res) => {
  try {
    const journals = await HtxJournal.find({
      'farmers.farmerId': req.user._id
    })
      .populate('schemaId')
      .populate('htxId', 'fullname username');

    // Mapped response so farmer only sees their own farmJournalId and status
    const mapped = journals.map(j => {
      const myEntry = j.farmers.find(f => f.farmerId.toString() === req.user._id.toString());
      return {
        _id: j._id,
        name: j.name,
        description: j.description,
        schemaId: j.schemaId,
        htxId: j.htxId,
        status: j.status,
        myStatus: myEntry?.status,
        myFeedback: myEntry?.feedback,
        myFarmJournalId: myEntry?.farmJournalId,
        createdAt: j.createdAt
      };
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFarmersForHtx = async (req, res) => {
  try {
    const farmers = await User.find({ role: { $regex: /^farmer$/i } }).select('fullname username email');
    res.json({ success: true, data: farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createHtxJournal,
  getHtxJournals,
  addFarmersToJournal,
  updateFarmerStatus,
  getMyHtxJournals,
  getFarmersForHtx
};
