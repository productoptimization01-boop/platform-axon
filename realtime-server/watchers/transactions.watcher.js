const TransactionHistory = require("../models/TransactionHistory")
const { broadcast } = require("../sse/sseStore")

module.exports = () => {
  console.log("⚡ Transaction watcher started")

  TransactionHistory.watch([], { fullDocument: "updateLookup" })
    .on("change", change => {
      broadcast({
        event: "transaction_update",
        payload: change
      })
    })
}
