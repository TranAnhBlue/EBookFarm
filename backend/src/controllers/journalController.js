const FarmJournal = require('../models/FarmJournal');
const { createLog } = require('./logController');
const { createNotification } = require('./notificationController');
const { ROLES, isAdminRole, isHtxRole, getHtxOwnerId } = require('../utils/roles');
const { notifyHtxRoles } = require('../utils/notificationHelpers');

const createJournal = async (req, res) => {
  try {
    const journal = new FarmJournal({
      ...req.body,
      userId: req.user._id,
    });

    // Calculate initial progress
    const FormSchema = require('../models/FormSchema');
    const schema = await FormSchema.findById(journal.schemaId);
    if (schema && schema.tables && schema.tables.length > 0) {
        const totalSteps = schema.tables.length;
        const entries = journal.entries || {};
        const completedSteps = schema.tables.filter(t => {
            const tableData = entries[t.tableName];
            return tableData && (
                (Array.isArray(tableData) && tableData.length > 0) || 
                (!Array.isArray(tableData) && typeof tableData === 'object' && Object.values(tableData).some(v => v !== undefined && v !== null && v !== ''))
            );
        }).length;
        journal.progress = Math.round((completedSteps / totalSteps) * 100);
    }

    if (req.body.entries) {
        journal.markModified('entries');
    }
    const createdJournal = await journal.save();
    
    // Log action
    await createLog(req.user._id, 'Tạo nhật ký sản xuất', createdJournal._id, 'FarmJournal', {
      qrCode: createdJournal.qrCode,
      schemaId: createdJournal.schemaId
    });
    
    // Thông báo cho Admin biết có nông dân tạo sổ cá nhân
    const User = require('../models/User');
    const admins = await User.find({ role: { $regex: /^admin$/i } });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.user._id,
        title: 'Nhật ký nông hộ mới',
        message: `Nông dân ${req.user.fullname || req.user.username} vừa tạo một sổ nhật ký cá nhân.`,
        type: 'System',
        relatedId: createdJournal._id,
        relatedModel: 'FarmJournal'
      });
    }
    
    res.status(201).json({ success: true, data: createdJournal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJournals = async (req, res) => {
  try {
    const filter = isAdminRole(req.user.role) ? {} : { userId: req.user._id };

    // Lấy tất cả journals với category của schema
    const journals = await FarmJournal.find(filter)
      .populate('schemaId')
      .populate('userId', 'username fullname email avatar farmArea farmType certifications organization');

    // Nếu có query ?category= thì lọc theo category của schema
    const { category } = req.query;
    const result = category
      ? journals.filter(j => j.schemaId?.category === category)
      : journals;

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJournalByQr = async (req, res) => {
  try {
    const journal = await FarmJournal.findOne({ qrCode: req.params.qrCode })
      .populate('schemaId')
      .populate('userId', 'username fullname avatar')
      .populate({
        path: 'htxJournalId',
        populate: { path: 'htxId', select: 'fullname username organization avatar' }
      });
    if (journal) {
      // Increment view count
      journal.viewCount = (journal.viewCount || 0) + 1;
      journal.lastViewedAt = new Date();
      await journal.save();
      
      res.json({ success: true, data: journal });
    } else {
      res.status(404).json({ success: false, message: 'Journal not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateJournal = async (req, res) => {
    try {
      const journal = await FarmJournal.findById(req.params.id);
      if(journal) {
          let hasAccess = false;
          if (journal.userId.toString() === req.user._id.toString() || isAdminRole(req.user.role)) {
             hasAccess = true;
          } else if (isHtxRole(req.user.role) && journal.htxJournalId) {
             const HtxJournal = require('../models/HtxJournal');
             const htxJournal = await HtxJournal.findById(journal.htxJournalId);
             if (htxJournal && htxJournal.htxId.toString() === String(getHtxOwnerId(req.user))) {
                hasAccess = true;
             }
          }
          if (!hasAccess) {
              return res.status(403).json({ success: false, message: 'Not authorized' });
          }

          // DATA IMMUTABILITY & STATUS ENFORCEMENT
          // Ngăn chặn chỉnh sửa nếu đã gửi duyệt hoặc đã duyệt (trừ Admin)
          const immutableStatuses = ['Submitted', 'Verified', 'Locked'];
          if (immutableStatuses.includes(journal.status) && !isAdminRole(req.user.role)) {
              let msg = `Sổ nhật ký đang ở trạng thái "${journal.status}". Không thể chỉnh sửa dữ liệu tại thời điểm này.`;
              if (journal.status === 'Submitted') msg = 'Sổ đã được gửi duyệt. Vui lòng liên hệ Admin/HTX nếu bạn cần sửa đổi.';
              if (journal.status === 'Verified') msg = 'Sổ đã được duyệt và xác minh thành công. Dữ liệu đã được khóa để đảm bảo truy xuất nguồn gốc.';
              
              return res.status(403).json({ 
                  success: false, 
                  message: msg 
              });
          }

          if (req.body.entries) {
              console.log(`📦 Updating entries for journal ${journal._id}:`, JSON.stringify(req.body.entries).substring(0, 200) + '...');
              journal.entries = req.body.entries;
              journal.markModified('entries');
          }
          
          journal.status = req.body.status || journal.status;
          
          if (req.body.feedback !== undefined) {
              journal.feedback = req.body.feedback;
          }

          // Set lockedAt timestamp if transitioning to Locked
          if (journal.status === 'Locked' && !journal.lockedAt) {
              journal.lockedAt = new Date();
          }

          if (req.body.images) {
              journal.images = req.body.images;
          }
          
          journal.editCount = (journal.editCount || 0) + 1;
          journal.lastEditedAt = new Date();
          journal.lastEditedBy = req.user._id;

          // Calculate progress
          const FormSchema = require('../models/FormSchema');
          const schema = await FormSchema.findById(journal.schemaId);
          if (schema && schema.tables && schema.tables.length > 0) {
              const totalSteps = schema.tables.length;
              const entries = journal.entries || {};
              const completedSteps = schema.tables.filter(t => {
                  const tableData = entries[t.tableName];
                  return tableData && (
                      (Array.isArray(tableData) && tableData.length > 0) || 
                      (!Array.isArray(tableData) && typeof tableData === 'object' && Object.values(tableData).some(v => v !== undefined && v !== null && v !== ''))
                  );
              }).length;
              journal.progress = Math.round((completedSteps / totalSteps) * 100);
          }

          const updated = await journal.save();

          // THÔNG BÁO CHO NÔNG DÂN KHI ADMIN DUYỆT HOẶC TỪ CHỐI
          if (isAdminRole(req.user.role) && req.body.status) {
              const categoryLabels = {
                  'trongtrot': 'VietGAP Trồng trọt',
                  'channuoi': 'VietGAHP Chăn nuôi',
                  'thuysan': 'VietGAP Thủy sản',
                  'huuco': 'Hữu cơ',
                  'huuco_caytrong': 'Hữu cơ Cây trồng',
                  'huuco_channuoi': 'Hữu cơ Chăn nuôi',
                  'huuco_thuysan': 'Hữu cơ Thủy sản',
                  'thongminh': 'Nông nghiệp Thông minh'
              };
              const catLabel = schema ? categoryLabels[schema.category] || '' : '';
              
              let nTitle = 'Cập nhật trạng thái sổ';
              let nMessage = `Sổ nhật ký của bạn đã được cập nhật trạng thái: ${updated.status}`;
              let nType = 'Journal_Verified';

              if (updated.status === 'Verified') {
                  nTitle = 'Sổ nhật ký đã được duyệt';
                  nMessage = `Sổ nhật ký [${catLabel}] của bạn đã được Admin phê duyệt thành công.`;
              } else if (updated.status === 'Draft' && req.body.feedback) {
                  nTitle = 'Yêu cầu chỉnh sửa sổ';
                  nMessage = `Admin yêu cầu bạn chỉnh sửa lại sổ [${catLabel}]. Lý do: ${req.body.feedback}`;
                  nType = 'Journal_Revision_Requested';
              } else if (updated.status === 'Locked') {
                  nTitle = 'Sổ nhật ký đã bị khóa';
                  nMessage = `Sổ nhật ký [${catLabel}] của bạn đã được khóa bất biến bởi Admin.`;
                  nType = 'Journal_Locked';
              }

              await createNotification({
                  recipient: updated.userId,
                  sender: req.user._id,
                  title: nTitle,
                  message: nMessage,
                  type: nType,
                  relatedId: updated._id,
                  relatedModel: 'FarmJournal',
                  categoryLabel: catLabel
              });
          }
          
          // Đồng bộ trạng thái lên HtxJournal nếu có (trường hợp cập nhật từ phía Farmer)
          if (updated.htxJournalId && req.body.status && req.user.role?.toUpperCase() === 'FARMER') {
             const HtxJournal = require('../models/HtxJournal');
             const htxJournal = await HtxJournal.findById(updated.htxJournalId);
             if (htxJournal) {
                 const farmerEntry = htxJournal.farmers.find(f => f.farmJournalId && f.farmJournalId.toString() === updated._id.toString());
                 if (farmerEntry) {
                     if (updated.status === 'Submitted') {
                         farmerEntry.status = 'Chờ duyệt';
                         
                         const categoryLabels = {
                             'trongtrot': 'VietGAP Trồng trọt',
                             'channuoi': 'VietGAHP Chăn nuôi',
                             'thuysan': 'VietGAP Thủy sản',
                             'huuco': 'Hữu cơ',
                             'huuco_caytrong': 'Hữu cơ Cây trồng',
                             'huuco_channuoi': 'Hữu cơ Chăn nuôi',
                             'huuco_thuysan': 'Hữu cơ Thủy sản',
                             'thongminh': 'Nông nghiệp Thông minh'
                         };
                         const FormSchema = require('../models/FormSchema');
                         const schema = await FormSchema.findById(htxJournal.schemaId);
                         const catLabel = schema ? categoryLabels[schema.category] || '' : '';

                         // Create notification for HTX
                         await createNotification({
                             recipient: htxJournal.htxId,
                             sender: req.user._id,
                             title: 'Sổ mới được gửi duyệt',
                             message: `Nông dân ${req.user.fullname || req.user.username} đã gửi duyệt sổ [${catLabel}]: ${htxJournal.name}`,
                             type: 'Journal_Submitted',
                             relatedId: htxJournal._id,
                             relatedModel: 'HtxJournal',
                             categoryLabel: catLabel
                         });
                         await notifyHtxRoles({
                             htxId: htxJournal.htxId,
                             roles: [ROLES.HTX_TECHNICAL, ROLES.HTX_SUPERVISOR],
                             sender: req.user._id,
                             title: 'Sổ mới được gửi duyệt',
                             message: `Nông dân ${req.user.fullname || req.user.username} đã gửi duyệt sổ [${catLabel}]: ${htxJournal.name}`,
                             type: 'Journal_Submitted',
                             relatedId: htxJournal._id,
                             relatedModel: 'HtxJournal',
                             categoryLabel: catLabel
                         });
                     }
                     if (updated.status === 'Draft') farmerEntry.status = 'Đang nhập';
                     await htxJournal.save();
                 }
             }
          } else if (updated.status === 'Submitted' && !updated.htxJournalId && req.user.role?.toUpperCase() === 'FARMER') {
              // Thông báo cho ADMIN khi sổ CÁ NHÂN được gửi duyệt
              const User = require('../models/User');
              const admins = await User.find({ role: { $regex: /^admin$/i } });
              for (const admin of admins) {
                  await createNotification({
                      recipient: admin._id,
                      sender: req.user._id,
                      title: 'Nhật ký cá nhân gửi duyệt',
                      message: `Nông dân ${req.user.fullname || req.user.username} vừa gửi duyệt sổ nhật ký cá nhân.`,
                      type: 'Journal_Submitted',
                      relatedId: updated._id,
                      relatedModel: 'FarmJournal'
                  });
              }
          }

          // Log action
          await createLog(req.user._id, 'Cập nhật nhật ký sản xuất', updated._id, 'FarmJournal', {
            qrCode: updated.qrCode,
            status: updated.status
          });
          
          res.json({ success: true, data: updated });
      } else {
          res.status(404).json({ success: false, message: 'Journal not found' });
      }
    } catch(err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const getJournalById = async (req, res) => {
  try {
    const journal = await FarmJournal.findById(req.params.id)
      .populate('schemaId')
      .populate('userId', 'username fullname email avatar farmArea farmType certifications organization');
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhật ký' });
    }
    // Only owner, admin, or HTX can view
    let hasAccess = false;
    if (journal.userId._id.toString() === req.user._id.toString() || isAdminRole(req.user.role)) {
       hasAccess = true;
    } else if (isHtxRole(req.user.role) && journal.htxJournalId) {
       const HtxJournal = require('../models/HtxJournal');
       const htxJournal = await HtxJournal.findById(journal.htxJournalId);
       if (htxJournal && htxJournal.htxId.toString() === String(getHtxOwnerId(req.user))) {
          hasAccess = true;
       }
    }

    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem nhật ký này' });
    }
    res.json({ success: true, data: journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createJournal, getJournals, getJournalByQr, getJournalById, updateJournal };
