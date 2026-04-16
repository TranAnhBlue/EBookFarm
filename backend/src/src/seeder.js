"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
const FormSchema_1 = __importDefault(require("./models/FormSchema"));
const db_1 = __importDefault(require("./config/db"));
dotenv_1.default.config();
const schemas = [
    {
        name: 'Quy trình sản xuất Cà Chua Sinh Học',
        description: 'Nhật ký sản xuất cà chua đạt chuẩn VietGAP',
        tables: [
            {
                tableName: 'Chuẩn Bị Đất & Xuống Giống',
                fields: [
                    { name: 'seed_type', label: 'Loại giống', type: 'select', options: ['Cổ điển', 'Lai F1', 'Cherry'], required: true },
                    { name: 'plant_date', label: 'Ngày xuống giống', type: 'date', required: true },
                    { name: 'area', label: 'Diện tích (m2)', type: 'number', required: true }
                ]
            },
            {
                tableName: 'Chăm Sóc & Phân Bón',
                fields: [
                    { name: 'fertilizer_type', label: 'Loại phân bón', type: 'text', required: true },
                    { name: 'amount', label: 'Số lượng (kg)', type: 'number', required: true },
                    { name: 'apply_date', label: 'Ngày bón', type: 'date', required: true }
                ]
            },
            {
                tableName: 'Thu Hoạch',
                fields: [
                    { name: 'harvest_date', label: 'Ngày thu hoạch', type: 'date', required: true },
                    { name: 'yield', label: 'Sản lượng (kg)', type: 'number', required: true },
                    { name: 'quality', label: 'Chất lượng', type: 'select', options: ['Loại 1', 'Loại 2', 'Loại 3'], required: true }
                ]
            }
        ]
    }
];
const importData = async () => {
    try {
        await (0, db_1.default)();
        await User_1.default.deleteMany();
        await FormSchema_1.default.deleteMany();
        // Create Admin
        const adminUser = new User_1.default({
            username: 'admin',
            password: 'password123',
            role: 'Admin'
        });
        const savedAdmin = await adminUser.save();
        // Create normal user
        const normalUser = new User_1.default({
            username: 'farmer1',
            password: 'password123',
            role: 'User'
        });
        await normalUser.save();
        // Create schemas
        await FormSchema_1.default.insertMany(schemas);
        console.log('Data Imported - Success');
        process.exit();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
importData();
//# sourceMappingURL=seeder.js.map