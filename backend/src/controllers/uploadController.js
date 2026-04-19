const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên!' });
    }

    // Lấy thông tin user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      // Xóa file vừa upload nếu user không tồn tại
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'User không tồn tại!' });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Lưu đường dẫn avatar mới
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Upload avatar thành công!',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    // Xóa file nếu có lỗi
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload file tài liệu (cho journal)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên!' });
    }

    const fileUrl = `/uploads/documents/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      message: 'Upload file thành công!',
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadAvatar, uploadDocument };
