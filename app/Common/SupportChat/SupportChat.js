"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"
import { useLiveSupportContext } from "@/app/AllContext/ChatContext"
import { optimizeImage, validateImageFile, getBase64Size } from "@/lib/image-optimizer"

export default function Chatting({ userId, username, renderTrigger, renderPanel = true }) {
    const [portalMounted, setPortalMounted] = useState(false)
    useEffect(() => { setPortalMounted(true) }, [])
    const [replyingTo, setReplyingTo] = useState(null)
    const [hoveredMessageId, setHoveredMessageId] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [lightboxImage, setLightboxImage] = useState(null)
    const [inputText, setInputText] = useState("")
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [pendingImage, setPendingImage] = useState(null)
    const [isNearBottom, setIsNearBottom] = useState(true)
    const [hasNewMessageBelow, setHasNewMessageBelow] = useState(false)
    const [unseenCount, setUnseenCount] = useState(0)
    const textareaRef = useRef(null)

    const fileInputRef = useRef(null)
    const imageInputRef = useRef(null)
    const messagesEndRef = useRef(null)
    const chatContainerRef = useRef(null)
    const messageRefs = useRef({})
    const typingTimeoutRef = useRef(null)

    const [filteredMessages, setFilteredMessages] = useState([])

    const {
        messages,
        sendMessage,
        fetchChatHistory,
        connectSSE,
        isConnected,
        markMessagesAsRead,
        typingStatus,
        sendTypingStatus,
        isChatOpen,
        setIsChatOpen,
    } = useLiveSupportContext()

    useEffect(() => {
        if (isChatOpen) {
            setIsMinimized(false)
            if (textareaRef.current) textareaRef.current.focus()
        }
    }, [isChatOpen])

    // Escape closes the chat, like every professional chat widget.
    useEffect(() => {
        if (!isChatOpen) return
        const onKey = (e) => { if (e.key === "Escape") setIsChatOpen(false) }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [isChatOpen, setIsChatOpen])

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Don't interfere if user is already typing in an input/textarea
            if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
                return
            }

            // Only typeable keys
            if (e.key.length === 1 || e.key === "Backspace" || e.key === "Enter") {
                if (textareaRef.current && isChatOpen) {
                    textareaRef.current.focus()
                }
            }
        }

        if (isChatOpen) {
            window.addEventListener("keydown", handleGlobalKeyDown)
        }
        return () => window.removeEventListener("keydown", handleGlobalKeyDown)
    }, [isChatOpen])

    useEffect(() => {
        if (!isChatOpen) {
            // Count only new messages from support
            const newUnseen = messages.filter((msg) => msg.sender === "support" && !msg.read).length
            setUnseenCount(newUnseen)
        } else {
            // Chat is open → mark all support messages as read
            const unreadSupportMessages = messages.filter((msg) => msg.sender === "support" && !msg.read).map((msg) => msg.id)
            if (unreadSupportMessages.length > 0) {
                markMessagesAsRead(unreadSupportMessages)
            }
            setUnseenCount(0)
        }
    }, [messages, isChatOpen])


    useEffect(() => {
        if (userId) {
            connectSSE(userId)
            fetchChatHistory(userId)
        }
    }, [userId])

    useEffect(() => {
        if (!userId) return
        const filtered = messages.filter((msg) => msg.userId === userId)
        setFilteredMessages(filtered)
    }, [messages, userId])

    const handleChatScroll = () => {
        const el = chatContainerRef.current
        if (!el) return
        const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120
        setIsNearBottom(near)
        if (near) setHasNewMessageBelow(false)
    }
    useEffect(() => {
        if (!isChatOpen) return
        if (isNearBottom && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        } else if (filteredMessages.length) {
            setHasNewMessageBelow(true)
        }
    }, [messages, isChatOpen])

    useEffect(() => {
        if (isChatOpen) {
            const unreadSupportMessages = messages.filter((msg) => msg.sender === "support" && !msg.read).map((msg) => msg.id)

            if (unreadSupportMessages.length > 0) {
                setTimeout(() => {
                    markMessagesAsRead(unreadSupportMessages)
                }, 500)
            }
        }
    }, [isChatOpen])

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

    const handleReply = (message) => setReplyingTo(message)
    const cancelReply = () => setReplyingTo(null)

    const getReplyMessage = (replyToId) => messages.find((msg) => msg.id === replyToId)

    const handleInputChange = (e) => {
        setInputText(e.target.value)

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        sendTypingStatus(userId, username, "user", true)

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(userId, username, "user", false)
        }, 2000)
    }

    const handleSendMessage = async () => {
        if (inputText.trim() === "" && !pendingImage) return

        sendTypingStatus(userId, username, "user", false)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

        if (pendingImage) {
            await sendMessage({
                userId,
                username,
                sender: "user",
                text: inputText,
                fileUrl: pendingImage.dataUrl,
                fileType: "image",
                fileName: pendingImage.name,
                replyTo: replyingTo ? replyingTo.id : null,
            })
            setPendingImage(null)
        } else {
            await sendMessage({
                userId,
                username,
                sender: "user",
                text: inputText,
                replyTo: replyingTo ? replyingTo.id : null,
            })
        }
        setInputText("")
        setReplyingTo(null)
        if (textareaRef.current) textareaRef.current.style.height = "auto"
    }

    // Clipboard paste: an image copied to the clipboard (e.g. screenshot,
    // copied photo) loads into the message field as a preview when pasted
    // into the composer, instead of being ignored. The user then presses
    // Send to send it, optionally with a caption typed in the field.
    const handlePaste = async (e) => {
        const items = e.clipboardData?.items
        if (!items) return
        for (const item of items) {
            if (item.type && item.type.startsWith("image/")) {
                e.preventDefault()
                const file = item.getAsFile()
                if (!file) return
                const validation = validateImageFile(file)
                if (!validation.valid) { alert(validation.error); return }
                setIsOptimizing(true)
                try {
                    const optimizedDataUrl = await optimizeImage(file, { maxWidth: 1920, maxHeight: 1080, quality: 0.75, format: "webp" })
                    setPendingImage({ dataUrl: optimizedDataUrl, name: "pasted-image.webp" })
                    if (textareaRef.current) textareaRef.current.focus()
                } catch (err) {
                    alert("Failed to load pasted image. Please try again.")
                } finally {
                    setIsOptimizing(false)
                }
                return
            }
        }
    }

    const handleTextareaInput = (e) => {
        handleInputChange(e)
        const el = textareaRef.current
        if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 150) + "px" }
    }

    const handleImageUpload = async (file) => {
        if (!file) return

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
            const newMsg = {
                userId,
                username,
                sender: "user",
                text: "",
                fileUrl: optimizedDataUrl,
                fileType: "image",
                fileName: file.name.replace(/\.[^/.]+$/, ".webp"),
                replyTo: replyingTo ? replyingTo.id : null,
            }

            await sendMessage(newMsg)
            setReplyingTo(null)
        } catch (error) {
            alert("Failed to optimize image. Please try again.")
        } finally {
            setIsOptimizing(false)
            if (imageInputRef.current) {
                imageInputRef.current.value = ""
            }
        }
    }

    const handleFileUpload = (event, type) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (type === "image") {
            handleImageUpload(file)
        } else {
            const reader = new FileReader()
            reader.onload = async (e) => {
                const newMsg = {
                    userId,
                    username,
                    sender: "user",
                    text: file.name,
                    fileUrl: e.target.result,
                    fileType: "file",
                    fileName: file.name,
                    replyTo: replyingTo ? replyingTo.id : null,
                }
                await sendMessage(newMsg)
                setReplyingTo(null)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = async (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (!file) return

        const isImage = file.type.startsWith("image/")

        if (isImage) {
            await handleImageUpload(file)
        } else {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const newMsg = {
                    userId,
                    username,
                    sender: "user",
                    text: file.name,
                    fileUrl: event.target.result,
                    fileType: "file",
                    fileName: file.name,
                }
                await sendMessage(newMsg)
            }
            reader.readAsDataURL(file)
        }
    }

    const formatTime = (timestamp) =>
        new Date(timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })

    const formatDate = (timestamp) => {
        const date = new Date(timestamp)
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(today.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return "Today"
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    return (
        <>
            {!isChatOpen && renderTrigger && renderTrigger({
                unseenCount,
                openChat: () => setIsChatOpen(true)
            })}

            {isChatOpen && renderPanel && portalMounted && createPortal((
                <div className={`fixed inset-0 z-[9998] md:inset-auto md:bottom-6 md:right-6 md:w-[420px] ${isMinimized ? "md:h-auto" : "md:h-[620px] md:max-h-[85vh]"} flex md:block animate-in fade-in duration-200`}>
                    {/* Mobile backdrop: tap outside to close. Desktop: floating panel, page stays usable. */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsChatOpen(false)} />
                    <Card className="relative w-full h-full bg-[#2d3e2f] border-none md:rounded-3xl md:border md:border-lime-500/20 shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-lime-500 to-lime-600 border-b border-lime-400/30">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-[#2d3e2f] flex items-center justify-center shadow-lg">
                                        <LucideIcons.Headphones className="h-6 w-6 text-lime-400" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-lime-500"></div>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#2d3e2f]">Support Chat</h2>
                                    <p className="text-sm text-[#2d3e2f]/80 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        {isConnected ? "Online - We're here to help" : "Connecting..."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMinimized((v) => !v)}
                                    title={isMinimized ? "Restore chat" : "Minimize chat"}
                                    className="text-[#2d3e2f] hover:bg-[#2d3e2f]/10 rounded-full transition-colors"
                                >
                                    <LucideIcons.Minus className="h-6 w-6" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsChatOpen(false)}
                                    className="text-[#2d3e2f] hover:bg-[#2d3e2f]/10 rounded-full transition-colors"
                                >
                                    <LucideIcons.X className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                        {!isMinimized && (
                        <>
                        {/* Messages Area */}
                        <div
                            ref={chatContainerRef}
                            onScroll={handleChatScroll}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "flex-1 overflow-y-auto px-4 py-6 space-y-4",
                                isDragging && "bg-lime-500/10 border-2 border-dashed border-lime-500",
                            )}
                        >
                            {isDragging && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#2d3e2f]/90 z-10 pointer-events-none">
                                    <div className="text-center">
                                        <LucideIcons.Upload className="h-16 w-16 text-lime-400 mx-auto mb-4 animate-bounce" />
                                        <p className="text-xl font-bold text-lime-400">Drop your file here</p>
                                        <p className="text-gray-400">Images will be optimized automatically</p>
                                    </div>
                                </div>
                            )}

                            {isOptimizing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#2d3e2f]/90 z-20">
                                    <div className="text-center">
                                        <LucideIcons.Loader2 className="h-16 w-16 text-lime-400 mx-auto mb-4 animate-spin" />
                                        <p className="text-xl font-bold text-lime-400">Optimizing image...</p>
                                        <p className="text-gray-400">This won't take long</p>
                                    </div>
                                </div>
                            )}

                            {filteredMessages.length === 0 && !isOptimizing && (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                                    <div className="w-16 h-16 rounded-full bg-lime-500/20 flex items-center justify-center mb-4">
                                        <LucideIcons.Headphones className="h-8 w-8 text-lime-400" />
                                    </div>
                                    <p className="text-white font-bold text-lg">How can we help?</p>
                                    <p className="text-gray-400 text-sm mt-2 max-w-[260px]">Send a message below. You can also paste a screenshot or photo directly into the message field.</p>
                                </div>
                            )}
                            {hasNewMessageBelow && (
                                <div className="sticky bottom-2 z-10 flex justify-center">
                                    <button onClick={() => { setHasNewMessageBelow(false); messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }) }} className="bg-lime-500 text-[#2d3e2f] text-xs font-bold px-4 py-2 rounded-full shadow-lg">↓ New messages</button>
                                </div>
                            )}
                            {filteredMessages.map((message, index) => {
                                const showDate =
                                    index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp)
                                const replyMessage = message.replyTo ? getReplyMessage(message.replyTo) : null

                                return (
                                    <div key={message.id}>
                                        {showDate && (
                                            <div className="flex justify-center my-4">
                                                <span className="bg-[#2d3e2f]/80 text-gray-300 text-xs px-4 py-1.5 rounded-full font-medium">
                                                    {formatDate(message.timestamp)}
                                                </span>
                                            </div>
                                        )}

                                        <div
                                            ref={(el) => (messageRefs.current[message.id] = el)}
                                            className={cn(
                                                "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all",
                                                message.sender === "user" ? "justify-end" : "justify-start",
                                            )}
                                            onMouseEnter={() => setHoveredMessageId(message.id)}
                                            onMouseLeave={() => setHoveredMessageId(null)}
                                        >
                                            {message.sender === "support" && (
                                                <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                    <LucideIcons.Bot className="h-5 w-5 text-[#2d3e2f]" />
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-1 max-w-[70%]">
                                                {replyMessage && (
                                                    <div
                                                        onClick={() => scrollToMessage(message.replyTo)}
                                                        className={cn(
                                                            "text-xs p-2 rounded-lg border-l-2 cursor-pointer hover:bg-[#2d3e2f]/60 transition-colors ml-2",
                                                            message.sender === "user"
                                                                ? "bg-[#2d3e2f]/40 border-lime-400"
                                                                : "bg-[#2d3e2f]/40 border-gray-500",
                                                        )}
                                                    >
                                                        <p className="text-gray-400 font-medium mb-1">
                                                            Replying to {replyMessage.sender === "user" ? "You" : "Support"}
                                                        </p>
                                                        {replyMessage.fileType === "image" && replyMessage.fileUrl && (
                                                            <img
                                                                src={replyMessage.fileUrl || "/placeholder.svg"}
                                                                alt="Reply preview"
                                                                className="w-12 h-12 rounded object-cover mb-1"
                                                            />
                                                        )}
                                                        <p className="text-gray-300 line-clamp-2">
                                                            {replyMessage.text || replyMessage.fileName || "Image"}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="relative group">
                                                    <div
                                                        className={cn(
                                                            "rounded-2xl p-4 shadow-lg transition-all duration-200",
                                                            message.sender === "user"
                                                                ? "bg-lime-500 text-[#2d3e2f] rounded-br-md"
                                                                : "bg-[#2d3e2f] text-gray-200 rounded-bl-md border border-[#3d4e3f]",
                                                        )}
                                                    >
                                                        {message.fileType === "image" && (
                                                            <div className="mb-2 cursor-pointer" onClick={() => setLightboxImage(message.fileUrl)}>
                                                                <img
                                                                    src={message.fileUrl || "/placeholder.svg"}
                                                                    alt="Uploaded"
                                                                    className="rounded-xl max-w-full h-auto max-h-64 object-cover shadow-md hover:opacity-90 transition-opacity"
                                                                />
                                                            </div>
                                                        )}

                                                        {message.fileType === "file" && (
                                                            <div
                                                                className={cn(
                                                                    "flex items-center gap-3 p-3 rounded-lg mb-2",
                                                                    message.sender === "user" ? "bg-[#2d3e2f]/20" : "bg-[#3a4a3c]",
                                                                )}
                                                            >
                                                                <LucideIcons.FileText className="h-8 w-8 text-lime-400" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium truncate">{message.fileName}</p>
                                                                    <p className="text-xs opacity-70">Click to download</p>
                                                                </div>
                                                                <LucideIcons.Download className="h-5 w-5 opacity-70" />
                                                            </div>
                                                        )}

                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                                                        <div className="flex items-center justify-between mt-2 gap-2">
                                                            <p
                                                                className={cn(
                                                                    "text-xs opacity-70",
                                                                    message.sender === "user" ? "text-[#2d3e2f]" : "text-gray-400",
                                                                )}
                                                            >
                                                                {formatTime(message.timestamp)}
                                                            </p>

                                                            {message.sender === "user" && (
                                                                <div className="flex items-center gap-1">
                                                                    {message.read ? (
                                                                        <LucideIcons.CheckCheck className="w-4 h-4 text-blue-400" />
                                                                    ) : (
                                                                        <LucideIcons.Check className="w-4 h-4 text-[#2d3e2f]/50" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {hoveredMessageId === message.id && (
                                                        <Button
                                                            onClick={() => handleReply(message)}
                                                            size="icon"
                                                            variant="ghost"
                                                            className={cn(
                                                                "absolute top-0 h-8 w-8 rounded-full bg-[#2d3e2f] hover:bg-[#3a4a3c] border border-lime-500/30 shadow-lg animate-in fade-in zoom-in duration-150",
                                                                message.sender === "user" ? "-left-10" : "-right-10",
                                                            )}
                                                        >
                                                            <LucideIcons.Reply className="h-4 w-4 text-lime-400" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {message.sender === "user" && (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                                    <span className="text-[#2d3e2f] font-bold text-sm">{username.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            {typingStatus[userId] && typingStatus[userId].sender === "support" && (
                                <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <LucideIcons.Bot className="h-5 w-5 text-[#2d3e2f]" />
                                    </div>
                                    <div className="bg-[#2d3e2f] px-4 py-3 rounded-2xl shadow-lg">
                                        <div className="flex gap-1">
                                            <span
                                                className="w-2 h-2 bg-lime-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "0s" }}
                                            ></span>
                                            <span
                                                className="w-2 h-2 bg-lime-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.2s" }}
                                            ></span>
                                            <span
                                                className="w-2 h-2 bg-lime-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.4s" }}
                                            ></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#2d3e2f] border-t border-[#3d4e3f]">
                            {pendingImage && (
                                <div className="mb-3 p-2 bg-[#3a4a3c] rounded-xl flex items-center gap-3">
                                    <img src={pendingImage.dataUrl} alt="Pasted image preview" className="w-16 h-16 rounded-lg object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-200 font-medium">Pasted image ready to send</p>
                                        <p className="text-xs text-gray-400">Add a caption if you like, then press Send.</p>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => setPendingImage(null)} className="h-8 w-8 text-gray-400 hover:text-lime-400 flex-shrink-0">
                                        <LucideIcons.X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            {replyingTo && (
                                <div className="mb-3 p-3 bg-[#3a4a3c] rounded-lg border-l-2 border-lime-400 flex justify-between items-center">
                                    <div className="flex items-start gap-2 flex-1 min-w-0">
                                        <LucideIcons.Reply className="h-4 w-4 text-lime-400 mt-1 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 mb-1">
                                                Replying to {replyingTo.sender === "user" ? "You" : "Support"}
                                            </p>
                                            {replyingTo.fileType === "image" && replyingTo.fileUrl && (
                                                <img
                                                    src={replyingTo.fileUrl || "/placeholder.svg"}
                                                    alt="Reply"
                                                    className="w-12 h-12 rounded object-cover mb-1"
                                                />
                                            )}
                                            <p className="text-sm text-gray-200 line-clamp-1">{replyingTo.text || replyingTo.fileName}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={cancelReply}
                                        className="h-8 w-8 text-gray-400 hover:text-lime-400 flex-shrink-0"
                                    >
                                        <LucideIcons.X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <div className="flex flex-row gap-2 w-full items-end">
                                {/* Hidden Inputs */}
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, "image")}
                                />

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, "file")}
                                />

                                {/* Upload Buttons */}
                                <div className="flex gap-2 shrink-0">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => imageInputRef.current?.click()}
                                        disabled={isOptimizing}
                                        className="bg-[#3a4a3c] hover:bg-[#3d4e3f] text-lime-400 disabled:opacity-50"
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
                                        disabled={isOptimizing}
                                        className="bg-[#3a4a3c] hover:bg-[#3d4e3f] text-lime-400 disabled:opacity-50"
                                    >
                                        <LucideIcons.Paperclip className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Textarea */}
                                <div className="flex-1 relative w-full">
                                    <textarea
                                        ref={textareaRef}
                                        value={inputText}
                                        onChange={handleTextareaInput}
                                        onPaste={handlePaste}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage()
                                            }
                                        }}
                                        placeholder={isOptimizing ? "Optimizing image..." : "Type your message..."}
                                        disabled={isOptimizing}
                                        style={{ lineHeight: "1.5rem" }}
                                        className="w-full bg-[#3a4a3c] text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-lime-500 rounded-3xl pr-14 pl-4 py-3 resize-none min-h-[50px] max-h-[150px] overflow-y-auto disabled:opacity-50"
                                    />
                                    {/* Send button inside textarea */}
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={(inputText.trim() === "" && !pendingImage) || isOptimizing}
                                        size="icon"
                                        className="absolute right-2 bottom-2 h-8 w-8 bg-lime-500 hover:bg-lime-600 text-[#2d3e2f] disabled:bg-gray-600 disabled:text-gray-400 rounded-full shadow-lg transition-all duration-200"
                                    >
                                        <LucideIcons.Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                        </div>
                        </>
                        )}
                        {isMinimized && (
                            <div className="p-4 text-center">
                                <button onClick={() => setIsMinimized(false)} className="text-lime-400 font-semibold hover:underline">Chat minimized — click to restore</button>
                            </div>
                        )}
                    </Card>
                </div>
            ), document.body)}

            {/* Lightbox for images */}
            {lightboxImage && renderPanel && portalMounted && createPortal((
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setLightboxImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setLightboxImage(null)}
                            className="absolute -top-12 right-0 text-white hover:bg-white/10"
                        >
                            <LucideIcons.X className="h-6 w-6" />
                        </Button>
                        <img
                            src={lightboxImage || "/placeholder.svg"}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                    </div>
                </div>
            ), document.body)}

            <style jsx global>{`
        @keyframes highlight {
          0%,
          100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(163, 230, 53, 0.2);
          }
        }

        .highlight-message {
          animation: highlight 1s ease-in-out 2;
        }
      `}</style>
        </>
    )
}
