const { InventoryItem, InventoryTransaction } = require('../models/Inventory');
const { createLog } = require('./logController');

const getItems = async (req, res) => {
  try {
    const items = await InventoryItem.find({});
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const item = new InventoryItem(req.body);
    const created = await item.save();
    
    // Log action
    await createLog(req.user.id, 'Tạo vật tư mới', created._id, 'InventoryItem', { name: created.name });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    // Log action
    await createLog(req.user.id, 'Cập nhật vật tư', item._id, 'InventoryItem', { name: item.name });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const itemName = item.name;
    await item.deleteOne();

    // Log action
    await createLog(req.user.id, 'Xóa vật tư', req.params.id, 'InventoryItem', { name: itemName });

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const processTransaction = async (req, res) => {
  try {
    const { itemId, type, quantity, note, journalId } = req.body;
    const item = await InventoryItem.findById(itemId);
    
    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (type === 'Export' && item.quantity < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient quantity in inventory' });
    }

    const transaction = new InventoryTransaction({
        itemId, type, quantity, note, journalId
    });

    await transaction.save();

    item.quantity = type === 'Import' ? item.quantity + quantity : item.quantity - quantity;
    await item.save();

    // Log action
    await createLog(req.user.id, `${type === 'Import' ? 'Nhập' : 'Xuất'} kho`, item._id, 'InventoryItem', { 
      quantity, 
      type, 
      itemName: item.name 
    });

    res.status(201).json({ success: true, data: transaction });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getItems, createItem, updateItem, deleteItem, processTransaction };