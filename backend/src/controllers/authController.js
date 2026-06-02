const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Otp = require('../models/Otp');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, fullname, phone, otp } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email lÃ  báº¯t buá»™c' });
    }

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡. Vui lÃ²ng nháº­p tá»« 10-11 chá»¯ sá»‘.' });
    }

    const userExists = await User.findOne({ 
      $or: [
        { email },
        { username: phone || username },
        { phone: phone }
      ]
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email hoáº·c Sá»‘ Ä‘iá»‡n thoáº¡i (TÃªn tÃ i khoáº£n) Ä‘Ã£ tá»“n táº¡i' });
    }

    // ÄÄƒng kÃ½ trá»±c tiáº¿p, khÃ´ng check OTP
    console.log(`[AUTH] Registering user with phone: ${phone}`);

    const user = await User.create({
      username: phone || username || email.split('@')[0], 
      email,
      password,
      fullname,
      phone,
      role: role || 'Farmer'
    });

    if (user) {
      // Notify admins about the new registration
      const { createNotification } = require('./notificationController');
      const admins = await User.find({ role: { $regex: /^admin$/i } });
      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          sender: user._id,
          title: 'TÃ i khoáº£n Ä‘Äƒng kÃ½ má»›i',
          message: `NgÆ°á»i dÃ¹ng ${fullname || username} (${email}) vá»«a táº¡o tÃ i khoáº£n vá»›i vai trÃ² ${role || 'Farmer'}.`,
          type: 'System',
          relatedId: user._id,
          relatedModel: 'User'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          ...user.toJSON(),
          token: generateToken(user.id, user.role),
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Dá»¯ liá»‡u khÃ´ng há»£p lá»‡.' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email hoáº·c tÃªn Ä‘Äƒng nháº­p Ä‘Ã£ tá»“n táº¡i.' });
    }
    res.status(500).json({ success: false, message: 'Lá»—i mÃ¡y chá»§ khi Ä‘Äƒng kÃ½ tÃ i khoáº£n.' });
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

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoáº·c tÃªn Ä‘Äƒng nháº­p khÃ´ng tá»“n táº¡i' });
    }

    if (user.status !== 'Active') {
      return res.status(401).json({ success: false, message: 'TÃ i khoáº£n Ä‘Ã£ bá»‹ khÃ³a' });
    }

    // Check if user has a password (might be a Google-only account)
    if (!user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'TÃ i khoáº£n nÃ y Ä‘Æ°á»£c Ä‘Äƒng kÃ½ qua Google. Vui lÃ²ng sá»­ dá»¥ng tÃ­nh nÄƒng ÄÄƒng nháº­p Google hoáº·c QuÃªn máº­t kháº©u Ä‘á»ƒ thiáº¿t láº­p máº­t kháº©u má»›i.' 
      });
    }

    const isMatch = await user.matchPassword(password);
    if (isMatch) {
      // Log successful login
      const { createLog } = require('./logController');
      await createLog(user._id, 'ÄÄƒng nháº­p há»‡ thá»‘ng', user._id, 'User', { 
        username: user.username,
        email: user.email,
        ip: req.ip || req.connection.remoteAddress
      });

      res.json({
        success: true,
        data: {
          ...user.toJSON(),
          token: generateToken(user.id, user.role),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Email hoáº·c máº­t kháº©u khÃ´ng chÃ­nh xÃ¡c' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Force change password on first login
// @route   PUT /api/auth/force-change-password
// @access  Private
const forceChangePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Máº­t kháº©u hiá»‡n táº¡i khÃ´ng chÃ­nh xÃ¡c' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    user.lastPasswordChange = new Date();
    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Máº­t kháº©u Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t thÃ nh cÃ´ng. ChÃ o má»«ng báº¡n Ä‘áº¿n vá»›i EBookFarm!',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Email khÃ´ng tá»“n táº¡i trÃªn há»‡ thá»‘ng' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const sendEmail = require('../utils/sendEmail');
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #16a34a; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">EBookFarm</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-weight: bold;">GIáº¢I PHÃP NÃ”NG NGHIá»†P Sá»</p>
        </div>
        
        <div style="background-color: #f0fdf4; border-radius: 16px; padding: 30px; border: 1px solid #dcfce7;">
          <h2 style="margin-top: 0; color: #16a34a;">YÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u</h2>
          <p>ChÃ o ${user.fullname}</p>
          <p>ChÃºng tÃ´i nháº­n Ä‘Æ°á»£c yÃªu cáº§u Ä‘áº·t láº¡i máº­t kháº©u cho tÃ i khoáº£n <strong>${user.email}</strong> trÃªn há»‡ thá»‘ng EBookFarm.</p>
          <p>Äá»ƒ tiáº¿p tá»¥c, vui lÃ²ng nháº¥n vÃ o nÃºt bÃªn dÆ°á»›i:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              Äáº·t láº¡i máº­t kháº©u ngay
            </a>
          </div>
          
          <p style="font-size: 13px; color: #666;">
            Náº¿u báº¡n khÃ´ng thá»±c hiá»‡n yÃªu cáº§u nÃ y, vui lÃ²ng bá» qua email nÃ y. TÃ i khoáº£n cá»§a báº¡n váº«n an toÃ n.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dcfce7; font-size: 11px; color: #999;">
            <p>LiÃªn káº¿t nÃ y sáº½ háº¿t háº¡n sau <strong>10 phÃºt</strong> vÃ¬ lÃ½ do báº£o máº­t.</p>
            <p>Náº¿u nÃºt báº¥m khÃ´ng hoáº¡t Ä‘á»™ng, hÃ£y copy Ä‘Æ°á»ng dáº«n sau vÃ o trÃ¬nh duyá»‡t:</p>
            <p style="word-break: break-all; color: #16a34a;">${resetUrl}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #aaa;">
          <p>Â© 2026 EBookFarm. Táº¥t cáº£ quyá»n Ä‘Æ°á»£c báº£o lÆ°u.</p>
        </div>
      </div>
    `;

    try {
      console.log(`Attempting to send reset email to: ${user.email}`);
      // Send email in background to avoid blocking the response
      sendEmail({
        email: user.email,
        subject: '[EBookFarm] YÃªu cáº§u khÃ´i phá»¥c máº­t kháº©u tÃ i khoáº£n',
        html: html
      }).catch(err => {
        console.error('Background Email send error:', err);
      });

      // Return success immediately
      res.status(200).json({ 
        success: true, 
        message: 'YÃªu cáº§u Ä‘Ã£ Ä‘Æ°á»£c ghi nháº­n. Há»‡ thá»‘ng Ä‘ang gá»­i link khÃ´i phá»¥c vÃ o Email cá»§a báº¡n (vui lÃ²ng kiá»ƒm tra cáº£ hÃ²m thÆ° rÃ¡c).'
      });
    } catch (err) {
      console.error('Initial Email send logic error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'KhÃ´ng thá»ƒ xá»­ lÃ½ yÃªu cáº§u lÃºc nÃ y. Vui lÃ²ng thá»­ láº¡i sau.' });
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
    user.lastPasswordChange = new Date();
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
        role: 'Farmer',
        status: 'Active'
      });

      // Notify admins about the new Google registration
      const { createNotification } = require('./notificationController');
      const admins = await User.find({ role: { $regex: /^admin$/i } });
      for (const admin of admins) {
        await createNotification({
          recipient: admin._id,
          sender: user._id,
          title: 'TÃ i khoáº£n Ä‘Äƒng nháº­p Google má»›i',
          message: `NgÆ°á»i dÃ¹ng ${name} (${email}) vá»«a Ä‘Äƒng nháº­p láº§n Ä‘áº§u báº±ng Google.`,
          type: 'System',
          relatedId: user._id,
          relatedModel: 'User'
        });
      }
    } else if (!user.googleId) {
      // Link google account to existing email account
      user.googleId = sub;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        ...user.toJSON(),
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
    await createLog(req.user.id, 'ÄÄƒng xuáº¥t há»‡ thá»‘ng', req.user.id, 'User', { 
      username: req.user.username,
      email: req.user.email,
      ip: req.ip || req.connection.remoteAddress
    });

    res.json({
      success: true,
      message: 'ÄÄƒng xuáº¥t thÃ nh cÃ´ng'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { phone, type } = req.body;
    
    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB (expires automatically via TTL index)
    await Otp.findOneAndUpdate(
      { phone, type: type || 'REGISTER' },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // MOCK SMS SENDING
    console.log(`-----------------------------------------`);
    console.log(`[SMS SERVICE] Sending OTP to ${phone}`);
    console.log(`[SMS SERVICE] Code: ${otp}`);
    console.log(`[SMS SERVICE] Type: ${type || 'REGISTER'}`);
    console.log(`-----------------------------------------`);

    const isMockSms = !process.env.SMS_PROVIDER || process.env.SMS_PROVIDER === 'mock';
    const isProduction = process.env.NODE_ENV === 'production';

    res.json({ 
      success: true, 
      message: 'Mã xác thực đã được gửi. Vui lòng kiểm tra điện thoại của bạn.',
      ...((isMockSms && !isProduction) ? { debugOtp: otp } : {}),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, googleLogin, forceChangePassword, logoutUser, sendOtp };
