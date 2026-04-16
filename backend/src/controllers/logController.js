const Log = require('../models/Log');

const getLogs = async (req, res) => {
  try {
    const logs = await Log.find({})
      .populate('user', 'username fullname')
      .sort({ createdAt: -1 })
      .limit(100);
      
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLog = async (userId, action, targetId, targetType, details) => {
  try {
    const log = await Log.create({
      user: userId,
      action,
      targetId,
      targetType,
      details
    });
    return log;
  } catch (error) {
    console.error('Logging Error:', error.message);
  }
};

module.exports = { getLogs, createLog };
