const User = require("../models/Users")
const { broadcast } = require("../sse/sseStore")

module.exports = () => {
  console.log("⚡ Users watcher started")

  User.watch([], { fullDocument: "updateLookup" })
    .on("change", change => {
      broadcast({
        event: "users_updated",
        payload: change
      })
    })
}
