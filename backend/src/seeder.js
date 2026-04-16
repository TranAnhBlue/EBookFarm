const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const FormSchema = require('./models/FormSchema');
const connectDB = require('./config/db');

dotenv.config();

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
        await connectDB();
        await User.deleteMany();
        await FormSchema.deleteMany();

        const adminUser = new User({
            username: 'admin',
            password: 'password123',
            role: 'Admin'
        });
        await adminUser.save();

        const normalUser = new User({
            username: 'farmer1',
            password: 'password123',
            role: 'User'
        });
        await normalUser.save();

        await FormSchema.insertMany(schemas);

        console.log('Data Imported - Success');
        process.exit();
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

importData();