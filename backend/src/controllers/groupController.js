const Group = require('../models/Group');
const User = require('../models/User');

const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members', 'username fullname email');
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description, permissions, members } = req.body;
    const group = await Group.create({ name, description, permissions, members });
    
    // Sync members' groupId
    if (members && members.length > 0) {
      await User.updateMany({ _id: { $in: members } }, { groupId: group._id });
    }
    
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { name, description, permissions, members } = req.body;
    const oldGroup = await Group.findById(req.params.id);
    if (!oldGroup) return res.status(404).json({ success: false, message: 'Nhóm không tồn tại' });

    // Sync: Clear groupId for users who were in the group but are no longer in it
    const oldMembers = oldGroup.members || [];
    const removedMembers = oldMembers.filter(m => !members.includes(m.toString()));
    if (removedMembers.length > 0) {
      await User.updateMany({ _id: { $in: removedMembers } }, { groupId: null });
    }

    const group = await Group.findByIdAndUpdate(
      req.params.id, 
      { name, description, permissions, members }, 
      { new: true }
    );
    
    // Sync: Set groupId for new members
    if (members && members.length > 0) {
      await User.updateMany({ _id: { $in: members } }, { groupId: group._id });
    }

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Nhóm không tồn tại' });

    // Clear groupId for members
    await User.updateMany({ groupId: group._id }, { groupId: null });
    
    await group.deleteOne();
    res.json({ success: true, message: 'Đã xóa nhóm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGroups, createGroup, updateGroup, deleteGroup };
