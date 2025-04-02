const mongoose = require('mongoose');

const connectdb = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Database is connected successfully");
  } catch (e) {
    console.log("Database connection failed", e);
    process.exit(1);
  }
};

module.exports = connectdb;
