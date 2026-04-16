const User = require('../models/User');
const { createLog } = require('./logController');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRoleStatus = async (req, res) => {
  try {
    const { role, status, fullname, email } = req.body;
    const user = await User.findById(req.params.id);
 
    if (user) {
      user.role = role || user.role;
      user.status = status || user.status;
      user.fullname = fullname !== undefined ? fullname : user.fullname;
      user.email = email !== undefined ? email : user.email;
      if (password) user.password = password;

      const updatedUser = await user.save();

      // Log action
      await createLog(req.user.id, 'Cập nhật tài khoản', user._id, 'User', { 
        username: user.username,
        role: user.role,
        status: user.status
      });

      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullname = fullname !== undefined ? fullname : user.fullname;
      user.email = email !== undefined ? email : user.email;
      if (password) user.password = password;

      const updatedUser = await user.save();
      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, role, status, fullname, email } = req.body;
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      username,
      password,
      role: role || 'User',
      status: status || 'Active',
      fullname,
      email
    });

    // Log action
    await createLog(req.user.id, 'Tạo tài khoản mới', user._id, 'User', { 
      username: user.username,
      role: user.role 
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const username = user.username;
      await user.deleteOne();

      // Log action
      await createLog(req.user.id, 'Xóa tài khoản', req.params.id, 'User', { username });

      res.json({ success: true, message: 'User removed' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, updateUserRoleStatus, updateProfile, createUser, deleteUser };