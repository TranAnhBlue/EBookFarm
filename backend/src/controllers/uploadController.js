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
      return res.status(404).json({ success: false, message: 'User không tồn tại!' });
    }

    // Lưu đường dẫn avatar mới (Cloudinary URL)
    const avatarUrl = req.file.path;
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
    // Với Cloudinary, lỗi upload sẽ được multer xử lý trước khi vào controller
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

// Upload ảnh chung (cho tin tức, gallery)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên!' });
    }
    // Cloudinary trả về URL qua req.file.path
    const imageUrl = req.file.path;
    res.json({
      success: true,
      message: 'Upload ảnh thành công!',
      url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadAvatar, uploadDocument, uploadImage };
