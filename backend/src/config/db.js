import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isConnected = false;
let useLocalStore = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
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

export const getDBMode = () => {
  if (mongoose.connection && mongoose.connection.readyState === 1 && !useLocalStore) {
    return 'mongodb';
  }
  return 'local-json';
};

export const isDatabaseConnected = () => isConnected;

export default { connectDB, getDBMode, isConnected: isDatabaseConnected };
