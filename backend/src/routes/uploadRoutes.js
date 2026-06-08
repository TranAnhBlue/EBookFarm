const express = require('express');
const router = express.Router();
const { uploadAvatar, uploadDocument, uploadDocumentFromUrl, proxyPdfDocument, uploadImage } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');
const {
  uploadAvatar: uploadAvatarMiddleware,
  uploadImage: uploadImageMiddleware,
  uploadDocument: uploadDocumentMiddleware,
} = require('../middlewares/uploadMiddleware');

// Upload avatar
router.post('/avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Upload document (cho journal)
router.post('/document', protect, uploadDocumentMiddleware.single('file'), uploadDocument);

// Upload document from official URL into Cloudinary
router.post('/document-from-url', protect, uploadDocumentFromUrl);

// View PDF through backend so browsers do not depend on Cloudinary resource delivery quirks
router.post('/document-proxy', protect, proxyPdfDocument);

// Upload ảnh chung (cho tin tức, bài viết)
router.post('/image', protect, uploadImageMiddleware.single('file'), uploadImage);

module.exports = router;
