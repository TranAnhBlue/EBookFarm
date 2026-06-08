const path = require('path');
const axios = require('axios');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

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

    const fileUrl = req.file.path;
    
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
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadDocumentFromUrl = async (req, res) => {
  try {
    const sourceUrl = String(req.body?.url || '').trim();
    if (!sourceUrl) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập URL tài liệu nguồn.' });
    }

    const parsedUrl = new URL(sourceUrl);
    if (parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ success: false, message: 'URL nguồn phải dùng HTTPS.' });
    }

    const head = await axios.head(sourceUrl, { timeout: 15000, maxRedirects: 5 }).catch(() => null);
    const contentType = head?.headers?.['content-type'] || '';
    const isPdf = contentType.includes('application/pdf') || parsedUrl.pathname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return res.status(400).json({ success: false, message: 'Nguồn phải là file PDF hợp lệ.' });
    }

    const filename = decodeURIComponent(parsedUrl.pathname.split('/').pop() || 'tai-lieu-nguon.pdf');
    const parsedFilename = path.parse(filename);
    const safeBaseName = parsedFilename.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'tai-lieu-nguon';
    const uploaded = await cloudinary.uploader.upload(sourceUrl, {
      folder: 'ebookfarm/documents',
      resource_type: 'raw',
      public_id: `${Date.now()}-${safeBaseName}`,
      format: 'pdf',
    });

    res.json({
      success: true,
      message: 'Đã tải PDF nguồn vào hệ thống.',
      data: {
        url: uploaded.secure_url,
        filename,
        sourceUrl,
        size: uploaded.bytes || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Không thể tải PDF nguồn.' });
  }
};

const proxyPdfDocument = async (req, res) => {
  try {
    const fileUrl = String(req.body?.url || '').trim();
    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Thiếu URL tài liệu PDF.' });
    }

    const parsedUrl = new URL(fileUrl);
    if (parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ success: false, message: 'URL tài liệu phải dùng HTTPS.' });
    }

    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        Accept: 'application/pdf,*/*',
        'User-Agent': 'EBookFarm/1.0 PDF Viewer',
      },
    });

    const contentType = response.headers?.['content-type'] || '';
    const looksLikePdf = contentType.includes('application/pdf') || Buffer.from(response.data).subarray(0, 4).toString() === '%PDF';
    if (!looksLikePdf) {
      return res.status(415).json({ success: false, message: 'Nguồn trả về không phải file PDF hợp lệ.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="tai-lieu-nguon.pdf"');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(Buffer.from(response.data));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Không thể mở tài liệu PDF.' });
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

module.exports = { uploadAvatar, uploadDocument, uploadDocumentFromUrl, proxyPdfDocument, uploadImage };
