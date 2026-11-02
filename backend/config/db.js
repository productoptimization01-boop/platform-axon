const mongoose = require("mongoose")

const MONGO_URI = "mongodb+srv://productoptimization01_db_user:qNrGuk5a3lGayxnV@cluster0.spybq1a.mongodb.net/mission-axon"
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
