"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTransaction = exports.createItem = exports.getItems = void 0;
const express_1 = require("express");
const Inventory_1 = require("../models/Inventory");
const getItems = async (req, res) => {
    try {
        const items = await Inventory_1.InventoryItem.find({});
        res.json({ success: true, data: items });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getItems = getItems;
const createItem = async (req, res) => {
    try {
        const item = new Inventory_1.InventoryItem(req.body);
        const created = await item.save();
        res.status(201).json({ success: true, data: created });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createItem = createItem;
const processTransaction = async (req, res) => {
    try {
        const { itemId, type, quantity, note, journalId } = req.body;
        const item = await Inventory_1.InventoryItem.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        if (type === 'Export' && item.quantity < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient quantity in inventory' });
        }
        const transaction = new Inventory_1.InventoryTransaction({
            itemId, type, quantity, note, journalId
        });
        await transaction.save();
        item.quantity = type === 'Import' ? item.quantity + quantity : item.quantity - quantity;
        await item.save();
        res.status(201).json({ success: true, data: transaction });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.processTransaction = processTransaction;
//# sourceMappingURL=inventoryController.js.map