const HtxJournal = require('../models/HtxJournal');
const FarmJournal = require('../models/FarmJournal');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

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

    // Thông báo cho toàn bộ Admin biết có sổ HTX mới được tạo
    const admins = await User.find({ role: { $regex: /^admin$/i } });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        title: 'Sổ nhật ký HTX mới',
        message: `HTX ${req.user.fullname || req.user.username} vừa tạo sổ kế hoạch mới: ${name}`,
        type: 'System',
        relatedId: saved._id,
        relatedModel: 'HtxJournal'
      });
    }

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

      // Create notification for farmer
      const categoryLabels = {
        'trongtrot': 'VietGAP Trồng trọt',
        'channuoi': 'VietGAHP Chăn nuôi',
        'thuyssan': 'VietGAP Thủy sản',
        'huuco': 'Hữu cơ',
        'huuco_caytrong': 'Hữu cơ Cây trồng',
        'huuco_channuoi': 'Hữu cơ Chăn nuôi',
        'huuco_thuyssan': 'Hữu cơ Thủy sản',
        'thongminh': 'Nông nghiệp Thông minh'
      };
      
      // Fetch schema for category info
      const FormSchema = require('../models/FormSchema');
      const schema = await FormSchema.findById(htxJournal.schemaId);
      const catLabel = schema ? categoryLabels[schema.category] || '' : '';

      await createNotification({
        recipient: farmerId,
        sender: req.user._id,
        title: 'Sổ nhật ký mới',
        message: `Bạn đã được phân công tham gia sổ [${catLabel}]: ${htxJournal.name}`,
        type: 'Journal_Assigned',
        relatedId: farmJournal._id,
        relatedModel: 'FarmJournal',
        categoryLabel: catLabel
      });
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

    if (feedback !== undefined) {
      farmerEntry.feedback = feedback;
      if (farmerEntry.farmJournalId) {
        await FarmJournal.findByIdAndUpdate(farmerEntry.farmJournalId, { 
          feedback: feedback 
        });
      }
    }

    if (status) {
      farmerEntry.status = status;
      
      // Đồng bộ trạng thái xuống FarmJournal
      if (farmerEntry.farmJournalId) {
        let farmJournalStatus = 'Draft';
        if (status === 'Chờ duyệt') farmJournalStatus = 'Submitted';
        if (status === 'Đã duyệt') farmJournalStatus = 'Verified';
        if (status === 'Cần chỉnh sửa' || status === 'Không đạt') farmJournalStatus = 'Draft';
        
        await FarmJournal.findByIdAndUpdate(farmerEntry.farmJournalId, { 
          status: farmJournalStatus,
          htxStatus: status // Lưu cả trạng thái tiếng Việt của HTX
        });

        // Create notification for farmer
        const categoryLabels = {
          'trongtrot': 'VietGAP Trồng trọt',
          'channuoi': 'VietGAHP Chăn nuôi',
          'thuyssan': 'VietGAP Thủy sản',
          'huuco': 'Hữu cơ',
          'huuco_caytrong': 'Hữu cơ Cây trồng',
          'huuco_channuoi': 'Hữu cơ Chăn nuôi',
          'huuco_thuyssan': 'Hữu cơ Thủy sản',
          'thongminh': 'Nông nghiệp Thông minh'
        };
        const FormSchema = require('../models/FormSchema');
        const schema = await FormSchema.findById(htxJournal.schemaId);
        const catLabel = schema ? categoryLabels[schema.category] || '' : '';

        let nTitle = 'Cập nhật trạng thái sổ';
        let nMessage = `Sổ "${htxJournal.name}" của bạn đã được cập nhật trạng thái: ${status}`;
        let nType = 'Journal_Verified';

        if (status === 'Cần chỉnh sửa') {
          nTitle = 'Yêu cầu chỉnh sửa sổ';
          nMessage = `HTX yêu cầu bạn chỉnh sửa sổ "${htxJournal.name}". Phản hồi: ${feedback || 'Không có'}`;
          nType = 'Journal_Revision_Requested';
        }

        await createNotification({
          recipient: farmerId,
          sender: req.user._id,
          title: nTitle,
          message: `${nMessage} [${catLabel}]`,
          type: nType,
          relatedId: farmerEntry.farmJournalId,
          relatedModel: 'FarmJournal',
          categoryLabel: catLabel
        });
      }
    }

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
    // Lấy thông tin chi tiết hơn của nông dân để phục vụ trang quản lý nông dân
    const farmers = await User.find({ role: { $regex: /^farmer$/i } })
      .select('fullname username email phone address farmName farmArea farmType certifications avatar status createdAt');
    res.json({ success: true, data: farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHtxJournalSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const htxJournal = await HtxJournal.findById(id).populate('schemaId');
    if (!htxJournal) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ.' });

    const farmJournals = await FarmJournal.find({ htxJournalId: id }).populate('userId', 'fullname username');
    
    // Aggregation logic
    const summary = {
      totalFarmers: farmJournals.length,
      farmersStatus: {},
      dataAggregation: {} // Will hold sums or lists of values per field
    };

    // Initialize status counts
    farmJournals.forEach(fj => {
      const status = fj.htxStatus || 'Chưa nhập';
      summary.farmersStatus[status] = (summary.farmersStatus[status] || 0) + 1;
    });

    // Aggregate entries based on schema fields
    if (htxJournal.schemaId && htxJournal.schemaId.tables) {
      htxJournal.schemaId.tables.forEach(table => {
        const tableName = table.tableName;
        summary.dataAggregation[tableName] = {};

        table.fields.forEach(field => {
          const fieldName = field.name;
          const fieldType = field.type;

          let aggregatedValue = fieldType === 'number' ? 0 : [];

          farmJournals.forEach(fj => {
            const val = fj.entries?.[tableName]?.[fieldName];
            if (val !== undefined && val !== null) {
              if (fieldType === 'number') {
                aggregatedValue += Number(val);
              } else if (typeof val === 'string' && val.trim() !== '') {
                if (!aggregatedValue.includes(val)) {
                  aggregatedValue.push(val);
                }
              }
            }
          });

          summary.dataAggregation[tableName][fieldName] = {
            type: fieldType,
            value: aggregatedValue
          };
        });
      });
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const authorizeBrand = async (req, res) => {
  try {
    const { id } = req.params; // id của FarmJournal
    const { authorized } = req.body;

    const journal = await FarmJournal.findById(id);
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhật ký' });
    }

    journal.brandAuthorized = authorized;
    journal.brandAuthorizedAt = authorized ? new Date() : null;
    journal.brandAuthorizedBy = authorized ? req.user._id : null;

    await journal.save();

    res.json({ 
      success: true, 
      message: authorized ? 'Đã cấp quyền thương hiệu HTX' : 'Đã thu hồi quyền thương hiệu',
      data: journal 
    });
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
  getFarmersForHtx,
  getHtxJournalSummary,
  authorizeBrand
};
