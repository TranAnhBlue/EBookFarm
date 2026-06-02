const User = require('../models/User');
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
    res.status(500).json({ success: false, message: 'Lá»—i khi láº¥y danh sÃ¡ch ngÆ°á»i dÃ¹ng.' });
  }
};

const getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

const getPublicHtxList = async (req, res) => {
  try {
    const htxs = await User.find({ 
      role: { $regex: /^htx$/i }, 
      status: 'Active' 
    })
      .select('fullname username phone avatar email province district ward address');
    res.json({ success: true, data: htxs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lá»—i khi láº¥y danh sÃ¡ch HTX.' });
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
      await createLog(req.user.id, 'Cáº­p nháº­t tÃ i khoáº£n', user._id, 'User', { 
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
    console.log('ðŸ“ Updating profile for user:', req.user._id);
    console.log('ðŸ“¦ Request body:', req.body);

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
      currentPassword, // ThÃªm currentPassword
      password,
      otp // ThÃªm otp
    } = req.body;
    
    const user = await User.findById(req.user._id);

    if (user) {
      // Náº¿u cÃ³ yÃªu cáº§u Ä‘á»•i máº­t kháº©u, pháº£i kiá»ƒm tra máº­t kháº©u cÅ©
      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Vui lÃ²ng cung cáº¥p máº­t kháº©u hiá»‡n táº¡i.' });
        }
        
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Máº­t kháº©u hiá»‡n táº¡i khÃ´ng chÃ­nh xÃ¡c.' });
        }
        
        user.password = password;
        user.lastPasswordChange = new Date();
        user.mustChangePassword = false;
      }

      user.fullname = fullname !== undefined ? fullname : user.fullname;
      
      if (phone && phone !== user.phone) {
        return res.status(400).json({ success: false, message: 'Vui lòng đổi số điện thoại bằng xác thực OTP.' });
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
      console.log('âœ… User saved to DB:', updatedUser.username);
      
      // Log action
      await createLog(req.user._id, 'Cáº­p nháº­t há»“ sÆ¡ cÃ¡ nhÃ¢n', user._id, 'User', { 
        fullname: user.fullname 
      });
      
      res.json({ success: true, data: updatedUser });
    } else {
      console.warn('âš ï¸ Update failed: User not found for ID', req.user._id);
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('âŒ CRITICAL ERROR in updateProfile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


const changeProfilePhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ. Vui lòng nhập từ 10-11 chữ số.' });
    }

    if (!otp || !/^[0-9]{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập mã OTP gồm 6 chữ số.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }

    if (phone === user.phone) {
      return res.status(400).json({ success: false, message: 'Số điện thoại mới đang trùng với số hiện tại.' });
    }

    const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
    if (phoneExists) {
      return res.status(400).json({ success: false, message: 'Số điện thoại này đã được sử dụng bởi một tài khoản khác.' });
    }

    const otpRecord = await Otp.findOne({ phone, type: 'CHANGE_PHONE' });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    user.phone = phone;
    if (/^[0-9]{10,11}$/.test(user.username || '')) {
      user.username = phone;
    }

    const updatedUser = await user.save();
    await Otp.deleteOne({ _id: otpRecord._id });

    await createLog(req.user._id, 'Đổi số điện thoại hồ sơ cá nhân', user._id, 'User', { phone });

    res.json({ success: true, message: 'Đổi số điện thoại thành công.', data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, role, status, fullname, email, phone, groupId, htxId } = req.body;
    const finalUsername = phone || username;

    if (phone && !/^[0-9]{10,11}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Sá»‘ Ä‘iá»‡n thoáº¡i khÃ´ng há»£p lá»‡. Vui lÃ²ng nháº­p tá»« 10-11 chá»¯ sá»‘.' });
    }

    const userExists = await User.findOne({ 
      $or: [{ username: finalUsername }, { email }, { phone }]
    });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'NgÆ°á»i dÃ¹ng Ä‘Ã£ tá»“n táº¡i (Email hoáº·c Sá»‘ Ä‘iá»‡n thoáº¡i trÃ¹ng láº·p)' });
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
    await createLog(req.user.id, 'Táº¡o tÃ i khoáº£n má»›i', user._id, 'User', { 
      username: user.username,
      role: user.role 
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'TÃªn Ä‘Äƒng nháº­p hoáº·c email Ä‘Ã£ tá»“n táº¡i.' });
    }
    res.status(500).json({ success: false, message: 'Lá»—i khi táº¡o tÃ i khoáº£n má»›i.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const username = user.username;
      await user.deleteOne();

      // Log action
      await createLog(req.user.id, 'XÃ³a tÃ i khoáº£n', req.params.id, 'User', { username });

      res.json({ success: true, message: 'ÄÃ£ xÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng' });
    } else {
      res.status(404).json({ success: false, message: 'NgÆ°á»i dÃ¹ng khÃ´ng tá»“n táº¡i.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lá»—i khi xÃ³a ngÆ°á»i dÃ¹ng.' });
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
          username: userData.phone || userData.username, // Æ¯u tiÃªn SDT lÃ m username
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
    res.status(500).json({ success: false, message: 'Lá»—i khi xá»­ lÃ½ nháº­p liá»‡u hÃ ng loáº¡t.' });
  }
};

const verifyCertification = async (req, res) => {
  try {
    const { userId, certId } = req.params;
    const { status, feedback } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y ngÆ°á»i dÃ¹ng' });
    }

    // Kiá»ƒm tra quyá»n háº¡n: Náº¿u lÃ  HTX thÃ¬ chá»‰ Ä‘Æ°á»£c duyá»‡t cho thÃ nh viÃªn cá»§a mÃ¬nh
    if (req.user.role?.toUpperCase() === 'HTX') {
      if (!user.htxId || user.htxId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: 'Báº¡n khÃ´ng cÃ³ quyá»n duyá»‡t chá»©ng chá»‰ cho ngÆ°á»i dÃ¹ng khÃ´ng thuá»™c HTX cá»§a mÃ¬nh.' 
        });
      }
    }

    const cert = user.certifications.id(certId);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'KhÃ´ng tÃ¬m tháº¥y chá»©ng chá»‰' });
    }

    cert.status = status;
    cert.feedback = feedback || cert.feedback;
    cert.verifiedBy = req.user._id;
    cert.verifiedAt = new Date();

    await user.save();

    res.json({ 
      success: true, 
      message: `ÄÃ£ ${status === 'Approved' ? 'phÃª duyá»‡t' : 'tá»« chá»‘i'} chá»©ng chá»‰`,
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
  changeProfilePhone,
  createUser, 
  deleteUser, 
  bulkCreateUsers,
  verifyCertification,
  getPublicHtxList,
  getProfile
};
