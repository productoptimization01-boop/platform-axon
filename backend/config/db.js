const mongoose = require("mongoose")

const MONGO_URI = "mongodb+srv://rexrax840_db_user:LswE0BNx2GuJrFwz@cluster0.mhaoxj1.mongodb.net/mission-axon"
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  } catch (error) {
    console.error("MongoDB connection failed:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
