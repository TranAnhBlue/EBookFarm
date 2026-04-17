const User = require('../models/User');
const Group = require('../models/Group');
const FarmJournal = require('../models/FarmJournal');
const { InventoryItem } = require('../models/Inventory');

// Tổng hợp thống kê nhanh cho Dashboard
const getDashboardStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    const userId = req.user._id;

    // Phân quyền dữ liệu
    const filter = isAdmin ? {} : { userId };

    const [totalUsers, totalGroups, totalJournals, completedJournals, inventoryCount] = await Promise.all([
      isAdmin ? User.countDocuments() : 0,
      isAdmin ? Group.countDocuments() : 0,
      FarmJournal.countDocuments(filter),
      FarmJournal.countDocuments({ ...filter, status: 'Completed' }),
      isAdmin ? InventoryItem.countDocuments() : 0
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalGroups,
        totalJournals,
        completedJournals,
        inventoryCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê dashboard.' });
  }
};

// Dữ liệu biểu đồ trạng thái nhật ký
const getJournalStatusStats = async (req, res) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { userId: req.user._id };
    
    const stats = await FarmJournal.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Format lại cho Recharts
    const formattedData = stats.map(s => ({
      name: s._id === 'Draft' ? 'Bản nháp' : 'Hoàn thành',
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
    const filter = req.user.role === 'Admin' ? {} : { userId: req.user._id };
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
