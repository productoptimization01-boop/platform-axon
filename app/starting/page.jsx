"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import * as LucideIcons from "lucide-react"
import { useRouter } from "next/navigation"
import { useUsersContext } from "../AllContext/UsersContext"
import Optimization from "./Optimization/Index"
import Bottom from "@/app/Common/Bottom/Bottom"
import SupportChat from '@/app/Common/SupportChat/SupportChat'
import NotificationPopup from "@/app/Common/Notifications/NotificationPopup"
import { fetchAdminSettings, DEFAULT_SETTINGS, workingHoursText } from "@/lib/admin-settings"

export default function StartingPage() {
  const router = useRouter()
  const { user, setUser } = useUsersContext()
  const [popupNotification, setPopupNotification] = useState(null)

  const [userDetails, setUserDetails] = useState(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [todayProfit, setTodayProfit] = useState(0)
  const [profilePhotoLink, setProfilePhotoLink] = useState("")
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Unread = backend read flag. The bell dot shows ONLY when this is > 0.
  const unreadCount = (user?.notifications || []).filter((n) => !n.read).length

  const markNotificationsRead = () => {
    if (!user || unreadCount === 0) return
    const updated = { ...user, notifications: (user.notifications || []).map((n) => ({ ...n, read: true })) }
    setUser(updated)
    try { localStorage.setItem("user", JSON.stringify(updated)) } catch (e) {}
    fetch(`https://platform-axon-rust.vercel.app/api/users/markNotificationsRead/${user._id}`, { method: "POST" }).catch(() => {})
  }

  const handleBellClick = () => {
    const opening = !showNotifications
    setShowNotifications(opening)
    if (opening) {
      setPopupNotification(null)
      markNotificationsRead()
    }
  }

  // First-time popup: newest unread notification never shown before.
  // Shared "shown" list with Home, so it pops only once across pages.
  // Dismissing is NOT reading; only opening the dropdown clears the dot.
  useEffect(() => {
    if (!user?.notifications?.length || showNotifications || popupNotification) return
    try {
      const shown = new Set(JSON.parse(localStorage.getItem("axon-shown-notification-ids") || "[]"))
      const fresh = [...user.notifications].reverse().find((n) => !n.read && !shown.has(n._id || `${n.message}-${n.createdAt}`))
      if (!fresh) return
      const key = fresh._id || `${fresh.message}-${fresh.createdAt}`
      shown.add(key)
      localStorage.setItem("axon-shown-notification-ids", JSON.stringify([...shown]))
      const timer = setTimeout(() => setPopupNotification(fresh), 600)
      return () => clearTimeout(timer)
    } catch (e) { /* ignore */ }
  }, [user, showNotifications, popupNotification])
  const [workingHours, setWorkingHours] = useState(DEFAULT_SETTINGS.workingHours)
  useEffect(() => { fetchAdminSettings().then((s) => setWorkingHours(s.workingHours || DEFAULT_SETTINGS.workingHours)) }, [])

  const fileInputRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem("user")

    if (!stored) {
      router.push("/login")
      return
    }

    const parsed = JSON.parse(stored)
    setUserDetails(parsed)
    setWalletBalance(user?.walletBalance || 0)
    setProfilePhotoLink(parsed.profile?.photoLink || "")
  }, [router])

  if (!userDetails) return null

  const supportReps = [
    { name: "Support Representative 1", phone: "1234567890" },
    { name: "Support Representative 2", phone: "1234567891" },
    { name: "Support Representative 3", phone: "1234567892" },
  ]

  const notifications = [
    "🎉 Important update regarding service changes. Please check your inbox for details.",
    "🚀 NEW EVENT: Coming soon! Stay tuned for more information.",
    "💎 Don't miss out on our special VIP offers!",
  ]

  // Profile picture via Cloudinary (Req 8), same as the profile page:
  // upload through the backend and save only the Cloudinary URL.
  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const stored = localStorage.getItem("user")
      if (!stored) return
      const parsed = JSON.parse(stored)
      try {
        const response = await fetch("https://platform-axon-rust.vercel.app/api/users/uploadProfileImage/" + parsed._id, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Upload failed")
        parsed.profile = parsed.profile || {}
        parsed.profile.photoLink = result.photoLink
        localStorage.setItem("user", JSON.stringify(parsed))
        setProfilePhotoLink(result.photoLink)
      } catch (error) {
        alert(error.message || "Failed to upload profile picture. Ask an admin to configure Cloudinary in Admin Settings.")
      }
    }
    reader.readAsDataURL(file)
  }

  const frozenBalance =
    user?.walletBalance <= 0
      ? Math.abs(user?.totalBalance || 0) + Math.abs(user?.walletBalance || 0)
      : 0

  if (!user) return null

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#2d3e2f] via-[#3d4f3f] to-[#2d3e2f]">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#2d3e2f]/95 border-b border-[#a3d65c]/20 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] flex items-center justify-center shadow-lg">
                <LucideIcons.Zap className="h-6 w-6 text-[#2d3e2f]" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#a3d65c] to-[#b8e986] bg-clip-text text-transparent tracking-wide">
                Axon
              </h1>
            </Link>
            <div className="flex items-center gap-3 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBellClick}
                title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "Notifications"}
                className="relative text-white hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#3d4f3f]"
              >
                <LucideIcons.Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-[#a3d65c] to-[#b8e986] rounded-full animate-pulse"></div>
                )}
              </Button>


              <SupportChat
                userId={user._id}
                username={user.username}
                renderPanel={false}
                renderTrigger={({ unseenCount, openChat }) => (
                  <button
                    onClick={openChat}
                    className="relative text-gray-300 hover:text-lime-400 transition-colors rounded-xl hover:bg-[#3d4e3f] p-2"
                  >
                    <LucideIcons.MessageCircle className="h-6 w-6" />

                    {unseenCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {unseenCount}
                      </span>
                    )}
                  </button>
                )}
              />
              <Link
                href="/profile"
                className="text-white hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#3d4f3f] p-1"
                title="Profile"
              >
                {(profilePhotoLink || (user.profile?.photoLink && user.profile.photoLink !== "none" ? user.profile.photoLink : "") || (user.profileimage && user.profileimage !== "none" ? user.profileimage : "")) ? (
                  <img src={profilePhotoLink || user.profile?.photoLink || user.profileimage} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-[#a3d65c]/50" />
                ) : (
                  <LucideIcons.UserCircle className="h-6 w-6" />
                )}
              </Link>

              {/* 🔽 Notification Dropdown */}
              {showNotifications && (
                <Card className="absolute top-full right-0 mt-3 w-80 bg-[#3d4e3f]/95 backdrop-blur-xl border border-[#4d5e4f] shadow-2xl rounded-2xl z-50 overflow-hidden">
                  <div className="bg-lime-500 p-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#2d3e2f] flex items-center gap-2">
                      <LucideIcons.Bell className="h-5 w-5" />
                      Notifications
                    </h3>
                    <span className="text-xs font-bold text-[#2d3e2f]/70">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
                    </span>
                  </div>
                  <div className="p-4">
                    {user.notifications.length > 0 ? (
                      <ul className="space-y-3">
                        {user.notifications.map((notification, index) => {
                          // Optional: style based on notification type
                          let bgColor = "bg-[#2d3e2f]/50 border-[#3d4e3f]"; // default
                          let textColor = "text-gray-300";

                          switch (notification.type) {
                            case "success":
                              bgColor = "bg-green-600/20 border-green-500";
                              textColor = "text-green-400";
                              break;
                            case "warning":
                              bgColor = "bg-yellow-600/20 border-yellow-500";
                              textColor = "text-yellow-400";
                              break;
                            case "error":
                              bgColor = "bg-red-600/20 border-red-500";
                              textColor = "text-red-400";
                              break;
                            case "info":
                            default:
                              bgColor = "bg-[#2d3e2f]/50 border-[#3d4e3f]";
                              textColor = "text-gray-300";
                              break;
                          }

                          return (
                            <li
                              key={notification._id || index}
                              className={`text-sm p-3 rounded-xl ${bgColor} border hover:bg-[#2d3e2f] transition-all duration-200 ${textColor}`}
                            >
                              <p className="flex items-start gap-2">
                                {!notification.read && <span className="mt-1.5 w-2 h-2 bg-lime-400 rounded-full shrink-0" title="Unread" />}
                                <span className={!notification.read ? "font-semibold text-white" : ""}>{notification.message}</span>
                              </p>
                              <p className="text-xs opacity-50 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">
                        No new notifications.
                      </p>
                    )}

                  </div>
                </Card>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 pb-32 lg:pb-48">
          <div className="max-w-6xl mx-auto space-y-8">
            <Card className="relative p-6 lg:p-8 bg-[#3d4f3f] shadow-2xl border border-[#a3d65c]/30 rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a3d65c]/5 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#a3d65c]/10 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                  <div className="relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      aria-label="Upload profile picture"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="relative group w-28 h-28 rounded-3xl overflow-hidden border-4 border-[#a3d65c] shadow-2xl bg-gradient-to-br from-[#a3d65c] to-[#8bc34a] p-1 hover:shadow-3xl transition-shadow cursor-pointer"
                    >
                      {profilePhotoLink ? (
                        <div className="w-full h-full rounded-2xl overflow-hidden">
                          <Image
                            src={profilePhotoLink || "/placeholder.svg"}
                            alt="Profile Picture"
                            width={120}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#a3d65c] to-[#8bc34a] flex items-center justify-center">
                          <LucideIcons.User className="h-12 w-12 text-[#2d3e2f]" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-2xl">
                        <LucideIcons.Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>

                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full border-4 border-[#2d3e2f] flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">Hi, {user.username}</h2>
                    <div className="flex items-center gap-2 mb-3 px-3 py-1 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full">
                      <LucideIcons.Crown className="h-4 w-4 text-[#2d3e2f]" />
                      <span className="text-sm font-medium text-[#2d3e2f]">
                        VIP{user.currentVIPLevel.number} - {user.currentVIPLevel.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#2d3e2f] border border-[#a3d65c]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                        <LucideIcons.Wallet className="h-5 w-5 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-medium text-gray-400">Total Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-[#a3d65c]">{new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(user.totalBalance)}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#2d3e2f] border border-[#a3d65c]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                        <LucideIcons.PiggyBank className="h-5 w-5 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-medium text-gray-400">Wallet Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-[#a3d65c]">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(user.walletBalance)}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#2d3e2f] border border-[#a3d65c]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                        <LucideIcons.TrendingUp className="h-5 w-5 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-medium text-gray-400">Today's Profit</span>
                    </div>
                    <p className="text-2xl font-bold text-[#a3d65c]">${user.commissionTotal.toFixed(2)}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#2d3e2f] border border-[#a3d65c]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                        <LucideIcons.Lock className="h-5 w-5 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-medium text-gray-400">Frozen Balance</span>
                    </div>
                    <p className="text-2xl font-bold text-[#a3d65c]">{new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(frozenBalance)}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#2d3e2f] border border-[#a3d65c]/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                        <LucideIcons.DollarSign className="h-5 w-5 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-medium text-gray-400">Salary</span>
                    </div>
                    <p className="text-2xl font-bold text-[#a3d65c]">${user.salary}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Optimization user={user} />

            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogContent className="sm:max-w-[425px] bg-[#2d3e2f]/95 backdrop-blur-xl border border-[#a3d65c]/30 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#a3d65c]">Contact Support to Reset Tasks</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Congratulations! You have completed all 40 tasks. Please contact a support representative to reset
                    your tasks and continue earning.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {supportReps.map((rep, index) => (
                    <a key={index} href={`https://wa.me/${rep.phone}`} target="_blank" rel="noopener noreferrer">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:text-[#a3d65c] hover:bg-[#3d4f3f] rounded-xl p-4 transition-all duration-200"
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] mr-3">
                          <LucideIcons.MessageCircle className="h-4 w-4 text-[#2d3e2f]" />
                        </div>
                        {rep.name}
                      </Button>
                    </a>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Card className="p-6 bg-[#3d4f3f] shadow-xl border border-[#a3d65c]/30 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                  <LucideIcons.Info className="h-6 w-6 text-[#2d3e2f]" />
                </div>
                <h2 className="text-2xl font-bold text-white">Important Notice</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/20">
                  <div className="p-2 rounded-xl bg-[#a3d65c]/20">
                    <LucideIcons.Clock className="h-5 w-5 text-[#a3d65c]" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Online Support Hours</span>
                    <p className="text-gray-300">{workingHoursText(workingHours)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/20">
                  <div className="p-2 rounded-xl bg-[#a3d65c]/20">
                    <LucideIcons.MessageSquare className="h-5 w-5 text-[#a3d65c]" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Need Assistance?</span>
                    <p className="text-gray-300">Contact our online support team for help!</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </main>

        <Bottom />
      </div>
      {popupNotification && !showNotifications && (
        <NotificationPopup
          notification={popupNotification}
          unreadCount={unreadCount}
          onView={handleBellClick}
          onDismiss={() => setPopupNotification(null)}
        />
      )}
    </>
  )
}
