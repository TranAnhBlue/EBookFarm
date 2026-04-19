const User = require('../models/User');
const { createLog } = require('./logController');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').populate('groupId', 'name');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng.' });
  }
};

const updateUserRoleStatus = async (req, res) => {
  try {
    const { role, status, fullname, email, password, groupId } = req.body;
    const user = await User.findById(req.params.id);
 
    if (user) {
      user.role = role || user.role;
      user.status = status || user.status;
      user.fullname = fullname !== undefined ? fullname : user.fullname;
      user.email = email !== undefined ? email : user.email;
      user.groupId = groupId !== undefined ? groupId : user.groupId;
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
    const { 
      fullname, 
      phone, 
      dateOfBirth, 
      gender, 
      address, 
      province, 
      district, 
      ward,
      farmName,
      farmCode,
      farmArea,
      farmType,
      certifications,
      organization,
      bio,
      avatar
    } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullname = fullname !== undefined ? fullname : user.fullname;
      user.phone = phone !== undefined ? phone : user.phone;
      user.dateOfBirth = dateOfBirth !== undefined ? dateOfBirth : user.dateOfBirth;
      user.gender = gender !== undefined ? gender : user.gender;
      user.address = address !== undefined ? address : user.address;
      user.province = province !== undefined ? province : user.province;
      user.district = district !== undefined ? district : user.district;
      user.ward = ward !== undefined ? ward : user.ward;
      user.farmName = farmName !== undefined ? farmName : user.farmName;
      user.farmCode = farmCode !== undefined ? farmCode : user.farmCode;
      user.farmArea = farmArea !== undefined ? farmArea : user.farmArea;
      user.farmType = farmType !== undefined ? farmType : user.farmType;
      user.certifications = certifications !== undefined ? certifications : user.certifications;
      user.organization = organization !== undefined ? organization : user.organization;
      user.bio = bio !== undefined ? bio : user.bio;
      user.avatar = avatar !== undefined ? avatar : user.avatar;

      const updatedUser = await user.save();
      
      // Log action
      await createLog(req.user._id, 'Cập nhật hồ sơ cá nhân', user._id, 'User', { 
        fullname: user.fullname 
      });
      
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
    const { username, password, role, status, fullname, email, groupId } = req.body;
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
      email,
      groupId
    });

    // Log action
    await createLog(req.user.id, 'Tạo tài khoản mới', user._id, 'User', { 
      username: user.username,
      role: user.role 
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại.' });
    }
    res.status(500).json({ success: false, message: 'Lỗi khi tạo tài khoản mới.' });
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

      res.json({ success: true, message: 'Đã xóa người dùng thành công' });
    } else {
      res.status(404).json({ success: false, message: 'Người dùng không tồn tại.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa người dùng.' });
  }
}

const bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;
    const results = { count: 0, skipped: 0, errors: [] };

    for (const userData of users) {
      try {
        const userExists = await User.findOne({ 
          $or: [{ username: userData.username }, { email: userData.email }] 
        });
        
        if (userExists) {
          results.skipped++;
          continue;
        }

        await User.create({
          ...userData,
          password: userData.password || '123456', // Mật khẩu mặc định
          status: 'Active'
        });
        results.count++;
      } catch (err) {
        results.errors.push({ username: userData.username, error: err.message });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xử lý nhập liệu hàng loạt.' });
  }
};

module.exports = { getUsers, updateUserRoleStatus, updateProfile, createUser, deleteUser, bulkCreateUsers };