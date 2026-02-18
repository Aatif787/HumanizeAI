const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-text-humanizer');

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    logger.warn(`MongoDB connection failed: ${error.message}. Running without database.`);
    return false;
  }
};

module.exports = connectDB;
