const { createLog } = require('./logController');
const Otp = require('../models/Otp');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('groupId', 'name')
      .populate('htxId', 'fullname username');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách người dùng.' });
  }
};

const updateUserRoleStatus = async (req, res) => {
  try {
    const { role, status, fullname, email, password, groupId, htxId } = req.body;
    const user = await User.findById(req.params.id);
 
    if (user) {
      user.role = role || user.role;
      user.status = status || user.status;
      user.fullname = fullname !== undefined ? fullname : user.fullname;
      user.email = email !== undefined ? email : user.email;
      user.groupId = groupId !== undefined ? groupId : user.groupId;
      user.htxId = htxId !== undefined ? htxId : user.htxId;
      if (password) {
        user.password = password;
        user.lastPasswordChange = new Date();
      }

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
    console.log('📝 Updating profile for user:', req.user._id);
    console.log('📦 Request body:', req.body);

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
      avatar,
      currentPassword, // Thêm currentPassword
      password,
      otp // Thêm otp
    } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
      // Nếu có yêu cầu đổi mật khẩu, phải kiểm tra mật khẩu cũ
      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu hiện tại.' });
        }
        
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
        }
        
        user.password = password;
        user.lastPasswordChange = new Date();
        user.mustChangePassword = false;
      }

      user.fullname = fullname !== undefined ? fullname : user.fullname;
      
      // Xử lý đổi số điện thoại (Yêu cầu OTP)
      if (phone && phone !== user.phone) {
        if (!otp) {
          return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP để xác thực số điện thoại mới.' });
        }
        
        const otpRecord = await Otp.findOne({ phone, otp, type: 'CHANGE_PHONE' });
        if (!otpRecord) {
          return res.status(400).json({ success: false, message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
        }

        // Kiểm tra xem số mới có bị trùng không
        const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
        if (phoneExists) {
          return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.' });
        }

        user.phone = phone;
        user.username = phone; // Đồng bộ username nếu username là số điện thoại
        await Otp.deleteOne({ _id: otpRecord._id });
      }

      user.dateOfBirth = dateOfBirth !== undefined ? dateOfBirth : user.dateOfBirth;
      user.gender = gender !== undefined ? gender : user.gender;
      user.address = address !== undefined ? address : user.address;
      user.province = province !== undefined ? province : user.province;
      user.district = district !== undefined ? district : user.district;
      user.ward = ward !== undefined ? ward : user.ward;
      user.farmName = farmName !== undefined ? farmName : user.farmName;
      user.farmCode = farmCode !== undefined ? farmCode : user.farmCode;
      
      // Handle farmArea conversion
      if (farmArea !== undefined) {
        user.farmArea = farmArea === '' ? null : Number(farmArea);
      }
      
      user.farmType = farmType !== undefined ? farmType : user.farmType;
      user.certifications = certifications !== undefined ? certifications : user.certifications;
      user.organization = organization !== undefined ? organization : user.organization;
      user.bio = bio !== undefined ? bio : user.bio;
      user.avatar = avatar !== undefined ? avatar : user.avatar;

      const updatedUser = await user.save();
      console.log('✅ Profile updated successfully:', updatedUser._id);
      
      // Log action
      await createLog(req.user._id, 'Cập nhật hồ sơ cá nhân', user._id, 'User', { 
        fullname: user.fullname 
      });
      
      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, role, status, fullname, email, phone, groupId, htxId } = req.body;
    const finalUsername = phone || username;

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập từ 10-11 chữ số.' });
    }

    const userExists = await User.findOne({ 
      $or: [{ username: finalUsername }, { email }, { phone }]
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'Người dùng đã tồn tại (Email hoặc Số điện thoại trùng lặp)' });
    }

    const user = await User.create({
      username: finalUsername,
      password,
      role: role || 'User',
      status: status || 'Active',
      fullname,
      email,
      phone,
      groupId,
      htxId,
      mustChangePassword: true, 
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
          username: userData.phone || userData.username, // Ưu tiên SDT làm username
          password: userData.password || '123456', 
          status: 'Active',
          mustChangePassword: true
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

const verifyCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;
    const { status, feedback } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    // Kiểm tra quyền hạn: Nếu là HTX thì chỉ được duyệt cho thành viên của mình
    if (req.user.role?.toUpperCase() === 'HTX') {
      if (!user.htxId || user.htxId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Bạn không có quyền duyệt chứng chỉ cho người dùng không thuộc HTX của mình.' 
        });
      }
    }

    const cert = user.certifications.id(certId);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy chứng chỉ' });
    }

    cert.status = status;
    cert.feedback = feedback || cert.feedback;
    cert.verifiedBy = req.user._id;
    cert.verifiedAt = new Date();

    await user.save();

    res.json({ 
      success: true, 
      message: `Đã ${status === 'Approved' ? 'phê duyệt' : 'từ chối'} chứng chỉ`,
      data: cert 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getUsers, 
  updateUserRoleStatus, 
  updateProfile, 
  createUser, 
  deleteUser, 
  bulkCreateUsers,
  verifyCertification 
};