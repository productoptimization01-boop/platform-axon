const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")

const startUsersWatcher = require("./watchers/users.watcher")
const startTransactionsWatcher = require("./watchers/transactions.watcher")

const app = express()

connectDB()

app.use(cors({ origin: "*" }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 🔥 SSE endpoint
app.get("/api/realtime-events", require("./sse/sseRoute"))

// 🔥 Live Support
app.use("/api/liveSupport", require("./routes/liveSupport"))

// 🔥 Start MongoDB watchers
startUsersWatcher()
startTransactionsWatcher()

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Realtime server running on port ${PORT}`);
});

