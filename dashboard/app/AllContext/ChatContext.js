"use client"

import { createContext, useContext, useState, useEffect, useRef } from "react"

const ChatContext = createContext(undefined)

export function ChatProvider({ children }) {
  const host1offline = "http://localhost:3001/"
  const host2offline = "http://localhost:8000/"
  const host1online = "https://platform-axon-rust.vercel.app/"
  const host2online = "https://platform-axon-realtime.onrender.com/"
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingStatus, setTypingStatus] = useState({})
  const sseRef = useRef(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${host2online}api/liveSupport/allUsers`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch users")
      setUsers(data.users || [])
      return data.users || []
    } catch (err) {
      console.error("FetchUsers error:", err)
      return []
    }
  }

  const updateUsersWithMessages = (newMessages) => {
    setUsers((prevUsers) => {
      const userMap = {}
      prevUsers.forEach((u) => (userMap[u.id] = { ...u }))

      newMessages.forEach((msg) => {
        if (msg.sender !== "user") return

        if (!userMap[msg.userId]) {
          userMap[msg.userId] = {
            id: msg.userId,
            username: msg.username,
            lastMessage: msg.text || msg.fileName || "File sent",
            timestamp: msg.timestamp,
            pendingMessages: msg.read ? 0 : 1,
          }
        } else {
          userMap[msg.userId].lastMessage = msg.text || msg.fileName || "File sent"
          userMap[msg.userId].timestamp = msg.timestamp
          if (!msg.read) userMap[msg.userId].pendingMessages += 1
        }
      })

      return Object.values(userMap).sort((a, b) => b.timestamp - a.timestamp)
    })
  }

  useEffect(() => {
    const sse = new EventSource(`${host2online}api/liveSupport/stream`)
    sseRef.current = sse

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (!data || !data.event) return

      switch (data.event) {
        case "initial_messages":
          setMessages((data.payload || []).map((msg) => ({ ...msg, read: msg.read ?? false })))
          updateUsersWithMessages(data.payload || [])
          break
        case "new_message":
          setMessages((prev) => {
            const updated = [...prev, data.payload]
            updateUsersWithMessages([data.payload])
            return updated
          })
          break
        case "messages_read":
          setMessages((prev) =>
            prev.map((msg) => {
              if (data.payload.messageIds && data.payload.messageIds.includes(msg.id)) {
                return { ...msg, read: true }
              }
              if (!data.payload.messageIds && msg.userId === data.payload.userId) {
                return { ...msg, read: true }
              }
              return msg
            }),
          )
          setUsers((prev) => prev.map((u) => (u.id === data.payload.userId ? { ...u, pendingMessages: 0 } : u)))
          break
        case "chat_deleted":
          setUsers((prev) => prev.filter((u) => u.id !== data.payload.userId))
          setMessages((prev) => prev.filter((m) => m.userId !== data.payload.userId))
          if (selectedUser?.id === data.payload.userId) setSelectedUser(null)
          break
        case "typing_status":
          setTypingStatus((prev) => ({
            ...prev,
            [data.payload.userId]: data.payload.isTyping
              ? { username: data.payload.username, sender: data.payload.sender }
              : null,
          }))
          break
      }
    }

    return () => sse.close()
  }, [])

  const sendMessage = async ({
    userId,
    username = "Support",
    text,
    fileType,
    fileUrl,
    fileName,
    replyTo,
    sender = "support",
  }) => {
    if (!userId || (!text && !fileUrl)) return

    const payload = {
      userId,
      username,
      sender,
      text: text || "",
      fileType: fileType || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      replyTo: replyTo || null,
    }

    try {
      const res = await fetch(`${host2online}api/liveSupport/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send message")
      return data
    } catch (err) {
      console.error("SendMessage error:", err)
      return { error: err.message }
    }
  }

  const fetchChatHistory = async (userId) => {
    if (!userId) return []
    try {
      const res = await fetch(`${host2online}api/liveSupport/history/${userId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to fetch chat history")
      setMessages(data.messages || [])

      const unreadUserMessages = (data.messages || [])
        .filter((msg) => msg.sender === "user" && !msg.read)
        .map((msg) => msg.id)
      if (unreadUserMessages.length > 0) {
        setTimeout(() => {
          markMessagesAsRead(userId, unreadUserMessages)
        }, 500)
      }

      return data.messages || []
    } catch (err) {
      console.error("FetchChatHistory error:", err)
      return []
    }
  }

  const markMessagesAsRead = async (userId, messageIds = null) => {
    try {
      const res = await fetch(`${host2online}api/liveSupport/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, messageIds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to mark messages read")

      setMessages((prev) =>
        prev.map((msg) => {
          if (messageIds && messageIds.includes(msg.id)) {
            return { ...msg, read: true }
          }
          if (!messageIds && msg.userId === userId) {
            return { ...msg, read: true }
          }
          return msg
        }),
      )
      return data
    } catch (err) {
      console.error("MarkMessagesRead error:", err)
      return { error: err.message }
    }
  }

  const killChat = async (userId) => {
    if (!userId) return

    try {
      const res = await fetch(`${host2online}api/liveSupport/killChat/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete chat")

      setUsers((prev) => prev.filter((u) => u.id !== userId))
      setMessages((prev) => prev.filter((m) => m.userId !== userId))
      if (selectedUser?.id === userId) setSelectedUser(null)

      console.log("Chat deleted successfully for userId:", userId)
      return data
    } catch (err) {
      console.error("killChat error:", err)
      return { error: err.message }
    }
  }

  const sendTypingStatus = async (userId, username, sender, isTyping) => {
    try {
      await fetch(`${host2online}api/liveSupport/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, username, sender, isTyping }),
      })
    } catch (err) {
      console.error("sendTypingStatus error:", err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <ChatContext.Provider
      value={{
        users,
        setUsers,
        selectedUser,
        setSelectedUser,
        messages,
        isConnected,
        fetchUsers,
        fetchChatHistory,
        sendMessage,
        markMessagesAsRead,
        killChat,
        sendTypingStatus,
        typingStatus,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) throw new Error("useChatContext must be used within ChatProvider")
  return context
}
