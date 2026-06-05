const User = require('../models/User');
const { createNotification } = require('../controllers/notificationController');

const normalizeId = (value) => {
  if (!value) return '';
  return String(value._id || value);
};

const findHtxUsersByRoles = async (htxId, roles) => {
  const id = normalizeId(htxId);
  const roleList = [...new Set((roles || []).filter(Boolean))];
  if (!id || !roleList.length) return [];

  return User.find({
    role: { $in: roleList },
    $or: [
      { _id: id },
      { htxId: id },
    ],
  }).select('_id role fullname username');
};

const notifyMany = async ({
  recipients,
  sender,
  title,
  message,
  type,
  relatedId,
  relatedModel,
  categoryLabel,
  skipSender = true,
}) => {
  const senderId = normalizeId(sender);
  const ids = [...new Set((recipients || []).map(normalizeId).filter(Boolean))]
    .filter(id => !skipSender || id !== senderId);

  if (!ids.length) return [];

  return Promise.all(ids.map(recipient => createNotification({
    recipient,
    sender,
    title,
    message,
    type,
    relatedId,
    relatedModel,
    categoryLabel,
  })));
};

const notifyHtxRoles = async ({ htxId, roles, ...payload }) => {
  const users = await findHtxUsersByRoles(htxId, roles);
  return notifyMany({
    recipients: users.map(user => user._id),
    ...payload,
  });
};

module.exports = {
  findHtxUsersByRoles,
  notifyMany,
  notifyHtxRoles,
};
