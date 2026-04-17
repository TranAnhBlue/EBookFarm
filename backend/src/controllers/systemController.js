const User = require('../models/User');
const Group = require('../models/Group');
const FarmJournal = require('../models/FarmJournal');
const FormSchema = require('../models/FormSchema');
const AgriModel = require('../models/AgriModel');
const { InventoryItem, InventoryTransaction } = require('../models/Inventory');
const Log = require('../models/Log');

const exportDatabase = async (req, res) => {
  try {
    // Thu thập dữ liệu từ tất cả các bảng
    const [
      users, 
      groups, 
      journals, 
      schemas, 
      agriModels, 
      inventoryItems, 
      inventoryTransactions,
      logs
    ] = await Promise.all([
      User.find({}).lean(),
      Group.find({}).lean(),
      FarmJournal.find({}).lean(),
      FormSchema.find({}).lean(),
      AgriModel.find({}).lean(),
      InventoryItem.find({}).lean(),
      InventoryTransaction.find({}).lean(),
      Log.find({}).lean()
    ]);

    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      exportedBy: req.user.username,
      data: {
        users,
        groups,
        journals,
        schemas,
        agriModels,
        inventory: {
          items: inventoryItems,
          transactions: inventoryTransactions
        },
        logs
      }
    };

    // Thiết lập header để trình duyệt hiểu đây là file tải về
    const fileName = `EBookFarm_Backup_${new Date().toISOString().split('T')[0]}.json`;
    res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(backupData, null, 2));
    res.end();

  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi trong quá trình xuất dữ liệu sao lưu.' });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const [userCount, journalCount, logCount] = await Promise.all([
      User.countDocuments(),
      FarmJournal.countDocuments(),
      Log.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        userCount,
        journalCount,
        logCount,
        environment: process.env.NODE_ENV || 'development',
        dbStatus: 'Connected'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thông số hệ thống.' });
  }
};

module.exports = { exportDatabase, getSystemStats };
