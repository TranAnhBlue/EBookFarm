const ProductionBatch = require('../models/ProductionBatch');
const Product = require('../models/Product');
const FarmJournal = require('../models/FarmJournal');
const HtxJournal = require('../models/HtxJournal');
const User = require('../models/User');
const QRCode = require('qrcode');
const { syncBatchToPortal } = require('../utils/nationalPortalService');
const { createLog } = require('./logController');
const { createNotification } = require('./notificationController');

/**
 * HTX tạo lô sản xuất mới
 */
const createBatch = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    const isHtxDirector = role === 'HTX' || role === 'HTX_DIRECTOR';
    if (!isHtxDirector && role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Chỉ HTX hoặc Admin mới có thể tạo lô sản xuất.' });
    }

    const { batchCode, productId, htxJournalId, productionDate, expiryDate, quantity, unit, productionLocation, notes } = req.body;

    // Kiểm tra sản phẩm tồn tại và thuộc HTX này
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm.' });
    if (role !== 'ADMIN' && product.manufacturerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Sản phẩm không thuộc quyền quản lý của bạn.' });
    }

    // Lấy danh sách FarmJournal từ HtxJournal nếu có
    let farmJournalIds = [];
    if (htxJournalId) {
      const htxJournal = await HtxJournal.findById(htxJournalId);
      if (htxJournal) {
        farmJournalIds = htxJournal.farmers
          .filter(f => f.farmJournalId)
          .map(f => f.farmJournalId);
      }
    }

    const batch = new ProductionBatch({
      batchCode, productId, htxJournalId,
      farmJournalIds, productionDate, expiryDate,
      quantity, unit, productionLocation, notes,
      createdBy: req.user._id
    });

    const saved = await batch.save();

    // Sinh QR Code (GS1 Digital Link format)
    const traceUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/trace/batch/${saved.traceId}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(traceUrl, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: { dark: '#1a1a1a', light: '#ffffff' }
      });
      saved.qrCodeUrl = traceUrl;
      saved.qrCodeImage = qrDataUrl;
      await saved.save();
    } catch (qrErr) {
      console.error('Lỗi sinh QR:', qrErr.message);
    }

    // Cập nhật batchId vào các FarmJournal liên quan
    if (farmJournalIds.length > 0) {
      await FarmJournal.updateMany(
        { _id: { $in: farmJournalIds } },
        { $set: { batchId: saved._id } }
      );
    }

    await createLog(req.user._id, 'Tạo lô sản xuất', saved._id, 'ProductionBatch', {
      batchCode, productId, traceId: saved.traceId
    });

    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy danh sách lô sản xuất
 */
const getBatches = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    let filter = {};

    const isHtxDirector = role === 'HTX' || role === 'HTX_DIRECTOR';
    if (isHtxDirector) {
      // Chỉ lấy lô của HTX này (qua sản phẩm thuộc HTX)
      filter.createdBy = req.user._id;
    }

    const batches = await ProductionBatch.find(filter)
      .populate('productId', 'name gtin category images')
      .populate('htxJournalId', 'name status')
      .populate('createdBy', 'fullname username organization')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy chi tiết lô sản xuất (bao gồm tất cả nhật ký liên quan)
 */
const getBatchById = async (req, res) => {
  try {
    const batch = await ProductionBatch.findById(req.params.id)
      .populate('productId')
      .populate('htxJournalId', 'name description status schemaId')
      .populate({
        path: 'farmJournalIds',
        populate: [
          { path: 'userId', select: 'fullname username farmName farmArea province ward' },
          { path: 'schemaId', select: 'name category' }
        ]
      })
      .populate('createdBy', 'fullname username organization province ward address');

    if (!batch) return res.status(404).json({ success: false, message: 'Không tìm thấy lô sản xuất.' });

    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Tra cứu lô hàng theo traceId (public - không cần đăng nhập)
 * Đây là endpoint được gọi khi người dùng quét QR
 */
const getBatchByTraceId = async (req, res) => {
  try {
    const { traceId } = req.params;
    const batch = await ProductionBatch.findOne({ traceId })
      .populate({
        path: 'productId',
        populate: { path: 'manufacturerId', select: 'fullname username organization province ward address phone certifications' }
      })
      .populate({
        path: 'farmJournalIds',
        match: { status: { $in: ['Verified', 'Locked'] } }, // Chỉ hiển thị nhật ký đã được duyệt
        populate: [
          { path: 'userId', select: 'fullname username farmName farmArea province ward certifications' },
          { path: 'schemaId', select: 'name category' }
        ]
      });

    if (!batch) return res.status(404).json({ success: false, message: 'Không tìm thấy lô hàng.' });

    // Đếm view
    // Không cần thiết cho batch, nhưng log có thể thêm sau

    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Đồng bộ lô hàng lên Cổng TXNG Quốc Gia
 */
const syncBatchToNationalPortal = async (req, res) => {
  try {
    const batch = await ProductionBatch.findById(req.params.id);
    if (!batch) return res.status(404).json({ success: false, message: 'Không tìm thấy lô sản xuất.' });

    const role = req.user.role?.toUpperCase();
    const isHtxDirector = role === 'HTX' || role === 'HTX_DIRECTOR';
    if (!isHtxDirector && role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Chỉ HTX hoặc Admin mới có thể đồng bộ.' });
    }

    const product = await Product.findById(batch.productId);
    if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm của lô.' });

    if (!product.portalProductId) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm chưa được đăng ký trên cổng quốc gia. Vui lòng đăng ký sản phẩm trước khi đồng bộ lô hàng.'
      });
    }

    // Lấy thông tin HTX
    const htxUser = await User.findById(batch.createdBy);
    if (!htxUser?.portalCredentials?.apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chưa cấu hình API cổng quốc gia. Vào Cài đặt → Cổng Quốc Gia để nhập thông tin.' 
      });
    }

    // Lấy các FarmJournal đã được duyệt (Verified)
    const farmJournals = await FarmJournal.find({
      _id: { $in: batch.farmJournalIds },
      status: { $in: ['Verified', 'Locked'] }
    }).populate('userId', 'fullname username farmName province ward');

    // Cập nhật trạng thái Pending
    batch.portalSyncStatus = 'Pending';
    batch.portalSyncAttempts = (batch.portalSyncAttempts || 0) + 1;
    await batch.save();

    // Gọi service đồng bộ
    const result = await syncBatchToPortal(batch, product, farmJournals, htxUser, req.user._id);

    if (result.success) {
      batch.portalBatchId = result.portalBatchId;
      batch.portalSyncStatus = 'Synced';
      batch.portalSyncedAt = new Date();
      batch.portalLastError = null;
      await batch.save();

      // Cập nhật lastSyncAt cho HTX
      await User.findByIdAndUpdate(htxUser._id, {
        'portalCredentials.lastSyncAt': new Date()
      });

      // Thông báo cho admin
      const admins = await User.find({ role: { $regex: /^admin$/i } });
      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          sender: req.user._id,
          title: 'Đồng bộ lô hàng thành công',
          message: `Lô ${batch.batchCode} đã được đồng bộ lên Cổng TXNG Quốc Gia.`,
          type: 'System',
          relatedId: batch._id,
          relatedModel: 'ProductionBatch'
        });
      }

      return res.json({
        success: true,
        message: `Lô hàng "${batch.batchCode}" đã đồng bộ thành công lên Cổng TXNG Quốc Gia.`,
        portalBatchId: result.portalBatchId,
        data: batch
      });
    } else {
      batch.portalSyncStatus = 'Failed';
      batch.portalLastError = result.error;
      await batch.save();

      return res.status(502).json({
        success: false,
        message: `Đồng bộ thất bại: ${result.error}`,
        data: batch
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy lịch sử đồng bộ của một lô
 */
const getBatchSyncHistory = async (req, res) => {
  try {
    const SyncLog = require('../models/SyncLog');
    const logs = await SyncLog.find({ 
      entityId: req.params.id, 
      entityType: 'ProductionBatch' 
    })
      .populate('performedBy', 'fullname username')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBatch, getBatches, getBatchById, getBatchByTraceId,
  syncBatchToNationalPortal, getBatchSyncHistory
};
