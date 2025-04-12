const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// MongoDB URI from environment variable or default
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/login'; // Replace with your own DB name

// Function to connect to the database
const connectDB = async () => {
  try {
    // Adding additional options for newer versions of mongoose
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1); // Exit the process on failure
  }
};

module.exports = connectDB;
