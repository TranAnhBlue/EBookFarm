"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const userExists = await User_1.default.findOne({ username });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const user = await User_1.default.create({
            username,
            password,
            role: role || 'User'
        });
        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user.id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user.id, user.role),
                }
            });
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User_1.default.findOne({ username });
        if (user && user.status === 'Active' && (await user.matchPassword(password))) {
            res.json({
                success: true,
                data: {
                    _id: user.id,
                    username: user.username,
                    role: user.role,
                    token: generateToken(user.id, user.role),
                }
            });
        }
        else {
            res.status(401).json({ success: false, message: 'Invalid username or password, or account inactive' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.loginUser = loginUser;
//# sourceMappingURL=authController.js.map