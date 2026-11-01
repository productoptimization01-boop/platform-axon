const mongoose = require("mongoose")

const MONGO_URI = "mongodb+srv://goku012:0121452goku@cluster0.53byfkj.mongodb.net/mission-axon"

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("✅ MongoDB Connected")
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
