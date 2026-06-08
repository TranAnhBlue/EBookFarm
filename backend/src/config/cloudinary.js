const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const documentExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx']);

const extensionFilter = (allowedExtensions, message) => (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  cb(allowedExtensions.has(extension) ? null : new Error(message), allowedExtensions.has(extension));
};

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ebookfarm/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
  },
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ebookfarm/images',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
    transformation: [{ width: 2000, height: 2000, crop: 'limit', quality: 'auto' }],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'ebookfarm/documents',
    resource_type: 'raw',
    public_id: `${Date.now()}-${path.parse(file.originalname).name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
    format: path.extname(file.originalname).replace('.', '').toLowerCase() || undefined,
  }),
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: extensionFilter(imageExtensions, 'Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WebP.'),
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: extensionFilter(imageExtensions, 'Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WebP.'),
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: extensionFilter(documentExtensions, 'Định dạng tài liệu không được hỗ trợ.'),
});

module.exports = { cloudinary, uploadAvatar, uploadImage, uploadDocument };
