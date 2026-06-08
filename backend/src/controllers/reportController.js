const User = require('../models/User');
const Group = require('../models/Group');
const FarmJournal = require('../models/FarmJournal');
const HtxJournal = require('../models/HtxJournal');
const { InventoryItem } = require('../models/Inventory');
const { isAdminRole, isHtxRole, getHtxOwnerId } = require('../utils/roles');
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
      const farmers = await User.find({ role: { $regex: /^farmer$/i }, htxId }).select('farmArea');
      const uniqueFarmerIds = new Set(farmers.map(farmer => farmer._id.toString()));
      let totalArea = farmers.reduce((sum, farmer) => sum + Number(farmer.farmArea || 0), 0);
      
      for (const hj of htxJournals) {
        for (const f of hj.farmers) {
          if (f.farmerId) {
            uniqueFarmerIds.add(f.farmerId._id.toString());
            
            let areaFound = false;
            // Try to get area from dynamic journal entries first
            if (f.farmJournalId && f.farmJournalId.entries) {
              const entries = f.farmJournalId.entries;
              for (const tableName in entries) {
                const tableData = entries[tableName];
                for (const fieldName in tableData) {
                  const lowerName = fieldName.toLowerCase();
                  if (['area', 'pond_area', 'farm_size', 'cultivation_area'].includes(lowerName)) {
                    const val = Number(tableData[fieldName]);
                    if (!isNaN(val) && val > 0) {
                      totalArea += val;
                      areaFound = true;
                      break; 
                    }
                  }
                }
                if (areaFound) break;
              }
            }
            
            if (!areaFound && !farmers.some(farmer => farmer._id.toString() === f.farmerId._id.toString())) {
              totalArea += (f.farmerId.farmArea || 0);
            }
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
