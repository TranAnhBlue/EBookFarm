"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSchema = exports.getSchemaById = exports.getSchemas = exports.createSchema = void 0;
const express_1 = require("express");
const FormSchema_1 = __importDefault(require("../models/FormSchema"));
const createSchema = async (req, res) => {
    try {
        const schema = new FormSchema_1.default(req.body);
        const createdSchema = await schema.save();
        res.status(201).json({ success: true, data: createdSchema });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.createSchema = createSchema;
const getSchemas = async (req, res) => {
    try {
        const schemas = await FormSchema_1.default.find({});
        res.json({ success: true, data: schemas });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSchemas = getSchemas;
const getSchemaById = async (req, res) => {
    try {
        const schema = await FormSchema_1.default.findById(req.params.id);
        if (schema) {
            res.json({ success: true, data: schema });
        }
        else {
            res.status(404).json({ success: false, message: 'Schema not found' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSchemaById = getSchemaById;
const deleteSchema = async (req, res) => {
    try {
        const schema = await FormSchema_1.default.findByIdAndDelete(req.params.id);
        if (schema) {
            res.json({ success: true, message: 'Schema removed' });
        }
        else {
            res.status(404).json({ success: false, message: 'Schema not found' });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteSchema = deleteSchema;
//# sourceMappingURL=formSchemaController.js.map