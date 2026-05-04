const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Only load .env file in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB already connected');
        return;
    }

    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }
        
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 15000, // Tăng lên 15s
            connectTimeoutMS: 15000,
        });
        isConnected = true;
        console.log('MongoDB connection SUCCESS');
    } catch (error) {
        console.error('MongoDB connection FAIL:', error.message);
        if (error.message.includes('ETIMEDOUT')) {
            console.error('Hint: Check if IP 0.0.0.0/0 is whitelisted in Atlas Network Access');
        }
        if (error.message.includes('Authentication failed')) {
            console.error('Hint: Check your MongoDB username and password');
        }
        throw error; // Re-throw to be caught by the middleware in server.js
    }
};

module.exports = connectDB;
