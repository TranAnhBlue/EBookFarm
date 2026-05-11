const User = require('../models/User');
const SyncLog = require('../models/SyncLog');
const { verifyPortalCredentials } = require('../utils/nationalPortalService');

/**
 * HTX lưu thông tin API cổng quốc gia
 */
const savePortalCredentials = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    if (role !== 'HTX' && role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Chỉ HTX mới có thể cấu hình thông tin cổng quốc gia.' });
    }

    const { enterpriseCode, apiKey, apiSecret, portalUsername } = req.body;
    if (!enterpriseCode || !apiKey) {
      return res.status(400).json({ success: false, message: 'Mã doanh nghiệp và API Key là bắt buộc.' });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'portalCredentials.enterpriseCode': enterpriseCode,
          'portalCredentials.apiKey': apiKey,
          'portalCredentials.apiSecret': apiSecret || '',
          'portalCredentials.portalUsername': portalUsername || '',
          'portalCredentials.registeredAt': new Date(),
          'portalCredentials.isVerified': false // Reset, cần verify lại
        }
      },
      { new: true, select: '-password -portalCredentials.apiKey -portalCredentials.apiSecret' }
    );

    res.json({ success: true, message: 'Đã lưu thông tin API cổng quốc gia.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Kiểm tra kết nối với cổng quốc gia
 */
const verifyPortalConnection = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.portalCredentials?.apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chưa cấu hình thông tin API. Vui lòng nhập mã doanh nghiệp và API Key trước.' 
      });
    }

    const result = await verifyPortalCredentials(user.portalCredentials);

    if (result.success) {
      // Đánh dấu đã xác thực
      await User.findByIdAndUpdate(req.user._id, {
        'portalCredentials.isVerified': true
      });
      return res.json({ success: true, message: 'Kết nối thành công với Cổng TXNG Quốc Gia!', data: result.data });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        'portalCredentials.isVerified': false
      });
      return res.status(502).json({ 
        success: false, 
        message: `Kết nối thất bại: ${result.error}`,
        httpStatus: result.httpStatus
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy thông tin credentials hiện tại (che API Key)
 */
const getPortalStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('portalCredentials');
    const creds = user?.portalCredentials;

    res.json({
      success: true,
      data: {
        enterpriseCode: creds?.enterpriseCode || null,
        portalUsername: creds?.portalUsername || null,
        registeredAt: creds?.registeredAt || null,
        isVerified: creds?.isVerified || false,
        lastSyncAt: creds?.lastSyncAt || null,
        hasApiKey: !!creds?.apiKey,
        // Che API key, chỉ hiện 4 ký tự cuối
        apiKeyMasked: creds?.apiKey ? `****${creds.apiKey.slice(-4)}` : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lấy toàn bộ lịch sử đồng bộ của HTX
 */
const getSyncHistory = async (req, res) => {
  try {
    const role = req.user.role?.toUpperCase();
    
    // Admin xem tất cả, HTX chỉ xem của mình
    const filter = role === 'ADMIN' ? {} : { performedBy: req.user._id };

    const { page = 1, limit = 20, status } = req.query;
    if (status) filter.status = status;

    const logs = await SyncLog.find(filter)
      .populate('performedBy', 'fullname username organization')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await SyncLog.countDocuments(filter);

    res.json({ 
      success: true, 
      data: logs, 
      pagination: { total, page: Number(page), limit: Number(limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { savePortalCredentials, verifyPortalConnection, getPortalStatus, getSyncHistory };
