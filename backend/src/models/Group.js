const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: String }], // List of allowed actions or modules
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
