const HtxJournal = require('../models/HtxJournal');
const FarmJournal = require('../models/FarmJournal');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { ROLES, isAdminRole, isHtxRole, getHtxOwnerId } = require('../utils/roles');
const { notifyHtxRoles } = require('../utils/notificationHelpers');

const cp1252ByteMap = new Map([
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
]);

const decodeLegacyMojibake = (value) => {
  const text = String(value || '');
  const bytes = [];
  for (const char of text) {
    const code = char.codePointAt(0);
    if (code <= 0xff) {
      bytes.push(code);
    } else if (cp1252ByteMap.has(code)) {
      bytes.push(cp1252ByteMap.get(code));
    } else {
      return text;
    }
  }
  const decoded = Buffer.from(bytes).toString('utf8');
  return decoded.includes('�') ? text : decoded;
};

const normalizeFarmerStatus = (status) => {
  const raw = String(status || '').trim();
  const allowed = ['Chưa nhập', 'Đang nhập', 'Chờ duyệt', 'Đã duyệt', 'Cần chỉnh sửa', 'Không đạt'];
  if (allowed.includes(raw)) return raw;
  const decoded = decodeLegacyMojibake(raw).trim();
  return allowed.includes(decoded) ? decoded : (raw || 'Chưa nhập');
};

const normalizeJournalFarmerStatuses = (htxJournal) => {
  htxJournal.farmers.forEach((entry) => {
    entry.status = normalizeFarmerStatus(entry.status);
  });
};

const hasJournalEntries = (entries) => {
  if (!entries || typeof entries !== 'object') return false;
  return Object.values(entries).some((value) => {
    if (value == null || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return hasJournalEntries(value);
    return true;
  });
};

const resolveFarmerJournalStatus = (entry) => {
  const farmJournal = entry.farmJournalId;
  const currentStatus = normalizeFarmerStatus(entry.status);
  if (!farmJournal) return currentStatus || 'Chưa nhập';
  if (farmJournal.status === 'Submitted') return 'Chờ duyệt';
  if (farmJournal.status === 'Verified' || farmJournal.status === 'Locked') return 'Đã duyệt';
  if (currentStatus === 'Cần chỉnh sửa' || currentStatus === 'Không đạt') return currentStatus;
  if (farmJournal.status === 'Draft' && (Number(farmJournal.progress || 0) > 0 || hasJournalEntries(farmJournal.entries))) {
    return 'Đang nhập';
  }
  return currentStatus || 'Chưa nhập';
};

const createHtxJournal = async (req, res) => {
  try {
    const { name, description, schemaId } = req.body;
    if (!isHtxRole(req.user.role) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo sổ.' });
    }

    const htxJournal = new HtxJournal({
      name,
      description,
      schemaId,
      htxId: getHtxOwnerId(req.user),
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
    await notifyHtxRoles({
      htxId: saved.htxId,
      roles: [ROLES.HTX_TECHNICAL, ROLES.HTX_SUPERVISOR],
      sender: req.user._id,
      title: 'Sổ nhật ký HTX mới',
      message: `${req.user.fullname || req.user.username} vừa tạo sổ HTX: ${name}`,
      type: 'HTX_Internal_Task',
      relatedId: saved._id,
      relatedModel: 'HtxJournal',
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHtxJournals = async (req, res) => {
  try {
    const filter = isAdminRole(req.user.role) ? {} : { htxId: getHtxOwnerId(req.user) };
    const journals = await HtxJournal.find(filter)
      .populate('schemaId')
      .populate('htxId', 'fullname username')
      .populate('farmers.farmerId', 'fullname username email')
      .populate('farmers.farmJournalId')
      .lean();

    const data = journals.map(journal => ({
      ...journal,
      farmers: (journal.farmers || []).map(entry => ({
        ...entry,
        status: resolveFarmerJournalStatus(entry),
      })),
    }));

    res.json({ success: true, data });
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

    if (htxJournal.htxId.toString() !== String(getHtxOwnerId(req.user)) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }
    normalizeJournalFarmerStatuses(htxJournal);

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
        'thuysan': 'VietGAP Thủy sản',
        'huuco': 'Hữu cơ',
        'huuco_caytrong': 'Hữu cơ Cây trồng',
        'huuco_channuoi': 'Hữu cơ Chăn nuôi',
        'huuco_thuysan': 'Hữu cơ Thủy sản',
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

    normalizeJournalFarmerStatuses(htxJournal);
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

    if (htxJournal.htxId.toString() !== String(getHtxOwnerId(req.user)) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }
    normalizeJournalFarmerStatuses(htxJournal);

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
      const normalizedStatus = normalizeFarmerStatus(status);
      farmerEntry.status = normalizedStatus;
      
      // Đồng bộ trạng thái xuống FarmJournal
      if (farmerEntry.farmJournalId) {
        let farmJournalStatus = 'Draft';
        if (normalizedStatus === 'Chờ duyệt') farmJournalStatus = 'Submitted';
        if (normalizedStatus === 'Đã duyệt') farmJournalStatus = 'Verified';
        if (normalizedStatus === 'Cần chỉnh sửa' || normalizedStatus === 'Không đạt') farmJournalStatus = 'Draft';
        
        await FarmJournal.findByIdAndUpdate(farmerEntry.farmJournalId, { 
          status: farmJournalStatus,
          htxStatus: normalizedStatus // Lưu cả trạng thái tiếng Việt của HTX
        });

        // Create notification for farmer
        const categoryLabels = {
          'trongtrot': 'VietGAP Trồng trọt',
          'channuoi': 'VietGAHP Chăn nuôi',
          'thuysan': 'VietGAP Thủy sản',
          'huuco': 'Hữu cơ',
          'huuco_caytrong': 'Hữu cơ Cây trồng',
          'huuco_channuoi': 'Hữu cơ Chăn nuôi',
          'huuco_thuysan': 'Hữu cơ Thủy sản',
          'thongminh': 'Nông nghiệp Thông minh'
        };
        const FormSchema = require('../models/FormSchema');
        const schema = await FormSchema.findById(htxJournal.schemaId);
        const catLabel = schema ? categoryLabels[schema.category] || '' : '';

        let nTitle = 'Cập nhật trạng thái sổ';
        let nMessage = `Sổ "${htxJournal.name}" của bạn đã được cập nhật trạng thái: ${normalizedStatus}`;
        let nType = 'Journal_Verified';

        if (normalizedStatus === 'Cần chỉnh sửa') {
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
    const isHtx = isHtxRole(req.user.role);
    const isAdmin = isAdminRole(req.user.role);

    let filter = { role: { $regex: /^farmer$/i } };

    if (isHtx) {
      // Chỉ lấy nông dân thuộc HTX này
      filter.htxId = getHtxOwnerId(req.user);
    }

    const farmers = await User.find(filter)
      .select('fullname username email phone address farmName farmArea farmType certifications avatar status createdAt');
    res.json({ success: true, data: farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getHtxJournalSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const htxJournal = await HtxJournal.findById(id)
      .populate('schemaId')
      .populate('farmers.farmerId', 'fullname username')
      .populate('farmers.farmJournalId');
    if (!htxJournal) return res.status(404).json({ success: false, message: 'Không tìm thấy sổ.' });

    if (htxJournal.htxId.toString() !== String(getHtxOwnerId(req.user)) && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    const currentFarmers = htxJournal.farmers || [];
    const farmJournals = currentFarmers
      .map(entry => entry.farmJournalId)
      .filter(Boolean);

    // Aggregation logic
    const summary = {
      totalFarmers: currentFarmers.length,
      farmersStatus: {},
      dataAggregation: {} // Will hold sums or lists of values per field
    };

    // Initialize status counts
    currentFarmers.forEach(entry => {
      const status = resolveFarmerJournalStatus(entry);
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

          summary.dataAggregation[tableName][fieldName] = {
            type: fieldType,
            value: fieldType === 'number' ? 0 : []
          };

          farmJournals.forEach(fj => {
            const tableData = fj.entries?.[tableName];
            if (!tableData) return;

            const processValue = (val) => {
              if (val !== undefined && val !== null) {
                if (fieldType === 'number') {
                  summary.dataAggregation[tableName][fieldName].value += Number(val);
                } else if (typeof val === 'string' && val.trim() !== '') {
                  if (!summary.dataAggregation[tableName][fieldName].value.includes(val)) {
                    summary.dataAggregation[tableName][fieldName].value.push(val);
                  }
                }
              }
            };

            if (Array.isArray(tableData)) {
              tableData.forEach(row => processValue(row[fieldName]));
            } else {
              processValue(tableData[fieldName]);
            }
          });
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

    await createNotification({
      recipient: journal.userId,
      sender: req.user._id,
      title: authorized ? 'HTX cấp quyền thương hiệu' : 'HTX thu hồi quyền thương hiệu',
      message: authorized
        ? 'Sổ nhật ký của bạn đã được HTX cấp quyền sử dụng thương hiệu/truy xuất.'
        : 'HTX đã thu hồi quyền sử dụng thương hiệu/truy xuất của sổ nhật ký này.',
      type: 'Brand_Authorized',
      relatedId: journal._id,
      relatedModel: 'FarmJournal',
    });

    res.json({ 
      success: true, 
      message: authorized ? 'Đã cấp quyền thương hiệu HTX' : 'Đã thu hồi quyền thương hiệu',
      data: journal 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFarmerFromHtx = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const htxId = getHtxOwnerId(req.user);

    // 1. Cập nhật User để bỏ htxId
    const user = await User.findById(farmerId);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy nông dân.' });

    if (user.htxId?.toString() !== htxId.toString() && !isAdminRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền gỡ nông dân này.' });
    }

    user.htxId = null;
    await user.save();

    // 2. Gỡ khỏi các HtxJournal của HTX này
    await HtxJournal.updateMany(
      { htxId: htxId },
      { $pull: { farmers: { farmerId: farmerId } } }
    );

    await createNotification({
      recipient: farmerId,
      sender: req.user._id,
      title: 'Cập nhật thành viên HTX',
      message: 'Tài khoản của bạn đã được gỡ khỏi HTX hiện tại.',
      type: 'Farmer_Removed_From_HTX',
      relatedId: farmerId,
      relatedModel: 'User',
    });

    res.json({ success: true, message: 'Đã gỡ nông dân khỏi HTX thành công.' });
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
  authorizeBrand,
  removeFarmerFromHtx
};

