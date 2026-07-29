/**
 * Controller: Quản lý danh sách hộ sản xuất VietGAP
 */

const VietGAPHousehold = require('../models/VietGAPHousehold');

// @desc    Lấy danh sách hộ sản xuất
// @route   GET /api/vietgap-households
// @access  Private
exports.getHouseholds = async (req, res) => {
  try {
    const { htxId, trangThai, search, page = 1, limit = 100 } = req.query;
    const query = {};

    // Filter by HTX
    if (htxId) {
      query.htxId = htxId;
    } else if (req.user.role.includes('HTX')) {
      // Nếu user là HTX, chỉ xem hộ của mình
      query.htxId = req.user._id;
    }

    // Filter by status
    if (trangThai) {
      query.trangThai = trangThai;
    } else {
      query.trangThai = 'Hoạt động'; // Mặc định chỉ lấy hộ đang hoạt động
    }

    // Search
    if (search) {
      query.$or = [
        { tenHo: { $regex: search, $options: 'i' } },
        { maSoNongHo: { $regex: search, $options: 'i' } }
      ];
    }

    const households = await VietGAPHousehold.find(query)
      .populate('htxId', 'fullname organization')
      .populate('createdBy', 'fullname')
      .sort({ tenHo: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await VietGAPHousehold.countDocuments(query);

    res.json({
      success: true,
      data: households,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error getting households:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hộ sản xuất',
      error: error.message
    });
  }
};

// @desc    Lấy danh sách hộ cho dropdown (chỉ thông tin cần thiết)
// @route   GET /api/vietgap-households/dropdown
// @access  Private
exports.getHouseholdsForDropdown = async (req, res) => {
  try {
    const { htxId } = req.query;
    const query = { trangThai: 'Hoạt động' };

    // Filter by HTX
    if (htxId) {
      query.htxId = htxId;
    } else if (req.user.role.includes('HTX')) {
      query.htxId = req.user._id;
    }

    const households = await VietGAPHousehold.find(query)
      .select('tenHo maSoNongHo dienTich thon xuDong')
      .sort({ tenHo: 1 })
      .lean();

    res.json({
      success: true,
      data: households
    });
  } catch (error) {
    console.error('Error getting households for dropdown:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hộ',
      error: error.message
    });
  }
};

// @desc    Tạo hộ sản xuất mới
// @route   POST /api/vietgap-households
// @access  Private (HTX, Admin)
exports.createHousehold = async (req, res) => {
  try {
    const householdData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Nếu là HTX tạo, tự động gán htxId
    if (req.user.role.includes('HTX')) {
      householdData.htxId = req.user._id;
      householdData.htxName = req.user.fullname || req.user.organization;
    }

    const household = await VietGAPHousehold.create(householdData);

    res.status(201).json({
      success: true,
      message: 'Tạo hộ sản xuất thành công',
      data: household
    });
  } catch (error) {
    console.error('Error creating household:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Mã số nông hộ đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo hộ sản xuất',
      error: error.message
    });
  }
};

// @desc    Cập nhật hộ sản xuất
// @route   PUT /api/vietgap-households/:id
// @access  Private (HTX, Admin)
exports.updateHousehold = async (req, res) => {
  try {
    const household = await VietGAPHousehold.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ sản xuất'
      });
    }

    // Check permission
    if (req.user.role.includes('HTX') && household.htxId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật hộ này'
      });
    }

    const updatedHousehold = await VietGAPHousehold.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Cập nhật hộ sản xuất thành công',
      data: updatedHousehold
    });
  } catch (error) {
    console.error('Error updating household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật hộ sản xuất',
      error: error.message
    });
  }
};

// @desc    Xóa hộ sản xuất (soft delete)
// @route   DELETE /api/vietgap-households/:id
// @access  Private (HTX, Admin)
exports.deleteHousehold = async (req, res) => {
  try {
    const household = await VietGAPHousehold.findById(req.params.id);

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ sản xuất'
      });
    }

    // Check permission
    if (req.user.role.includes('HTX') && household.htxId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa hộ này'
      });
    }

    // Soft delete
    household.trangThai = 'Đã xóa';
    household.updatedBy = req.user._id;
    await household.save();

    res.json({
      success: true,
      message: 'Xóa hộ sản xuất thành công'
    });
  } catch (error) {
    console.error('Error deleting household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa hộ sản xuất',
      error: error.message
    });
  }
};

// @desc    Lấy thông tin chi tiết hộ sản xuất
// @route   GET /api/vietgap-households/:id
// @access  Private
exports.getHouseholdById = async (req, res) => {
  try {
    const household = await VietGAPHousehold.findById(req.params.id)
      .populate('htxId', 'fullname organization')
      .populate('createdBy', 'fullname')
      .populate('updatedBy', 'fullname');

    if (!household) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hộ sản xuất'
      });
    }

    res.json({
      success: true,
      data: household
    });
  } catch (error) {
    console.error('Error getting household:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin hộ sản xuất',
      error: error.message
    });
  }
};

// @desc    Import hộ sản xuất từ Excel
// @route   POST /api/vietgap-households/import
// @access  Private (HTX, Admin)
exports.importHouseholds = async (req, res) => {
  try {
    const { households } = req.body;
    
    if (!Array.isArray(households) || households.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ'
      });
    }
    
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    for (const householdData of households) {
      try {
        const data = {
          ...householdData,
          createdBy: req.user._id
        };
        
        // Nếu là HTX, tự động gán htxId
        if (req.user.role.includes('HTX')) {
          data.htxId = req.user._id;
          data.htxName = req.user.fullname || req.user.organization;
        }
        
        await VietGAPHousehold.create(data);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          tenHo: householdData.tenHo,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: `Import thành công ${results.success}/${households.length} hộ`,
      data: results
    });
  } catch (error) {
    console.error('Error importing households:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi import hộ sản xuất',
      error: error.message
    });
  }
};
