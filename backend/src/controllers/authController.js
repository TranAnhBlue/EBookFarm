const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, fullname } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email là bắt buộc' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng' });
    }

    const user = await User.create({
      username: username || email.split('@')[0], // Fallback username
      email,
      password,
      fullname,
      role: role || 'User'
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          token: generateToken(user.id, user.role),
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ.' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email hoặc tên đăng nhập đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ khi đăng ký tài khoản.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    // Check by email or username
    const user = await User.findOne({ 
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (user && user.status === 'Active' && (await user.matchPassword(password))) {
      // Log successful login
      const { createLog } = require('./logController');
      await createLog(user._id, 'Đăng nhập hệ thống', user._id, 'User', { 
        username: user.username,
        email: user.email,
        ip: req.ip || req.connection.remoteAddress
      });

      res.json({
        success: true,
        data: {
          _id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword || false, // Thêm flag này
          token: generateToken(user.id, user.role),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email không tồn tại trên hệ thống' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const sendEmail = require('../utils/sendEmail');
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">EBookFarm</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-weight: bold;">GIẢI PHÁP NÔNG NGHIỆP SỐ</p>
        </div>
        
        <div style="background-color: #f0fdf4; border-radius: 16px; padding: 30px; border: 1px solid #dcfce7;">
          <h2 style="margin-top: 0; color: #16a34a;">Yêu cầu đặt lại mật khẩu</h2>
          <p>Chào bạn,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${user.email}</strong> trên hệ thống EBookFarm.</p>
          <p>Để tiếp tục, vui lòng nhấn vào nút bên dưới:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Đặt lại mật khẩu ngay
            </a>
          </div>
          
          <p style="font-size: 13px; color: #666;">
            Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dcfce7; font-size: 11px; color: #999;">
            <p>Liên kết này sẽ hết hạn sau <strong>10 phút</strong> vì lý do bảo mật.</p>
            <p>Nếu nút bấm không hoạt động, hãy copy đường dẫn sau vào trình duyệt:</p>
            <p style="word-break: break-all; color: #16a34a;">${resetUrl}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
          <p>© 2026 EBookFarm. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    `;

    try {
      console.log(`Attempting to send reset email to: ${user.email}`);
      await sendEmail({
        email: user.email,
        subject: '[EBookFarm] Yêu cầu khôi phục mật khẩu tài khoản',
        html: html
      });

      res.status(200).json({ 
        success: true, 
        message: 'Hệ thống đã gửi link khôi phục mật khẩu vào Email của bạn.'
      });
    } catch (err) {
      console.error('Email send error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Không thể gửi email lúc này. Vui lòng thử lại sau.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const crypto = require('crypto');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { name, email, sub } = ticket.getPayload();

    let user = await User.findOne({ $or: [{ googleId: sub }, { email }] });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        fullname: name, // Set fullname from Google
        email,
        googleId: sub,
        role: 'User',
        status: 'Active'
      });
    } else if (!user.googleId) {
      // Link google account to existing email account
      user.googleId = sub;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        _id: user.id,
        username: user.username,
        fullname: user.fullname, // Add fullname to response
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đổi mật khẩu bắt buộc lần đầu
const forceChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    }

    // Update password and clear flag
    user.password = newPassword;
    user.mustChangePassword = false;
    user.lastPasswordChange = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
      data: {
        _id: user.id,
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        mustChangePassword: false,
        token: generateToken(user.id, user.role),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout - Log activity
const logoutUser = async (req, res) => {
  try {
    const { createLog } = require('./logController');
    await createLog(req.user.id, 'Đăng xuất hệ thống', req.user.id, 'User', { 
      username: req.user.username,
      email: req.user.email,
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, googleLogin, forceChangePassword, logoutUser };