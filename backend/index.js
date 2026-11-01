const express = require("express")
const connectDB = require("./config/db")
const cors = require("cors")

const app = express()
const PORT = 3001

// =======================
// 🔥 DB CONNECTION
// =======================
connectDB()

// =======================
// 🔥 MIDDLEWARES
// =======================
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
  })
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// =======================
// 🔥 API ROUTES
// =======================
app.use("/api/users", require("./routes/users"))
app.use("/api/products", require("./routes/products"))
app.use("/api/combo", require("./routes/combo"))
app.use("/api/settings", require("./routes/settings"))

// =======================
// 🚀 START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`)
})
