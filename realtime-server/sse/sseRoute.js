const TransactionHistory = require("../models/TransactionHistory")
const { addClient, removeClient } = require("./sseStore")

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.flushHeaders()

  const clientId = Date.now()
  addClient({ id: clientId, res })

  console.log(`🟢 SSE Client Connected: ${clientId}`)

  // 🔥 Initial pending transactions
  try {
    const pendingTransactions = await TransactionHistory.find({
      status: "Pending",
    }).sort({ createdAt: -1 })

    res.write(`data: ${JSON.stringify({
      event: "initial_transactions",
      payload: pendingTransactions
    })}\n\n`)
  } catch (err) {
    console.error("Initial SSE error:", err)
  }

  req.on("close", () => {
    removeClient(clientId)
    console.log(`🔴 SSE Client Disconnected: ${clientId}`)
  })
}
