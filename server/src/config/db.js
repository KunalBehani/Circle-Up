import mongoose from 'mongoose';
import { config } from './env.js';

let mongod = null;

export const connectDB = async () => {
  try {
    let uri = config.mongodbUri;
    if (!uri && config.nodeEnv === 'production') {
  throw new Error('MONGODB_URI is required in production');
}

    // If no URI is configured or if running in test without an explicit URI, spin up an in-memory Mongo server
      if (!uri) {
    console.log('ℹ️  No MONGODB_URI provided. Attempting to start in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`✅ In-memory MongoDB server started at: ${uri}`);
    } catch (err) {
      console.warn('⚠️ In-memory MongoDB failed, falling back to local MongoDB at mongodb://127.0.0.1:27017/circleup_dev');
      uri = 'mongodb://127.0.0.1:27017/circleup_dev';
    }
  }

    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err.message);
  }
};
