const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAdminRole, isHtxRole } = require('../utils/roles');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id)
        .select('-password')
        .populate('htxId', 'fullname username email phone')
        .populate('groupId', 'name');
      
      if (!req.user) {
        console.error('❌ User not found in database');
        return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại hoặc đã bị xóa. Vui lòng đăng nhập lại.' });
      }

      // Kiểm tra nếu mật khẩu đã bị đổi sau khi token được cấp
      if (req.user.lastPasswordChange) {
        const passwordChangedTimestamp = parseInt(req.user.lastPasswordChange.getTime() / 1000, 10);
        if (decoded.iat < passwordChangedTimestamp) {
          console.log('⚠️ Token invalidated due to password change');
          return res.status(401).json({ 
            success: false, 
            message: 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại để tiếp tục.' 
          });
        }
      }

      console.log('🔐 Protect middleware - User loaded:', {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      });
      
      return next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' });
    }
  }

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  console.log('🔍 Admin middleware - User:', {
    exists: !!req.user,
    role: req.user?.role,
    id: req.user?._id
  });
  
  if (req.user && isAdminRole(req.user.role)) {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - Role:', req.user?.role);
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

const htx = (req, res, next) => {
  console.log('🔍 HTX middleware - User:', {
    exists: !!req.user,
    role: req.user?.role,
    id: req.user?._id
  });
  
  if (req.user && isHtxRole(req.user.role)) {
    console.log('✅ HTX access granted');
    next();
  } else {
    console.log('❌ HTX access denied - Role:', req.user?.role);
    res.status(403).json({ success: false, message: 'Not authorized as an HTX' });
  }
};

const htxOrAdmin = (req, res, next) => {
  if (req.user && (isHtxRole(req.user.role) || isAdminRole(req.user.role))) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as HTX or Admin' });
  }
};

module.exports = { protect, admin, htx, htxOrAdmin };
