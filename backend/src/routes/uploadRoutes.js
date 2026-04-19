const express = require('express');
const router = express.Router();
const { uploadAvatar, uploadDocument } = require('../controllers/uploadController');
const { protect } = require('../middlewares/authMiddleware');
const { uploadAvatar: uploadAvatarMiddleware, uploadDocument: uploadDocumentMiddleware } = require('../middlewares/uploadMiddleware');

// Upload avatar
router.post('/avatar', protect, uploadAvatarMiddleware.single('avatar'), uploadAvatar);

// Upload document (cho journal)
router.post('/document', protect, uploadDocumentMiddleware.single('file'), uploadDocument);

module.exports = router;
