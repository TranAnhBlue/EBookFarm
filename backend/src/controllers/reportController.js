const User = require('../models/User');
const Group = require('../models/Group');
const FarmJournal = require('../models/FarmJournal');
const HtxJournal = require('../models/HtxJournal');
const { InventoryItem } = require('../models/Inventory');
const { isAdminRole, isHtxRole, getHtxOwnerId } = require('../utils/roles');

const normalizeKey = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]/g, '');

const parseAreaValue = (value, fieldName = '') => {
  if (value === null || value === undefined || value === '') return 0;
  const raw = String(value).trim().replace(/\s+/g, '');
  const numeric = Number(raw.replace(',', '.').replace(/[^\d.-]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return 0;

  const normalizedName = normalizeKey(fieldName);
  const rawLower = raw.toLowerCase();
  const isHectare = normalizedName.includes('ha') || rawLower.includes('ha');
  const isSquareMeter = normalizedName.includes('m2') || normalizedName.includes('m²') || rawLower.includes('m2') || rawLower.includes('m²');

  return isHectare && !isSquareMeter ? numeric * 10000 : numeric;
};

const isAreaField = (fieldName) => {
  const key = normalizeKey(fieldName);
  return [
    'area',
    'pondarea',
    'farmsize',
    'cultivationarea',
    'farmarea',
    'farmaream2',
    'areaoneha',
    'areaha',
    'dientich',
    'dientichm2',
    'dientichha',
    'dientichao',
    'dientichchuong',
    'dientichchuongnuoi',
    'dientichtoanbo',
    'dientichcanhtac',
    'dientichkhuvuc',
    'dientichlo',
  ].some(candidate => key === candidate || key.includes(candidate));
};

const extractAreaFromEntries = (entries) => {
  let total = 0;

  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    Object.entries(node).forEach(([fieldName, value]) => {
      if (value && typeof value === 'object') {
        walk(value);
        return;
      }
      if (isAreaField(fieldName)) {
        total += parseAreaValue(value, fieldName);
      }
    });
  };

  walk(entries);
  return total;
};

// Helper to get HTX filter
const getHtxScopeFilter = async (user) => {
  if (!isHtxRole(user.role)) return null;
  const htxId = getHtxOwnerId(user);
  const htxJournals = await HtxJournal.find({ htxId }).select('_id');
  const htxJournalIds = htxJournals.map(j => j._id);
  if (!htxJournalIds.length) return { _id: null };
  return { htxJournalId: { $in: htxJournalIds } };
};




// Tổng hợp thống kê nhanh cho Dashboard
const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = isAdminRole(req.user.role);
    const isHtx = isHtxRole(req.user.role);
    const userId = req.user._id;
    const htxId = isHtx ? getHtxOwnerId(req.user) : null;

    let filter = {};
    if (isAdmin) {
      filter = {};
    } else if (isHtx) {
      const htxFilter = await getHtxScopeFilter(req.user);
      filter = htxFilter || { _id: null }; 
    } else {
      filter = { userId };
    }

    const [totalUsers, totalGroups, totalJournals, completedJournals, pendingApprovalsCount, inventoryCount] = await Promise.all([
      isAdmin ? User.countDocuments() : (isHtx ? User.countDocuments({ role: { $regex: /^farmer$/i }, htxId }) : 0),
      isAdmin ? Group.countDocuments() : 0,
      FarmJournal.countDocuments(filter),
      FarmJournal.countDocuments({ ...filter, status: { $in: ['Verified', 'Locked'] } }),
      FarmJournal.countDocuments({ ...filter, status: 'Submitted' }),
      (isAdmin && InventoryItem) ? InventoryItem.countDocuments() : 0
    ]);

    // Additional stats for HTX
    let extraStats = {};
    if (isHtx) {
      const htxJournals = await HtxJournal.find({ htxId })
        .populate('farmers.farmerId')
        .populate('farmers.farmJournalId');
      const farmers = await User.find({ role: { $regex: /^farmer$/i }, htxId }).select('_id');
      const uniqueFarmerIds = new Set(farmers.map(farmer => farmer._id.toString()));
      const countedFarmJournalIds = new Set();
      let totalArea = 0;
      
      for (const hj of htxJournals) {
        for (const f of hj.farmers) {
          if (f.farmerId) {
            uniqueFarmerIds.add(f.farmerId._id.toString());
          }

          if (f.farmJournalId && f.farmJournalId.entries) {
            const farmJournalId = f.farmJournalId._id.toString();
            if (countedFarmJournalIds.has(farmJournalId)) continue;
            countedFarmJournalIds.add(farmJournalId);
            totalArea += extractAreaFromEntries(f.farmJournalId.entries);
          }
        }
      }

      extraStats = {
        totalFarmersCount: uniqueFarmerIds.size,
        totalArea: totalArea,
        activeSchedules: htxJournals.filter(j => j.status === 'Active').length
      };
    }

    res.json({
      success: true,
      data: {
        totalUsers: isHtx ? extraStats.totalFarmersCount : totalUsers,
        totalGroups,
        totalJournals,
        completedJournals,
        verifiedJournals: completedJournals,
        pendingApprovalsCount,
        pendingJournals: pendingApprovalsCount,
        inventoryCount,
        ...extraStats
      }
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê dashboard.' });
  }
};

// Dữ liệu biểu đồ trạng thái nhật ký
const getJournalStatusStats = async (req, res) => {
  try {
    const isAdmin = isAdminRole(req.user.role);
    const isHtx = isHtxRole(req.user.role);
    
    let filter = {};
    if (isAdmin) {
      filter = {};
    } else if (isHtx) {
      const htxFilter = await getHtxScopeFilter(req.user);
      filter = htxFilter || { _id: null };
    } else {
      filter = { userId: req.user._id };
    }
    
    const stats = await FarmJournal.aggregate([
      { $match: filter },
      { 
        $group: { 
          _id: {
            $cond: [
              { $eq: ["$status", "Draft"] }, "Bản nháp",
              { $cond: [
                { $eq: ["$status", "Submitted"] }, "Chờ duyệt",
                { $cond: [
                  { $eq: ["$status", "Verified"] }, "Đã duyệt",
                  "Khác"
                ]}
              ]}
            ]
          }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const formattedData = stats.map(s => ({
      name: s._id,
      value: s.count
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu biểu đồ trạng thái.' });
  }
};

// Dữ liệu biểu đồ hoạt động theo tháng (6 tháng gần nhất)
const getActivityTimeline = async (req, res) => {
  try {
    const isAdmin = isAdminRole(req.user.role);
    const isHtx = isHtxRole(req.user.role);

    let filter = {};
    if (isAdmin) {
      filter = {};
    } else if (isHtx) {
      const htxFilter = await getHtxScopeFilter(req.user);
      filter = htxFilter || { _id: null };
    } else {
      filter = { userId: req.user._id };
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const stats = await FarmJournal.aggregate([
      { 
        $match: { 
          ...filter,
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const formattedData = stats.map(s => ({
      name: `T${s._id.month}/${s._id.year}`,
      hoat_dong: s.count
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy dữ liệu dòng thời gian.' });
  }
};

module.exports = { 
  getDashboardStats, 
  getJournalStatusStats, 
  getActivityTimeline 
};
