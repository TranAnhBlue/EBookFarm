const express = require('express');
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword,
  googleLogin,
  forceChangePassword,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.put('/force-change-password', protect, forceChangePassword);

module.exports = router;