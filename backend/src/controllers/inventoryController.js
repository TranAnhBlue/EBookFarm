const { InventoryItem, InventoryTransaction } = require('../models/Inventory');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// Lấy danh sách vật tư của HTX hoặc Nông dân
const getInventory = async (req, res) => {
  try {
    let filter = {};
    if (req.user) {
      // Nếu có user (Admin/Farmer), lọc theo quyền
      filter = req.user.role?.toUpperCase() === 'ADMIN' ? {} : { owner: req.user._id };
    }
    // Nếu không có user (yêu cầu từ Trace page), cho phép lấy toàn bộ để map ID -> Tên
    
    const items = await InventoryItem.find(filter).sort({ updatedAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Thêm vật tư mới (Nhập kho)
const addItem = async (req, res) => {
  try {
    const { name, category, unit, quantity, minQuantity, note, evidenceImage } = req.body;
    const owner = req.user._id;

    // Kiểm tra xem đã có vật tư này chưa
    let item = await InventoryItem.findOne({ name, owner, unit });

    if (item) {
      item.quantity += Number(quantity);
      await item.save();
    } else {
      item = await InventoryItem.create({
        name, category, unit, quantity, minQuantity, owner
      });
    }

    // Ghi log giao dịch
    await InventoryTransaction.create({
      itemId: item._id,
      type: 'Import',
      quantity: Number(quantity),
      performedBy: owner,
      note: note || 'Nhập kho hệ thống',
      evidenceImage: evidenceImage || null
    });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// HTX cấp phát vật tư cho nông dân
const distributeItem = async (req, res) => {
  try {
    const { itemId, farmerId, quantity, note } = req.body;
    const htxId = req.user._id;

    // 1. Kiểm tra kho HTX
    const htxItem = await InventoryItem.findOne({ _id: itemId, owner: htxId });
    if (!htxItem) return res.status(404).json({ success: false, message: 'Vật tư không tồn tại trong kho HTX.' });
    if (htxItem.quantity < quantity) return res.status(400).json({ success: false, message: 'Số lượng trong kho không đủ để cấp phát.' });

    // 2. Trừ kho HTX
    htxItem.quantity -= Number(quantity);
    await htxItem.save();

    // 3. Tăng kho Nông dân (Hoặc tạo mới nếu chưa có)
    let farmerItem = await InventoryItem.findOne({ 
      name: htxItem.name, 
      owner: farmerId, 
      unit: htxItem.unit 
    });

    if (farmerItem) {
      farmerItem.quantity += Number(quantity);
      await farmerItem.save();
    } else {
      farmerItem = await InventoryItem.create({
        name: htxItem.name,
        category: htxItem.category,
        unit: htxItem.unit,
        quantity: Number(quantity),
        owner: farmerId
      });
    }

    // 4. Ghi log giao dịch cấp phát
    await InventoryTransaction.create({
      itemId: htxItem._id,
      type: 'Distribute',
      quantity: Number(quantity),
      receiverId: farmerId,
      performedBy: htxId,
      note: note || `Cấp phát từ HTX`
    });

    // 5. Gửi thông báo cho Nông dân
    await createNotification({
      recipient: farmerId,
      sender: htxId,
      title: 'Nhận vật tư mới',
      message: `HTX vừa cấp cho bạn ${quantity} ${htxItem.unit} ${htxItem.name}. Vui lòng kiểm tra mục Tồn kho.`,
      type: 'System',
      relatedId: farmerItem._id,
      relatedModel: 'InventoryItem'
    });

    res.json({ success: true, message: 'Cấp phát vật tư thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lịch sử giao dịch
const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    // Tìm các giao dịch mà user này thực hiện hoặc nhận
    const transactions = await InventoryTransaction.find({
      $or: [
        { performedBy: userId },
        { receiverId: userId }
      ]
    })
    .populate('itemId', 'name unit category')
    .populate('receiverId', 'fullname username')
    .populate('performedBy', 'fullname username')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Nông dân sử dụng vật tư (Trừ kho khi ghi nhật ký)
const consumeItem = async (req, res) => {
  try {
    const { itemId, quantity, note, journalId } = req.body;
    const userId = req.user._id;

    const item = await InventoryItem.findOne({ _id: itemId, owner: userId });
    if (!item) return res.status(404).json({ success: false, message: 'Vật tư không tồn tại trong kho của bạn.' });
    if (item.quantity < quantity) return res.status(400).json({ success: false, message: 'Số lượng trong kho không đủ.' });

    item.quantity -= Number(quantity);
    await item.save();

    await InventoryTransaction.create({
      itemId: item._id,
      type: 'Export', 
      quantity: Number(quantity),
      performedBy: userId,
      note: note || `Sử dụng trong nhật ký: ${journalId || 'N/A'}`
    });

    res.json({ success: true, message: 'Đã trừ tồn kho vật tư.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  addItem,
  distributeItem,
  getTransactions,
  consumeItem
};