let sseClients = []

const addClient = (client) => {
  sseClients.push(client)
}

const removeClient = (id) => {
  sseClients = sseClients.filter(c => c.id !== id)
}

const broadcast = (data) => {
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${JSON.stringify(data)}\n\n`)
    } catch (err) {
      console.error("SSE write error:", err)
    }
  })
}

module.exports = {
  addClient,
  removeClient,
  broadcast
}
