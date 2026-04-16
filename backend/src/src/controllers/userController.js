"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRoleStatus = exports.getUsers = void 0;
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password');
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUsers = getUsers;
const updateUserRoleStatus = async (req, res) => {
    try {
        const { role, status } = req.body;
        const user = await User_1.default.findById(req.params.id);
        if (user) {
            user.role = role || user.role;
            user.status = status || user.status;
            const updatedUser = await user.save();
            res.json({ success: true, data: updatedUser });
        }
        else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateUserRoleStatus = updateUserRoleStatus;
//# sourceMappingURL=userController.js.map