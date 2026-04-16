const AgriModel = require('../models/AgriModel');

const getTree = async (req, res) => {
  try {
    const models = await AgriModel.find().populate('schemaId').sort({ level: 1, order: 1 });
    // Transform to tree on client or here? Let's do a simple list and let client handle tree mapping
    res.json({ success: true, data: models });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNode = async (req, res) => {
  try {
    const { name, level, parentId, schemaId, order } = req.body;
    const node = await AgriModel.create({ name, level, parentId, schemaId, order });
    res.status(201).json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateNode = async (req, res) => {
  try {
    const node = await AgriModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
    res.json({ success: true, data: node });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteNode = async (req, res) => {
  try {
    // Also delete children?
    const node = await AgriModel.findById(req.params.id);
    if (!node) return res.status(404).json({ success: false, message: 'Node not found' });
    
    // Find children and delete them too
    const deleteChildren = async (parentId) => {
      const children = await AgriModel.find({ parentId });
      for (const child of children) {
        await deleteChildren(child._id);
        await child.deleteOne();
      }
    };
    
    await deleteChildren(node._id);
    await node.deleteOne();
    
    res.json({ success: true, message: 'Node and its children removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTree, createNode, updateNode, deleteNode };
