const PlantingRegion = require('../models/PlantingRegion');
const User = require('../models/User');
const HtxManagementRecord = require('../models/HtxManagementRecord');
const FarmJournal = require('../models/FarmJournal');
const ProductionBatch = require('../models/ProductionBatch');
const { createLog } = require('./logController');
const { ROLES, normalizeRole, isAdminRole, getHtxOwnerId } = require('../utils/roles');
const { validatePreHarvestInterval } = require('../utils/journalCompliance');

const canManageRegions = (role) => {
  const normalized = normalizeRole(role);
  return isAdminRole(role) || [ROLES.HTX_DIRECTOR, ROLES.HTX_TECHNICAL, ROLES.HTX_SUPERVISOR].includes(normalized);
};

const getScopedRegionFilter = (req) => (
  isAdminRole(req.user.role) ? {} : { htxId: getHtxOwnerId(req.user) }
);

const normalizeAttachments = (attachments = [], userId) => {
  if (!Array.isArray(attachments)) return [];
  return attachments.filter(item => item?.url).slice(0, 20).map(item => ({
    url: String(item.url),
    name: item.name ? String(item.name) : '',
    type: item.type === 'image' ? 'image' : 'document',
    mimeType: item.mimeType ? String(item.mimeType) : '',
    size: Number(item.size) || 0,
    uploadedBy: item.uploadedBy || userId,
    uploadedAt: item.uploadedAt || new Date(),
  }));
};

const validateFarmers = async (req, farmerIds = []) => {
  const ids = [...new Set((Array.isArray(farmerIds) ? farmerIds : []).filter(Boolean).map(String))];
  if (!ids.length) return [];
  const htxId = getHtxOwnerId(req.user);
  const farmers = await User.find({
    _id: { $in: ids },
    role: { $in: ['FARMER', 'Farmer', 'User'] },
    ...(isAdminRole(req.user.role) ? {} : { htxId }),
  }).select('_id');
  return farmers.map(farmer => farmer._id);
};

const listPlantingRegions = async (req, res) => {
  try {
    if (!canManageRegions(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hồ sơ vùng trồng.' });
    }

    const regions = await PlantingRegion.find(getScopedRegionFilter(req))
      .populate('farmerIds', 'fullname username farmCode farmArea phone address province ward')
      .populate('createdBy', 'fullname username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlantingRegion = async (req, res) => {
  try {
    if (!canManageRegions(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hồ sơ vùng trồng.' });
    }

    const region = await PlantingRegion.findOne({ ...getScopedRegionFilter(req), _id: req.params.id })
      .populate('farmerIds', 'fullname username farmCode farmArea phone address province ward')
      .populate('createdBy', 'fullname username');

    if (!region) return res.status(404).json({ success: false, message: 'Không tìm thấy vùng trồng.' });
    res.json({ success: true, data: region });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const savePlantingRegion = async (req, res) => {
  try {
    if (!canManageRegions(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền cập nhật hồ sơ vùng trồng.' });
    }

    const farmerIds = await validateFarmers(req, req.body.farmerIds);
    const payload = {
      ...req.body,
      htxId: getHtxOwnerId(req.user),
      farmerIds,
      attachments: normalizeAttachments(req.body.attachments, req.user._id),
      updatedBy: req.user._id,
    };

    let region;
    if (req.params.id) {
      region = await PlantingRegion.findOneAndUpdate(
        { ...getScopedRegionFilter(req), _id: req.params.id },
        payload,
        { new: true, runValidators: true }
      );
      if (!region) return res.status(404).json({ success: false, message: 'Không tìm thấy vùng trồng.' });
    } else {
      region = await PlantingRegion.create({ ...payload, createdBy: req.user._id });
    }

    await User.updateMany(
      { _id: { $in: farmerIds } },
      {
        $set: {
          plantingRegionId: region._id,
          plantingRegionCode: region.code,
          farmCoordinates: region.center,
        },
      }
    );

    await createLog(req.user._id, req.params.id ? 'Cập nhật vùng trồng' : 'Tạo vùng trồng', region._id, 'PlantingRegion', {
      code: region.code,
      name: region.name,
    });

    res.status(req.params.id ? 200 : 201).json({ success: true, data: region });
  } catch (error) {
    const status = error.code === 11000 ? 409 : 500;
    res.status(status).json({ success: false, message: error.code === 11000 ? 'Mã vùng trồng đã tồn tại trong HTX.' : error.message });
  }
};

const deletePlantingRegion = async (req, res) => {
  try {
    if (!canManageRegions(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa hồ sơ vùng trồng.' });
    }

    const region = await PlantingRegion.findOneAndDelete({ ...getScopedRegionFilter(req), _id: req.params.id });
    if (!region) return res.status(404).json({ success: false, message: 'Không tìm thấy vùng trồng.' });

    await User.updateMany(
      { plantingRegionId: region._id },
      { $unset: { plantingRegionId: '', plantingRegionCode: '', farmCoordinates: '' } }
    );

    await createLog(req.user._id, 'Xóa vùng trồng', region._id, 'PlantingRegion', { code: region.code });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInspectionDossier = async (req, res) => {
  try {
    if (!canManageRegions(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem hồ sơ thanh tra.' });
    }

    const region = await PlantingRegion.findOne({ ...getScopedRegionFilter(req), _id: req.params.id })
      .populate('farmerIds', 'fullname username farmCode farmArea phone address province ward');
    if (!region) return res.status(404).json({ success: false, message: 'Không tìm thấy vùng trồng.' });

    const farmerIds = region.farmerIds.map(farmer => farmer._id);
    const [journals, trainings, audits, harvestDocs, salesDocs] = await Promise.all([
      FarmJournal.find({ userId: { $in: farmerIds } }).populate('schemaId', 'name category').populate('userId', 'fullname username farmCode'),
      HtxManagementRecord.find({ htxId: region.htxId, module: { $in: ['training', 'technical-training'] }, farmerIds: { $in: farmerIds } }),
      HtxManagementRecord.find({ htxId: region.htxId, module: { $in: ['material-supervision', 'product-inspections', 'nonconformities', 'technical-reports'] }, farmerIds: { $in: farmerIds } }),
      HtxManagementRecord.find({ htxId: region.htxId, module: { $in: ['product-finalization'] }, farmerIds: { $in: farmerIds } }),
      HtxManagementRecord.find({ htxId: region.htxId, module: { $in: ['distribution-orders', 'distribution-finance-requests', 'accounting-transactions'] }, farmerIds: { $in: farmerIds } }),
    ]);

    const journalCompliance = journals.map(journal => ({
      journalId: journal._id,
      farmer: journal.userId,
      schema: journal.schemaId,
      status: journal.status,
      progress: journal.progress,
      compliance: validatePreHarvestInterval(journal.entries),
    }));

    const relatedBatchIds = journals.map(journal => journal.batchId).filter(Boolean);
    const linkedBatches = await ProductionBatch.find({ _id: { $in: relatedBatchIds } }).populate('productId', 'name gtin category');

    const checks = [
      { key: 'farmers', label: 'Danh sách hộ tham gia vùng trồng', ok: region.farmerIds.length > 0, evidence: `${region.farmerIds.length} hộ` },
      { key: 'map', label: 'Bản đồ/tọa độ vùng trồng', ok: !!region.center?.lat && !!region.center?.lng && region.boundary.length >= 3, evidence: region.boundary.length ? `${region.boundary.length} điểm ranh giới` : 'Chưa có ranh giới' },
      { key: 'journals', label: 'Nhật ký canh tác từng hộ', ok: journals.length >= region.farmerIds.length, evidence: `${journals.length} sổ` },
      { key: 'pesticidePhi', label: 'Kiểm soát thuốc BVTV và thời gian cách ly', ok: journalCompliance.every(item => item.compliance.ok), evidence: `${journalCompliance.filter(item => !item.compliance.ok).length} sổ cần xử lý` },
      { key: 'training', label: 'Hồ sơ tập huấn nông dân', ok: trainings.length > 0 || region.inspectionProfile?.trainingReady, evidence: `${trainings.length} hồ sơ` },
      { key: 'audit', label: 'Hồ sơ giám sát nội bộ', ok: audits.length > 0 || region.inspectionProfile?.internalAuditReady, evidence: `${audits.length} hồ sơ` },
      { key: 'harvest', label: 'Hồ sơ thu hoạch/hoàn thiện sản phẩm', ok: harvestDocs.length > 0, evidence: `${harvestDocs.length} hồ sơ` },
      { key: 'sales', label: 'Hồ sơ bán hàng/đối soát', ok: salesDocs.length > 0, evidence: `${salesDocs.length} hồ sơ` },
      { key: 'trace', label: 'Truy xuất từ thành phẩm về lô sản xuất', ok: linkedBatches.length > 0, evidence: `${linkedBatches.length} lô truy xuất` },
    ];

    res.json({
      success: true,
      data: {
        region,
        checks,
        journals: journalCompliance,
        trainings,
        audits,
        harvestDocs,
        salesDocs,
        batches: linkedBatches,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  listPlantingRegions,
  getPlantingRegion,
  savePlantingRegion,
  deletePlantingRegion,
  getInspectionDossier,
};
