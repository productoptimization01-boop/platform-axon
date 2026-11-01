"use client"

import { createContext, useContext, useState, useRef } from "react"

const LiveSupportContext = createContext(undefined)

export function LiveSupportProvider({ children }) {
  const host1offline = "http://localhost:3001/"
  const host2offline = "http://localhost:8000/"
  const host1online = "https://platform-axon-rust.vercel.app/"
  const host2online = "https://platform-axon-realtime.onrender.com/"
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [typingStatus, setTypingStatus] = useState({})
  const [isChatOpen, setIsChatOpen] = useState(false) // Added isChatOpen state to track if chat box is open
  const sseRef = useRef(null)
  const userIdRef = useRef(null)

  const connectSSE = (userId) => {
    if (!userId) return

    userIdRef.current = userId

    if (sseRef.current) sseRef.current.close()

    const sse = new EventSource(`${host2online}api/liveSupport/stream?userId=${userId}`)
    sseRef.current = sse

    sse.onopen = () => {
      console.log("LiveSupport SSE connected")
      setIsConnected(true)
    }

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (!data || !data.event) return

        switch (data.event) {
          case "initial_messages":
            setMessages(
              (data.payload || []).map((msg) => ({
                ...msg,
                read: msg.read ?? false,
              })),
            )
            break

          case "new_message":
            setMessages((prev) => [...prev, data.payload])
            // Auto-open: when admin (support) sends a live message, open
            // the chat window automatically, on whichever page the user
            // is on. Setting true when already open is a no-op. This is
            // only for live new_message events, not for history loaded
            // on page load, so old unread messages do not pop open.
            if (data.payload.sender === "support") {
              setIsChatOpen(true)
              setTimeout(() => {
                markMessagesAsRead([data.payload.id])
              }, 1000)
            }
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
            break

          case "typing_status":
            setTypingStatus((prev) => ({
              ...prev,
              [data.payload.userId]: data.payload.isTyping
                ? { username: data.payload.username, sender: data.payload.sender }
                : null,
            }))
            break

          default:
            break
        }
      } catch (err) {
        console.error("SSE parse error:", err)
      }
    }

    sse.onerror = (err) => {
      console.error("SSE error:", err)
      sse.close()
      setIsConnected(false)
    }
  }

  const markMessagesAsRead = async (messageIds) => {
    if (!userIdRef.current) return

    try {
      await fetch(`${host2online}api/liveSupport/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userIdRef.current, messageIds }),
      })
    } catch (err) {
      console.error("markMessagesAsRead error:", err)
    }
  }

  const sendMessage = async (payload) => {
    const { userId, username, text, fileType, fileUrl, fileName, replyTo, sender } = payload

    if (!userId || !username || (!text && !fileUrl)) return

    const newMsg = {
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
        body: JSON.stringify(newMsg),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to send message")

      return result
    } catch (err) {
      console.error("SendMessage error:", err)
      return { error: err.message }
    }
  }

  const fetchChatHistory = async (userId) => {
    if (!userId) return []
    try {
      const res = await fetch(`${host2online}api/liveSupport/history/${userId}`)
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || "Failed to fetch chat history")

      setMessages(result.messages || [])
      return result.messages || []
    } catch (err) {
      console.error("FetchChatHistory error:", err)
      return []
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

  return (
    <LiveSupportContext.Provider
      value={{
        messages,
        isConnected,
        sendMessage,
        fetchChatHistory,
        connectSSE,
        markMessagesAsRead,
        sendTypingStatus,
        typingStatus,
        isChatOpen, // Export isChatOpen state and setter
        setIsChatOpen,
      }}
    >
      {children}
    </LiveSupportContext.Provider>
  )
}

export function useLiveSupportContext() {
  const context = useContext(LiveSupportContext)
  if (!context) throw new Error("useLiveSupportContext must be used within LiveSupportProvider")
  return context
}
