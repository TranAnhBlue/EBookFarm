const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ebookfarm';
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = true;
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.error('MongoDB connection FAIL', error);
        // Don't exit on Vercel serverless
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;