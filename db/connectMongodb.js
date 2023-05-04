const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const url = process.env.MONGODB_URI;
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
