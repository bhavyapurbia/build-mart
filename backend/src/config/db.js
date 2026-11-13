import mongoose from 'mongoose';
import { env } from './env.js';

let mongodInstance = null;
let isConnected = false;

export const connectDB = async (retryCount = 0) => {
  let mongoUri = env.MONGODB_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    if (env.NODE_ENV === 'production') {
      console.error('FATAL: MONGODB_URI is required in production.');
      process.exit(1);
    }

    try {
      console.log('📦 Starting Zero-Config In-Memory MongoDB (mongodb-memory-server)...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const options = {};
      if (process.env.MEMORY_DB_PATH) {
        options.instance = { dbPath: process.env.MEMORY_DB_PATH };
      }
      mongodInstance = await MongoMemoryServer.create(options);
      mongoUri = mongodInstance.getUri();
      console.log(`✅ Dev In-Memory MongoDB started at: ${mongoUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start In-Memory MongoDB:', memErr.message);
      throw memErr;
    }
  }

  const maxRetries = env.NODE_ENV === 'production' ? 5 : 1;
  const retryDelay = 2000 * Math.pow(1.5, retryCount);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected to: ${mongoUri.replace(/:([^:@]+)@/, ':****@')}`);
    return mongoose.connection;
  } catch (err) {
    console.error(`❌ MongoDB connection failed (${err.message})`);
    if (retryCount < maxRetries && env.NODE_ENV === 'production') {
      console.log(`🔄 Retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})...`);
      await new Promise(res => setTimeout(res, retryDelay));
      return connectDB(retryCount + 1);
    }
    if (env.NODE_ENV === 'production') {
      console.error('FATAL: Could not connect to MongoDB after maximum retries. Exiting non-zero.');
      process.exit(1);
    }
    throw err;
  }
};

export const closeDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
  isConnected = false;
};

export const isDatabaseConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

export const getDBMode = () => {
  return 'mongodb';
};

export default { connectDB, closeDB, isConnected: isDatabaseConnected, getDBMode };
