const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnected = false;
let useLocalStore = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/buildmart';
  
  try {
    // Attempt Mongoose connection with fast 1.2-second timeout
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1200,
    });
    isConnected = true;
    useLocalStore = false;
    console.log(`✅ MongoDB Connected to: ${mongoUri}`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection to ${mongoUri} failed (${err.message}).`);
    console.log(`📦 Switching seamlessly to persistent Local JSON Document Database in backend/data/`);
    useLocalStore = true;
    isConnected = true;
  }
};

const getDBMode = () => {
  if (mongoose.connection && mongoose.connection.readyState === 1 && !useLocalStore) {
    return 'mongodb';
  }
  return 'local-json';
};

module.exports = { connectDB, getDBMode, isConnected: () => isConnected };
