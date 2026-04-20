const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password');
      
      console.log('🔐 Protect middleware - User loaded:', {
        id: req.user?._id,
        username: req.user?.username,
        role: req.user?.role
      });
      
      return next();
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
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
  
  if (req.user && req.user.role === 'Admin') {
    console.log('✅ Admin access granted');
    next();
  } else {
    console.log('❌ Admin access denied - Role:', req.user?.role);
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };