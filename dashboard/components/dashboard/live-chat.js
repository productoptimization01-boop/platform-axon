"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import * as LucideIcons from "lucide-react"
import { useChatContext } from "@/app/AllContext/ChatContext"
import { useDashboard } from "@/app/AllContext/DashboardContext"
import { optimizeImage, validateImageFile, getBase64Size } from "@/lib/image-optimizer"

export default function LiveChat() {
    const { messages, sendMessage, fetchChatHistory, users, setUsers, killChat, sendTypingStatus, typingStatus, markMessagesAsRead, selectedUser: contextSelectedUser, setSelectedUser: setContextSelectedUser } = useChatContext()
    const { onlineUsers, realtimeEnabled } = useDashboard()
    const onlineIds = new Set((onlineUsers || []).map((u) => String(u._id)))
    const isUserOnline = (id) => realtimeEnabled && onlineIds.has(String(id))

    // Req 2: a user opened from Users Management arrives here via
    // ChatContext, so admin can send the first message to a user who
    // has never chatted before.
    const [selectedUser, setSelectedUser] = useState(null)
    useEffect(() => {
      if (contextSelectedUser) {
        setSelectedUser(contextSelectedUser)
        if (!users.some((u) => u.id === contextSelectedUser.id)) {
          setUsers((prev) => [{ id: contextSelectedUser.id, username: contextSelectedUser.username, lastMessage: "", timestamp: Date.now(), pendingMessages: 0 }, ...prev])
        }
      }
    }, [contextSelectedUser])
    const [messageText, setMessageText] = useState("")
    const [replyingTo, setReplyingTo] = useState(null)
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [hoveredMessageId, setHoveredMessageId] = useState(null)
    const [lightboxImage, setLightboxImage] = useState(null)

    const fileInputRef = useRef(null)
    const imageInputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)
    const messageRefs = useRef({})
    const typingTimeoutRef = useRef(null)

    // Inside LiveChat component, after your existing useEffect hooks
    useEffect(() => {
        if (!selectedUser) return

        // Find all unread messages from the selected user
        const unreadMessages = messages
            .filter((msg) => msg.userId === selectedUser.id && msg.sender === "user" && !msg.read)
            .map((msg) => msg.id)

        if (unreadMessages.length > 0) {
            // Automatically mark them as read in context/server
            markMessagesAsRead(selectedUser.id, unreadMessages)
        }
    }, [messages, selectedUser])


    useEffect(() => {
        if (selectedUser) {
            fetchChatHistory(selectedUser.id)
        }
    }, [selectedUser])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleInputChange = (e) => {
        setMessageText(e.target.value)

        if (selectedUser) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

            sendTypingStatus(selectedUser.id, "Support", "support", true)

            typingTimeoutRef.current = setTimeout(() => {
                sendTypingStatus(selectedUser.id, "Support", "support", false)
            }, 2000)
        }
    }

    const scrollToMessage = (messageId) => {
        const messageElement = messageRefs.current[messageId]
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
            messageElement.classList.add("highlight-message")
            setTimeout(() => {
                messageElement.classList.remove("highlight-message")
            }, 2000)
        }
    }

    const handleSendMessage = async () => {
        if (!messageText.trim()) return
        if (!selectedUser) return

        sendTypingStatus(selectedUser.id, "Support", "support", false)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        await sendMessage({
            userId: selectedUser.id,
            username: "Support",
            sender: "support",
            text: messageText,
            replyTo: replyingTo?.id || null,
            timestamp: Date.now(),
        })

        setMessageText("")
        setReplyingTo(null)
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !selectedUser) return

        const validation = validateImageFile(file)
        if (!validation.valid) {
            alert(validation.error)
            return
        }

        setIsOptimizing(true)

        try {
            const optimizedDataUrl = await optimizeImage(file, {
                maxWidth: 1920,
                maxHeight: 1080,
                quality: 0.75,
                format: "webp",
            })

            const optimizedSize = getBase64Size(optimizedDataUrl)
            console.log(`Sending optimized image: ${optimizedSize.toFixed(2)} KB`)

            const payload = {
                userId: selectedUser.id,
                username: "Support",
                sender: "support",
                fileType: "image",
                fileUrl: optimizedDataUrl,
                fileName: file.name.replace(/\.[^/.]+$/, ".webp"),
                replyTo: replyingTo?.id || null,
            }

            await sendMessage(payload)
            setReplyingTo(null)
        } catch (error) {
            console.error("Image optimization failed:", error)
            alert("Failed to optimize image. Please try again.")
        } finally {
            setIsOptimizing(false)
            if (imageInputRef.current) {
                imageInputRef.current.value = ""
            }
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !selectedUser) return

        const payload = {
            userId: selectedUser.id,
            username: "Support",
            sender: "support",
            fileType: "file",
            fileUrl: URL.createObjectURL(file),
            fileName: file.name,
            replyTo: replyingTo?.id || null,
        }
        await sendMessage(payload)
        setReplyingTo(null)
    }

    const handleKillChat = async (userId, e) => {
        e.stopPropagation()
        if (confirm("Are you sure you want to end this chat? All messages will be archived.")) {
            await killChat(userId)
        }
    }

    const getReplyMessage = (replyToId) => {
        return messages.find((msg) => msg.id === replyToId)
    }

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`
        return date.toLocaleDateString()
    }

    const totalPendingMessages = users.reduce((sum, u) => sum + u.pendingMessages, 0)

    return (
        <div className="h-[calc(100vh-12rem)] flex gap-4">
            {lightboxImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
                        <img
                            src={lightboxImage || "/placeholder.svg"}
                            alt="Full size"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setLightboxImage(null)}
                            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        >
                            <LucideIcons.X className="h-6 w-6" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                            Click anywhere to close
                        </div>
                    </div>
                </div>
            )}

            {/* Users List */}
            <Card className="w-80 bg-slate-900/60 border-slate-800/50 flex flex-col">
                <div className="p-4 border-b border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-slate-100">Active Chats</h2>
                        {totalPendingMessages > 0 && (
                            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                {totalPendingMessages} new
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search users..." className="pl-10 bg-slate-800/60 border-slate-700 text-slate-200" />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-2">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className={`group p-3 rounded-xl cursor-pointer transition-all ${selectedUser?.id === user.id
                                    ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50"
                                    : "bg-slate-800/40 hover:bg-slate-800/60 border-2 border-transparent"
                                    }`}
                                onClick={() => { setSelectedUser(user); setContextSelectedUser(user) }}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            {user.username.charAt(0)}
                                        </div>
                                        {isUserOnline(user.id) && (
                                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-slate-900" title="Online now" />
                                        )}
                                        {user.pendingMessages > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                                                {user.pendingMessages}
                                            </div>
                                        )}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-slate-100 truncate">{user.username}</h3>
                                            <span className="text-xs text-slate-400">{formatTime(user.timestamp)}</span>
                                        </div>

                                        <p className="text-xs text-slate-400 truncate mt-1">{user.lastMessage}</p>
                                        <p className="text-xs text-slate-500 mt-1">ID: {user.id}</p>

                                        {/* ✅ End Chat Button below the content */}
                                        <div className="mt-2">
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="h-7 px-2 text-xs bg-red-600 hover:bg-red-700 transition-colors"
                                                onClick={(e) => handleKillChat(user.id, e)}
                                            >
                                                <LucideIcons.Trash2 className="h-3 w-3 mr-1" />
                                                End Chat
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </ScrollArea>
            </Card>

            {/* Chat Area */}
            {selectedUser ? (
                <Card className="flex-1 bg-slate-900/60 border-slate-800/50 flex flex-col">
                    <div className="p-4 border-b border-slate-800/50 bg-gradient-to-r from-slate-800/50 to-slate-900/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">{selectedUser.username}</h3>
                            <p className="text-xs text-slate-400">User ID: {selectedUser.id}</p>
                            {realtimeEnabled && (
                                <p className="text-xs mt-1 flex items-center gap-1.5">
                                    <span className={`h-2.5 w-2.5 rounded-full ${isUserOnline(selectedUser.id) ? "bg-green-500" : "bg-slate-500"}`} />
                                    <span className={isUserOnline(selectedUser.id) ? "text-green-400 font-semibold" : "text-slate-400"}>{isUserOnline(selectedUser.id) ? "Online now" : "Offline"}</span>
                                </p>
                            )}
                        </div>
                        <Button variant="destructive" size="sm" onClick={(e) => handleKillChat(selectedUser.id, e)}>
                            <LucideIcons.Trash2 className="h-4 w-4 mr-2" />
                            End Chat
                        </Button>
                    </div>

                    <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {messages
                            .filter((m) => m.userId === selectedUser.id)
                            .map((msg) => {
                                const isUser = msg.sender === "user"
                                const isSupport = msg.sender === "support"
                                const replyMessage = msg.replyTo ? getReplyMessage(msg.replyTo) : null

                                return (
                                    <div
                                        key={msg.id}
                                        ref={(el) => (messageRefs.current[msg.id] = el)}
                                        className={`flex items-start gap-2 transition-all ${isUser ? "justify-start" : "justify-end"}`}
                                        onMouseEnter={() => setHoveredMessageId(msg.id)}
                                        onMouseLeave={() => setHoveredMessageId(null)}
                                    >
                                        {isUser && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                {msg.username?.charAt(0) || "U"}
                                            </div>
                                        )}

                                        <div className="max-w-[70%] relative">
                                            {replyMessage && (
                                                <div
                                                    onClick={() => scrollToMessage(msg.replyTo)}
                                                    className={`mb-2 p-2 rounded-lg border-l-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${isUser ? "bg-slate-800/60 border-blue-400" : "bg-cyan-900/30 border-cyan-400"
                                                        }`}
                                                >
                                                    <p className="text-xs text-slate-400 font-medium mb-1">
                                                        Replying to {replyMessage.sender === "user" ? replyMessage.username : "Support"}
                                                    </p>
                                                    {replyMessage.fileType === "image" && replyMessage.fileUrl && (
                                                        <img
                                                            src={replyMessage.fileUrl || "/placeholder.svg"}
                                                            alt="Reply preview"
                                                            className="w-16 h-16 rounded object-cover mb-1"
                                                        />
                                                    )}
                                                    <p className="text-xs text-slate-300 line-clamp-2">
                                                        {replyMessage.text || replyMessage.fileName || "Image"}
                                                    </p>
                                                </div>
                                            )}

                                            <div
                                                className={`px-4 py-2 rounded-2xl ${isUser
                                                    ? "bg-slate-800 text-slate-100"
                                                    : "bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                                                    }`}
                                            >
                                                {msg.fileType === "image" && msg.fileUrl && (
                                                    <img
                                                        src={msg.fileUrl || "/placeholder.svg"}
                                                        alt="Shared image"
                                                        className="rounded-lg max-w-full h-auto max-h-64 object-cover mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => setLightboxImage(msg.fileUrl)}
                                                    />
                                                )}

                                                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

                                                {msg.fileUrl && msg.fileType === "file" && (
                                                    <a
                                                        href={msg.fileUrl}
                                                        download={msg.fileName}
                                                        className="flex items-center gap-2 text-sm underline mt-1"
                                                    >
                                                        <LucideIcons.FileText className="h-4 w-4" />
                                                        {msg.fileName}
                                                    </a>
                                                )}

                                                <div className="flex items-center justify-between mt-2 gap-2">
                                                    <span className={`text-xs ${isUser ? "text-slate-400" : "text-white/70"}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>

                                                    {isSupport && (
                                                        <div className="flex items-center gap-1">
                                                            {msg.read ? (
                                                                <LucideIcons.CheckCheck className="w-4 h-4 text-blue-400" />
                                                            ) : (
                                                                <LucideIcons.Check className="w-4 h-4 text-white/50" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {hoveredMessageId === msg.id && (
                                                <Button
                                                    onClick={() => setReplyingTo(msg)}
                                                    size="icon"
                                                    variant="ghost"
                                                    className={`absolute top-0 h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 shadow-lg ${isUser ? "-right-10" : "-left-10"
                                                        }`}
                                                >
                                                    <LucideIcons.Reply className="h-4 w-4 text-cyan-400" />
                                                </Button>
                                            )}
                                        </div>

                                        {isSupport && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                S
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                        {selectedUser && typingStatus[selectedUser.id]?.sender === "user" && (
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                    {typingStatus[selectedUser.id]?.username?.charAt(0) || "U"}
                                </div>
                                <div className="bg-slate-800 px-4 py-3 rounded-2xl">
                                    <div className="flex gap-1">
                                        <span
                                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0s" }}
                                        ></span>
                                        <span
                                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></span>
                                        <span
                                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.4s" }}
                                        ></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {replyingTo && (
                        <div className="px-4 pt-2 bg-slate-800/30 border-t border-slate-700/50">
                            <div className="flex items-start gap-2 p-2 bg-slate-800/60 rounded-lg">
                                <LucideIcons.Reply className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-slate-400 font-medium">
                                        Replying to {replyingTo.sender === "user" ? replyingTo.username : "Support"}
                                    </p>
                                    {replyingTo.fileType === "image" && replyingTo.fileUrl && (
                                        <img
                                            src={replyingTo.fileUrl || "/placeholder.svg"}
                                            alt="Reply"
                                            className="w-12 h-12 rounded object-cover mt-1"
                                        />
                                    )}
                                    <p className="text-sm text-slate-200 line-clamp-2">{replyingTo.text || replyingTo.fileName}</p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setReplyingTo(null)}
                                    className="h-6 w-6 hover:bg-slate-700"
                                >
                                    <LucideIcons.X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t border-slate-800/50 bg-slate-800/30 flex gap-2">
                        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => imageInputRef.current?.click()}
                            disabled={isOptimizing}
                            className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                        >
                            {isOptimizing ? (
                                <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <LucideIcons.Image className="h-5 w-5" />
                            )}
                        </Button>

                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            <LucideIcons.Paperclip className="h-5 w-5" />
                        </Button>

                        <div className="flex-1 relative">
                            <textarea
                                value={messageText}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                placeholder={isOptimizing ? "Optimizing image..." : "Type your message..."}
                                disabled={isOptimizing}
                                className="w-full bg-[#3a4a3c] text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-500 rounded-3xl pr-14 pl-4 py-3 resize-none min-h-[50px] max-h-[150px] overflow-y-auto scrollbar-thin scrollbar-thumb-lime-500/50 scrollbar-track-[#2d3e2f]/30 disabled:opacity-50"
                                style={{ lineHeight: "1.5rem" }}
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={messageText.trim() === "" || isOptimizing}
                                size="icon"
                                className="absolute right-3 bottom-3 bg-lime-500 hover:bg-lime-600 text-[#2d3e2f] rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110"
                            >
                                <LucideIcons.Send className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="flex-1 bg-slate-900/60 border-slate-800/50 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                        <LucideIcons.MessageSquare className="h-16 w-16 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">No Chat Selected</h3>
                        <p>Select a user from the left to start chatting</p>
                    </div>
                </Card>
            )}

            <style jsx global>{`
        @keyframes highlight {
          0%,
          100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(34, 211, 238, 0.2);
          }
        }

        .highlight-message {
          animation: highlight 1s ease-in-out 2;
        }
      `}</style>
        </div>
    )
}
