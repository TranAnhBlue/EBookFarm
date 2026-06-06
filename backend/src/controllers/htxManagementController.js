const HtxManagementRecord = require('../models/HtxManagementRecord');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { notifyMany, notifyHtxRoles } = require('../utils/notificationHelpers');
const {
  ROLES,
  normalizeRole,
  isAdminRole,
  isFarmerRole,
  canManageFinance,
  getHtxOwnerId,
} = require('../utils/roles');

const TECHNICAL_MODULES = [
  'technical-guidance',
  'technical-training',
  'pest-control',
  'product-inspections',
  'nonconformities',
  'material-supervision',
  'technical-proposals',
  'technical-reports',
];

const DISTRIBUTION_MODULES = [
  'distribution-orders',
  'distribution-shipments',
  'market-development',
  'customer-feedback',
  'product-finalization',
  'distribution-finance-requests',
];

const ACCOUNTING_MODULES = [
  'accounting-transactions',
  'accounting-receivables',
  'accounting-payables',
  'accounting-reports',
  'tax-obligations',
  'financial-recommendations',
];

const FARMER_MODULES = [
  'farmer-reports',
  'farmer-suggestions',
  'farmer-equipment-requests',
  'farmer-duty-confirmations',
];

const TECHNICAL_FARMER_MODULES = [
  'farmer-reports',
  'farmer-suggestions',
  'farmer-duty-confirmations',
];

const MODULES = ['documents', 'tasks', 'finance', 'partners', 'training', ...TECHNICAL_MODULES, ...DISTRIBUTION_MODULES, ...ACCOUNTING_MODULES, ...FARMER_MODULES];

const canAccessModule = (role, module) => {
  const normalized = normalizeRole(role);
  if (isAdminRole(role) || normalized === ROLES.HTX_DIRECTOR) return true;
  if (normalized === ROLES.HTX_TECHNICAL && (TECHNICAL_MODULES.includes(module) || TECHNICAL_FARMER_MODULES.includes(module))) return true;
  if (normalized === ROLES.HTX_DISTRIBUTION && DISTRIBUTION_MODULES.includes(module)) return true;
  if (normalized === ROLES.HTX_ACCOUNTANT && (ACCOUNTING_MODULES.includes(module) || module === 'finance' || module === 'distribution-finance-requests')) return true;
  if (module === 'finance') return canManageFinance(role);
  return false;
};

const canProcessDistributionFinance = (role) => {
  const normalized = normalizeRole(role);
  return isAdminRole(role) || normalized === ROLES.HTX_DIRECTOR || normalized === ROLES.HTX_ACCOUNTANT;
};

const assertModuleAccess = (req, res) => {
  const { module } = req.params;
  if (!MODULES.includes(module)) {
    res.status(400).json({ success: false, message: 'Phân hệ HTX không hợp lệ.' });
    return null;
  }
  if (!canAccessModule(req.user.role, module)) {
    res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập phân hệ này.' });
    return null;
  }
  return module;
};

const getScopedFilter = (req, module) => {
  const filter = { module };
  if (!isAdminRole(req.user.role)) {
    filter.htxId = getHtxOwnerId(req.user);
  }
  return filter;
};

const normalizeFarmerIds = (farmerIds) => {
  if (!Array.isArray(farmerIds)) return [];
  return [...new Set(farmerIds.filter(Boolean).map(id => String(id)))];
};

const normalizeAttachments = (attachments, userId) => {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .filter(item => item?.url)
    .slice(0, 10)
    .map(item => ({
      url: String(item.url),
      name: item.name ? String(item.name) : '',
      type: item.type === 'image' ? 'image' : 'document',
      mimeType: item.mimeType ? String(item.mimeType) : '',
      size: Number(item.size) || 0,
      caption: item.caption ? String(item.caption) : '',
      uploadedBy: item.uploadedBy || userId,
      uploadedAt: item.uploadedAt || new Date(),
    }));
};

const validateScopedFarmers = async (req, farmerIds) => {
  const ids = normalizeFarmerIds(farmerIds);
  if (!ids.length) return [];

  const htxId = getHtxOwnerId(req.user);
  const farmers = await User.find({
    _id: { $in: ids },
    role: { $in: ['FARMER', 'Farmer', 'User'] },
    ...(isAdminRole(req.user.role) ? {} : { htxId }),
  }).select('_id');

  return farmers.map(farmer => farmer._id);
};

const getModuleTargetRoles = (module, record = {}) => {
  const assignedRole = normalizeRole(record.assignedToRole);
  if (
    Object.values(ROLES).includes(assignedRole)
    && assignedRole !== ROLES.ADMIN
    && assignedRole !== ROLES.FARMER
  ) {
    return [assignedRole];
  }

  if (TECHNICAL_MODULES.includes(module) || TECHNICAL_FARMER_MODULES.includes(module)) {
    return [ROLES.HTX_TECHNICAL, ROLES.HTX_DIRECTOR];
  }
  if (module === 'distribution-finance-requests') {
    return [ROLES.HTX_ACCOUNTANT, ROLES.HTX_DIRECTOR];
  }
  if (DISTRIBUTION_MODULES.includes(module)) {
    return [ROLES.HTX_DISTRIBUTION, ROLES.HTX_DIRECTOR];
  }
  if (ACCOUNTING_MODULES.includes(module) || module === 'finance') {
    return [ROLES.HTX_ACCOUNTANT, ROLES.HTX_DIRECTOR];
  }
  if (['tasks', 'documents', 'training'].includes(module)) {
    return [ROLES.HTX_TECHNICAL, ROLES.HTX_DISTRIBUTION, ROLES.HTX_ACCOUNTANT, ROLES.HTX_SUPERVISOR];
  }
  return [];
};

const notifyInternalStakeholders = async ({ req, record, action }) => {
  const roles = getModuleTargetRoles(record.module, record);
  if (!roles.length) return;

  await notifyHtxRoles({
    htxId: record.htxId || getHtxOwnerId(req.user),
    roles,
    sender: req.user._id,
    title: action === 'updated' ? 'Cập nhật nghiệp vụ HTX' : 'Nghiệp vụ HTX mới',
    message: `${record.title} (${record.documentType || record.module})`,
    type: record.module === 'distribution-finance-requests'
      ? 'Distribution_Finance_Submitted'
      : 'HTX_Internal_Task',
    relatedId: record._id,
    relatedModel: 'HtxManagementRecord',
    categoryLabel: record.module,
  });
};

const notifyLinkedFarmers = async ({ req, record, farmerIds, action }) => {
  const ids = normalizeFarmerIds(farmerIds);
  if (!ids.length) return;

  await Promise.all(ids.map(farmerId => createNotification({
    recipient: farmerId,
    sender: req.user._id,
    title: action === 'updated' ? 'HTX cập nhật nội dung liên quan đến bạn' : 'HTX giao/cập nhật nội dung liên quan đến bạn',
    message: `${record.title} (${record.documentType || record.module})`,
    type: action === 'updated' ? 'HTX_Management_Updated' : 'HTX_Management_Assigned',
    relatedId: record._id,
    relatedModel: 'HtxManagementRecord',
    categoryLabel: record.module,
  })));
};

const listRecords = async (req, res) => {
  try {
    const module = assertModuleAccess(req, res);
    if (!module) return;

    const filter = getScopedFilter(req, module);
    if (req.query.status) filter.status = req.query.status;

    const records = await HtxManagementRecord.find(filter)
      .populate('createdBy', 'fullname username role')
      .populate('updatedBy', 'fullname username role')
      .populate('farmerIds', 'fullname username farmCode phone address')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('List HTX management records error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải dữ liệu quản trị HTX.' });
  }
};

const getRecord = async (req, res) => {
  try {
    const module = assertModuleAccess(req, res);
    if (!module) return;

    const record = await HtxManagementRecord.findOne({
      ...getScopedFilter(req, module),
      _id: req.params.id,
    })
      .populate('createdBy', 'fullname username role')
      .populate('updatedBy', 'fullname username role')
      .populate('farmerIds', 'fullname username farmCode phone address');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu.' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get HTX management record error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải chi tiết dữ liệu.' });
  }
};

const createRecord = async (req, res) => {
  try {
    const module = assertModuleAccess(req, res);
    if (!module) return;

    const {
      title,
      code,
      description,
      status,
      priority,
      amount,
      direction,
      partnerName,
      assignedToName,
      assignedToRole,
      location,
      startDate,
      endDate,
      dueDate,
      documentType,
      tags,
      attachments,
      farmerIds,
      metadata,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề.' });
    }

    const scopedFarmerIds = await validateScopedFarmers(req, farmerIds);

    const record = await HtxManagementRecord.create({
      module,
      htxId: getHtxOwnerId(req.user),
      title,
      code,
      description,
      status,
      priority,
      amount,
      direction,
      partnerName,
      assignedToName,
      assignedToRole,
      location,
      startDate,
      endDate,
      dueDate,
      documentType,
      tags,
      attachments: normalizeAttachments(attachments, req.user._id),
      farmerIds: scopedFarmerIds,
      metadata,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await notifyLinkedFarmers({ req, record, farmerIds: scopedFarmerIds, action: 'created' });
    await notifyInternalStakeholders({ req, record, action: 'created' });

    res.status(201).json({ success: true, data: record, message: 'Đã lưu dữ liệu HTX.' });
  } catch (error) {
    console.error('Create HTX management record error:', error);
    res.status(500).json({ success: false, message: 'Không thể tạo dữ liệu quản trị HTX.' });
  }
};

const updateRecord = async (req, res) => {
  try {
    const module = assertModuleAccess(req, res);
    if (!module) return;

    const allowedFields = [
      'title',
      'code',
      'description',
      'status',
      'priority',
      'amount',
      'direction',
      'partnerName',
      'assignedToName',
      'assignedToRole',
      'location',
      'startDate',
      'endDate',
      'dueDate',
      'documentType',
      'tags',
      'attachments',
      'farmerIds',
      'metadata',
    ];

    const updates = { updatedBy: req.user._id };
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (req.body.farmerIds !== undefined) {
      updates.farmerIds = await validateScopedFarmers(req, req.body.farmerIds);
    }
    if (req.body.attachments !== undefined) {
      updates.attachments = normalizeAttachments(req.body.attachments, req.user._id);
    }

    const record = await HtxManagementRecord.findOneAndUpdate(
      { ...getScopedFilter(req, module), _id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu để cập nhật.' });
    }

    const farmerLinkedFields = ['status', 'description', 'priority', 'dueDate', 'endDate', 'documentType', 'metadata', 'attachments'];
    const shouldNotifyFarmers = req.body.farmerIds !== undefined
      || farmerLinkedFields.some(field => req.body[field] !== undefined);
    if (shouldNotifyFarmers && record.farmerIds?.length) {
      await notifyLinkedFarmers({ req, record, farmerIds: record.farmerIds, action: 'updated' });
    }
    await notifyInternalStakeholders({ req, record, action: 'updated' });

    res.json({ success: true, data: record, message: 'Đã cập nhật dữ liệu HTX.' });
  } catch (error) {
    console.error('Update HTX management record error:', error);
    res.status(500).json({ success: false, message: 'Không thể cập nhật dữ liệu quản trị HTX.' });
  }
};

const processDistributionFinanceRequest = async (req, res) => {
  try {
    if (!canProcessDistributionFinance(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Chỉ Giám đốc HTX hoặc Kế toán được xử lý đối soát phân phối.' });
    }

    const source = await HtxManagementRecord.findOne({
      ...getScopedFilter(req, 'distribution-finance-requests'),
      _id: req.params.id,
    });

    if (!source) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đề nghị đối soát phân phối.' });
    }

    const {
      status,
      targetModule,
      note,
      paymentStatus,
    } = req.body;

    const allowedStatuses = ['Review', 'Approved', 'Paid', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái xử lý không hợp lệ.' });
    }

    const accountingTargets = ['accounting-transactions', 'accounting-receivables', 'accounting-payables'];
    const shouldCreateAccountingRecord = ['Approved', 'Paid'].includes(status);

    if (shouldCreateAccountingRecord && !accountingTargets.includes(targetModule)) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn nghiệp vụ kế toán cần tạo.' });
    }

    if (shouldCreateAccountingRecord && source.metadata?.accountingRecordId) {
      return res.status(400).json({ success: false, message: 'Đề nghị này đã được tạo bản ghi kế toán trước đó.' });
    }

    let accountingRecord = null;
    const nextMetadata = {
      ...(source.metadata || {}),
      processedBy: req.user._id,
      processedAt: new Date(),
      processNote: note,
    };

    if (shouldCreateAccountingRecord) {
      const targetStatus = paymentStatus || (status === 'Paid' ? 'Paid' : 'Pending');
      accountingRecord = await HtxManagementRecord.create({
        module: targetModule,
        htxId: source.htxId,
        title: source.title,
        code: source.code,
        description: [
          source.description,
          note ? `Ghi chú xử lý: ${note}` : '',
          `Tạo từ đối soát phân phối: ${source._id}`,
        ].filter(Boolean).join('\n'),
        status: targetStatus,
        priority: source.priority,
        amount: source.amount,
        direction: source.direction,
        partnerName: source.partnerName,
        assignedToName: source.assignedToName,
        assignedToRole: source.assignedToRole,
        location: source.location,
        startDate: source.startDate,
        endDate: source.endDate,
        dueDate: source.dueDate,
        documentType: source.documentType,
        tags: source.tags,
        attachments: source.attachments,
        farmerIds: source.farmerIds,
        metadata: {
          sourceModule: source.module,
          sourceRecordId: source._id,
          sourceStatus: status,
        },
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });

      nextMetadata.accountingRecordId = accountingRecord._id;
      nextMetadata.accountingModule = targetModule;
      await notifyLinkedFarmers({ req, record: accountingRecord, farmerIds: accountingRecord.farmerIds, action: 'created' });
      await notifyHtxRoles({
        htxId: source.htxId,
        roles: [ROLES.HTX_DIRECTOR],
        sender: req.user._id,
        title: 'Kế toán đã tạo bản ghi tài chính',
        message: `${accountingRecord.title} (${targetModule})`,
        type: 'Accounting_Record_Created',
        relatedId: accountingRecord._id,
        relatedModel: 'HtxManagementRecord',
        categoryLabel: targetModule,
      });
    }

    source.status = status;
    source.description = note ? `${source.description || ''}\nGhi chú kế toán: ${note}`.trim() : source.description;
    source.metadata = nextMetadata;
    source.updatedBy = req.user._id;
    await source.save();

    await notifyLinkedFarmers({ req, record: source, farmerIds: source.farmerIds, action: 'updated' });
    await notifyMany({
      recipients: [source.createdBy],
      sender: req.user._id,
      title: 'Kế toán đã xử lý đối soát phân phối',
      message: `${source.title}: ${status}${note ? ` - ${note}` : ''}`,
      type: 'Distribution_Finance_Processed',
      relatedId: source._id,
      relatedModel: 'HtxManagementRecord',
      categoryLabel: source.module,
    });
    await notifyHtxRoles({
      htxId: source.htxId,
      roles: [ROLES.HTX_DIRECTOR],
      sender: req.user._id,
      title: 'Đối soát phân phối đã được xử lý',
      message: `${source.title}: ${status}`,
      type: 'Distribution_Finance_Processed',
      relatedId: source._id,
      relatedModel: 'HtxManagementRecord',
      categoryLabel: source.module,
    });

    res.json({
      success: true,
      data: { source, accountingRecord },
      message: accountingRecord ? 'Đã xử lý đối soát và tạo bản ghi kế toán.' : 'Đã cập nhật trạng thái đối soát.',
    });
  } catch (error) {
    console.error('Process distribution finance request error:', error);
    res.status(500).json({ success: false, message: 'Không thể xử lý đối soát phân phối.' });
  }
};

const getMyLinkedRecords = async (req, res) => {
  try {
    if (!isFarmerRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Chỉ nông dân/thành viên VietGAP được xem dữ liệu này.' });
    }

    const records = await HtxManagementRecord.find({
      farmerIds: req.user._id,
      ...(req.query.module ? { module: req.query.module } : {}),
    })
      .populate('createdBy', 'fullname username role')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('Get my linked HTX records error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải nội dung HTX liên quan đến bạn.' });
  }
};

const createFarmerSubmission = async (req, res) => {
  try {
    const { module } = req.params;
    if (!FARMER_MODULES.includes(module)) {
      return res.status(400).json({ success: false, message: 'Phân hệ phản hồi nông dân không hợp lệ.' });
    }

    if (!isFarmerRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Chỉ nông dân/thành viên VietGAP được gửi phản hồi.' });
    }

    const htxId = req.user.htxId;
    if (!htxId) {
      return res.status(400).json({ success: false, message: 'Tài khoản nông dân chưa thuộc HTX nào.' });
    }

    const {
      title,
      code,
      description,
      priority,
      location,
      documentType,
      startDate,
      endDate,
      dueDate,
      metadata,
      attachments,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề.' });
    }

    const record = await HtxManagementRecord.create({
      module,
      htxId,
      title,
      code,
      description,
      priority: priority || 'Medium',
      status: 'Pending',
      location,
      documentType,
      startDate,
      endDate,
      dueDate,
      metadata,
      attachments: normalizeAttachments(attachments, req.user._id),
      farmerIds: [req.user._id],
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const targetRoles = TECHNICAL_FARMER_MODULES.includes(module)
      ? [ROLES.HTX_DIRECTOR, ROLES.HTX_TECHNICAL]
      : [ROLES.HTX_DIRECTOR];

    await notifyHtxRoles({
      htxId,
      roles: targetRoles,
      sender: req.user._id,
      title: 'Nông dân gửi phản hồi/yêu cầu mới',
      message: `${req.user.fullname || req.user.username}: ${record.title}`,
      type: 'Farmer_Feedback_Submitted',
      relatedId: record._id,
      relatedModel: 'HtxManagementRecord',
      categoryLabel: module,
    });

    res.status(201).json({ success: true, data: record, message: 'Đã gửi nội dung tới HTX.' });
  } catch (error) {
    console.error('Create farmer submission error:', error);
    res.status(500).json({ success: false, message: 'Không thể gửi nội dung tới HTX.' });
  }
};

const listMyFarmerSubmissions = async (req, res) => {
  try {
    if (!isFarmerRole(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Chỉ nông dân/thành viên VietGAP được xem dữ liệu này.' });
    }

    const records = await HtxManagementRecord.find({
      module: { $in: FARMER_MODULES },
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('List farmer submissions error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải nội dung đã gửi.' });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const module = assertModuleAccess(req, res);
    if (!module) return;

    const record = await HtxManagementRecord.findOneAndDelete({
      ...getScopedFilter(req, module),
      _id: req.params.id,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy dữ liệu để xóa.' });
    }

    res.json({ success: true, message: 'Đã xóa dữ liệu HTX.' });
  } catch (error) {
    console.error('Delete HTX management record error:', error);
    res.status(500).json({ success: false, message: 'Không thể xóa dữ liệu quản trị HTX.' });
  }
};

const getSummary = async (req, res) => {
  try {
    const role = normalizeRole(req.user.role);
    const canViewSummary = isAdminRole(req.user.role)
      || role === ROLES.HTX_DIRECTOR
      || role === ROLES.HTX_TECHNICAL
      || role === ROLES.HTX_DISTRIBUTION
      || role === ROLES.HTX_ACCOUNTANT
      || canManageFinance(req.user.role);

    if (!canViewSummary) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem tổng hợp quản trị HTX.' });
    }

    const filter = isAdminRole(req.user.role) ? {} : { htxId: getHtxOwnerId(req.user) };
    const records = await HtxManagementRecord.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$module',
          total: { $sum: 1 },
          pending: {
            $sum: {
              $cond: [{ $in: ['$status', ['Draft', 'Pending', 'InProgress', 'Review']] }, 1, 0],
            },
          },
          income: {
            $sum: { $cond: [{ $eq: ['$direction', 'Income'] }, '$amount', 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$direction', 'Expense'] }, '$amount', 0] },
          },
        },
      },
    ]);

    res.json({ success: true, data: records });
  } catch (error) {
    console.error('HTX management summary error:', error);
    res.status(500).json({ success: false, message: 'Không thể tải tổng hợp quản trị HTX.' });
  }
};

module.exports = {
  listRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  getSummary,
  getMyLinkedRecords,
  createFarmerSubmission,
  listMyFarmerSubmissions,
  processDistributionFinanceRequest,
};
