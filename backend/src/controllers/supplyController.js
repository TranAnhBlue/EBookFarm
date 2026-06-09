const SupplyRequest = require('../models/SupplyRequest');
const User = require('../models/User');
const { InventoryItem, InventoryTransaction } = require('../models/Inventory');
const { createNotification } = require('./notificationController');
const { ROLES, isAdminRole, isFarmerRole, isHtxRole, getHtxOwnerId } = require('../utils/roles');
const { notifyHtxRoles } = require('../utils/notificationHelpers');

// 1. Nông dân tạo yêu cầu mới
const createRequest = async (req, res) => {
  try {
    const { items, htxId, reason, isExternalPurchase, evidenceImage } = req.body;
    const farmerId = req.user._id;

    const request = await SupplyRequest.create({
      farmer: farmerId,
      htx: htxId,
      items,
      reason,
      isExternalPurchase: isExternalPurchase || false,
      evidenceImage: evidenceImage || null,
      status: 'Pending'
    });

    // Thông báo cho HTX
    await notifyHtxRoles({
      htxId,
      roles: [ROLES.HTX_DIRECTOR, ROLES.HTX_DISTRIBUTION, ROLES.HTX_TECHNICAL],
      sender: farmerId,
      title: 'Đơn xin cấp vật tư mới',
      message: `Nông dân ${req.user.fullname || req.user.username} vừa gửi đơn xin cấp vật tư.`,
      type: 'Supply_Request_Submitted',
      relatedId: request._id,
      relatedModel: 'SupplyRequest'
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Lấy danh sách yêu cầu (Nông dân hoặc HTX)
const getRequests = async (req, res) => {
  try {
    let query = {};
    if (isAdminRole(req.user.role)) {
       query = {};
    } else if (isHtxRole(req.user.role)) {
       query = { htx: getHtxOwnerId(req.user) };
    } else if (isFarmerRole(req.user.role)) {
       query = { farmer: req.user._id };
    } else {
       query = { farmer: req.user._id };
    }

    const requests = await SupplyRequest.find(query)
      .populate('farmer', 'fullname username phone avatar')
      .populate('htx', 'fullname username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Phê duyệt/Từ chối yêu cầu (HTX)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, htxFeedback, approvedItems } = req.body; // approvedItems contains mapping to inventoryItemId
    const htxId = getHtxOwnerId(req.user);

    const request = await SupplyRequest.findById(id).populate('farmer');
    if (!request) return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu.' });

    if (status === 'Approved') {
      if (request.isExternalPurchase) {
        // Xử lý duyệt hàng tự mua ngoài (Không trừ kho HTX)
        for (const requestedItem of request.items) {
          let farmerItem = await InventoryItem.findOne({ 
            name: requestedItem.itemName, 
            owner: request.farmer._id, 
            unit: requestedItem.unit 
          });

          if (farmerItem) {
            farmerItem.quantity += Number(requestedItem.quantity);
            await farmerItem.save();
          } else {
            farmerItem = await InventoryItem.create({
              name: requestedItem.itemName,
              category: requestedItem.category,
              unit: requestedItem.unit,
              quantity: Number(requestedItem.quantity),
              owner: request.farmer._id
            });
          }

          // Ghi log giao dịch cho nông dân
          await InventoryTransaction.create({
            itemId: farmerItem._id,
            type: 'Import',
            quantity: Number(requestedItem.quantity),
            performedBy: request.farmer._id,
            note: `HTX duyệt hàng tự mua ngoài (Mã đơn #${request._id})`,
            evidenceImage: request.evidenceImage || null
          });
        }
      } else {
        // Bắt đầu xử lý cấp phát vật tư (Từ kho HTX)
        for (const itemData of approvedItems) {
          const { inventoryItemId, quantity, originalItemIndex } = itemData;
          const requestedItem = request.items[originalItemIndex];

          // 1. Kiểm tra kho HTX
          const htxItem = await InventoryItem.findOne({ _id: inventoryItemId, owner: htxId });
          if (!htxItem) throw new Error(`Vật tư ${requestedItem.itemName} không tồn tại trong kho HTX.`);
          if (htxItem.quantity < quantity) throw new Error(`Số lượng ${htxItem.name} trong kho không đủ.`);

          // 2. Trừ kho HTX
          htxItem.quantity -= Number(quantity);
          await htxItem.save();

          // 3. Tăng kho Nông dân
          let farmerItem = await InventoryItem.findOne({ 
            name: htxItem.name, 
            owner: request.farmer._id, 
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
              owner: request.farmer._id
            });
          }

          // 4. Ghi log giao dịch
          await InventoryTransaction.create({
            itemId: htxItem._id,
            type: 'Distribute',
            quantity: Number(quantity),
            receiverId: request.farmer._id,
            performedBy: htxId,
            note: `Cấp phát theo đơn yêu cầu #${request._id}`
          });

          // Cập nhật ID vật tư vào đơn để truy vết
          request.items[originalItemIndex].inventoryItemId = inventoryItemId;
        }
      }

      request.approvedAt = new Date();
      request.approvedBy = htxId;
    }

    request.status = status;
    request.htxFeedback = htxFeedback;
    await request.save();

    // Thông báo cho Nông dân
    await createNotification({
      recipient: request.farmer._id,
      sender: htxId,
      title: status === 'Approved' ? 'Yêu cầu vật tư được chấp nhận' : 'Yêu cầu vật tư bị từ chối',
      message: status === 'Approved' 
        ? `HTX đã phê duyệt đơn xin cấp vật tư của bạn. Vật tư đã được cộng vào kho.` 
        : `Rất tiếc, đơn xin cấp vật tư của bạn bị từ chối. Lý do: ${htxFeedback}`,
      type: 'Supply_Request_Processed',
      relatedId: request._id,
      relatedModel: 'SupplyRequest'
    });

    res.json({ success: true, message: `Đã ${status === 'Approved' ? 'phê duyệt' : 'từ chối'} yêu cầu.`, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Nông dân hủy yêu cầu (Chỉ khi đang Pending)
const cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user._id;

    const request = await SupplyRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu vật tư.' });
    }

    // Kiểm tra quyền sở hữu
    if (request.farmer.toString() !== farmerId.toString()) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền hủy yêu cầu này.' });
    }

    // Chỉ cho phép hủy khi trạng thái là Pending
    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể hủy yêu cầu đang ở trạng thái chờ duyệt.' });
    }

    await notifyHtxRoles({
      htxId: request.htx,
      roles: [ROLES.HTX_DIRECTOR, ROLES.HTX_DISTRIBUTION, ROLES.HTX_TECHNICAL],
      sender: farmerId,
      title: 'Nông dân đã hủy yêu cầu vật tư',
      message: `${req.user.fullname || req.user.username} đã hủy một yêu cầu vật tư đang chờ xử lý.`,
      type: 'Supply_Request_Processed',
      relatedId: request._id,
      relatedModel: 'SupplyRequest'
    });

    await SupplyRequest.findByIdAndDelete(id);

    res.json({ success: true, message: 'Đã hủy yêu cầu vật tư thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  updateRequestStatus,
  cancelRequest
};
