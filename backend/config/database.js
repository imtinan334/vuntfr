const mongoose = require('mongoose');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vu-datesheet-notifier';
    
    console.log(`[${new Date().toISOString()}] 🔌 Connecting to MongoDB...`);
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[${new Date().toISOString()}] ✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error:`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(`[${new Date().toISOString()}] ⚠️ MongoDB disconnected`);
    });

    mongoose.connection.on('reconnected', () => {
      console.log(`[${new Date().toISOString()}] 🔄 MongoDB reconnected`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log(`[${new Date().toISOString()}] 🛑 Received SIGINT, closing MongoDB connection...`);
      await mongoose.connection.close();
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ MongoDB connection failed:`, error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log(`[${new Date().toISOString()}] ✅ MongoDB disconnected`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] ❌ Error disconnecting from MongoDB:`, error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
}; 