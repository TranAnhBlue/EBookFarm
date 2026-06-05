const express = require('express');
const router = express.Router();
const { uploadAvatar, uploadDocument, uploadImage } = require('../controllers/uploadController');
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

// Upload ảnh chung (cho tin tức, bài viết)
router.post('/image', protect, uploadImageMiddleware.single('file'), uploadImage);

module.exports = router;
