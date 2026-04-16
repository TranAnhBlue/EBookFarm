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
    const { username, email, password, role } = req.body;
    
    // Check username or email
    const userExists = await User.findOne({ 
      $or: [{ username }, { email: email || 'never_match_empty' }] 
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User or Email already exists' });
    }

    const user = await User.create({
      username,
      email,
      password,
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
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check by username OR email
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (user && user.status === 'Active' && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user.id,
          username: user.username,
          role: user.role,
          token: generateToken(user.id, user.role),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password, or account inactive' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // In production, we'd send an email. For testing, return the link.
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    res.status(200).json({ 
      success: true, 
      message: 'Reset token generated (returned link for testing)',
      resetLink: resetUrl // This is what the user asked for
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
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
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, googleLogin };