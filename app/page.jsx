"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import * as LucideIcons from "lucide-react"
import { useRouter } from "next/navigation"
import Bottom from "@/app/Common/Bottom/Bottom"
import CS from "@/app/Common/CustomerService/CS"
import SupportChat from '@/app/Common/SupportChat/SupportChat'
import NotificationPopup from "@/app/Common/Notifications/NotificationPopup"
import { fetchAdminSettings, DEFAULT_SETTINGS } from "@/lib/admin-settings"

export default function HomePage() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [popupNotification, setPopupNotification] = useState(null)
  const router = useRouter()
  const [storedUser, setStoredUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      const parsed = JSON.parse(userData)
      setStoredUser(parsed)
      // Fresh copy from the backend, so new notifications appear without re-login.
      fetch(`https://platform-axon-rust.vercel.app/api/users/getUser/${parsed._id}`)
        .then((r) => r.json())
        .then((result) => {
          if (result?.user) {
            setStoredUser(result.user)
            localStorage.setItem("user", JSON.stringify(result.user))
          }
        })
        .catch(() => {})
    }
  }, [])

  // Unread = backend read flag. The bell dot shows ONLY when this is > 0.
  const unreadCount = (storedUser?.notifications || []).filter((n) => !n.read).length

  const markNotificationsRead = () => {
    if (!storedUser || unreadCount === 0) return
    const updated = {
      ...storedUser,
      notifications: (storedUser.notifications || []).map((n) => ({ ...n, read: true })),
    }
    setStoredUser(updated)
    localStorage.setItem("user", JSON.stringify(updated))
    fetch(`https://platform-axon-rust.vercel.app/api/users/markNotificationsRead/${storedUser._id}`, { method: "POST" }).catch(() => {})
  }

  const handleBellClick = () => {
    const opening = !showNotifications
    setShowNotifications(opening)
    if (opening) {
      setPopupNotification(null)
      markNotificationsRead()
    }
  }

  // First-time popup: the newest unread notification never shown before.
  // "Shown" is tracked separately from "read": dismissing the popup does
  // not clear the bell dot; only opening the dropdown does.
  useEffect(() => {
    if (!storedUser?.notifications?.length || showNotifications || popupNotification) return
    try {
      const shown = new Set(JSON.parse(localStorage.getItem("axon-shown-notification-ids") || "[]"))
      const fresh = [...storedUser.notifications].reverse().find((n) => !n.read && !shown.has(n._id || `${n.message}-${n.createdAt}`))
      if (!fresh) return
      const key = fresh._id || `${fresh.message}-${fresh.createdAt}`
      shown.add(key)
      localStorage.setItem("axon-shown-notification-ids", JSON.stringify([...shown]))
      const timer = setTimeout(() => setPopupNotification(fresh), 600)
      return () => clearTimeout(timer)
    } catch (e) { /* ignore */ }
  }, [storedUser, showNotifications, popupNotification])

  const navTabs = [
    { name: "Service", iconName: "Briefcase", href: "#", color: "from-lime-500 to-lime-600" },
    { name: "Event", iconName: "CalendarDays", href: "/event", color: "from-lime-500 to-lime-600" },
    { name: "Withdrawal", iconName: "Wallet", href: "/withdrawal", color: "from-lime-500 to-lime-600" },
    { name: "Deposit", iconName: "CreditCard", href: "/deposit", color: "from-lime-500 to-lime-600" },
    { name: "T & C", iconName: "FileText", href: "/terms-and-conditions", color: "from-lime-500 to-lime-600" },
    { name: "Certificate", iconName: "Award", href: "/certificate", color: "from-lime-500 to-lime-600" },
    // { name: "FAQs", target: "_blank", iconName: "HelpCircle", href: "https://faqaxon.netlify.app/", color: "from-lime-500 to-lime-600" },
    { name: "About", iconName: "Info", href: "/about", color: "from-lime-500 to-lime-600" },
  ]

  const defaultVipLevels = [
    {
      level: "VIP1",
      amount: "1000.00 USD",
      iconName: "Star",
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-gradient-to-br from-lime-900/20 to-lime-800/20",
    },
    {
      level: "VIP2",
      amount: "2000.00 USD",
      iconName: "Crown",
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-gradient-to-br from-lime-900/20 to-lime-800/20",
    },
    {
      level: "VIP3",
      amount: "3000.00 USD",
      iconName: "Gem",
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-gradient-to-br from-lime-900/20 to-lime-800/20",
    },
    {
      level: "VIP4",
      amount: "5000.00 USD",
      iconName: "Diamond",
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-gradient-to-br from-lime-900/20 to-lime-800/20",
    },
  ]

  const [vipLevels, setVipLevels] = useState(defaultVipLevels)
  const [brandName, setBrandName] = useState(DEFAULT_SETTINGS.brandName)
  const [workingHours, setWorkingHours] = useState(DEFAULT_SETTINGS.workingHours)
  useEffect(() => {
    fetchAdminSettings().then((s) => {
      if (s.brandName) setBrandName(s.brandName)
      if (s.workingHours) setWorkingHours(s.workingHours)
      const configured = (s.vipLevels || []).filter((v) => v.visible !== false)
      if (configured.length > 0) {
        setVipLevels(configured.map((v) => ({
          level: v.level,
          amount: v.amount || `${Number(v.depositRequired || 0).toLocaleString()}.00 USD`,
          iconName: v.iconName || "Star",
          color: "from-lime-500 to-lime-600",
          bgColor: "bg-gradient-to-br from-lime-900/20 to-lime-800/20",
        })))
      }
    })
  }, [])

  if (!storedUser) return null

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#2d3e2f]/95 border-b border-[#3d4e3f] shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-500 flex items-center justify-center shadow-lg">
                <LucideIcons.Zap className="h-6 w-6 text-[#2d3e2f]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">{brandName}</h1>
            </Link>

            <div className="flex items-center gap-3 relative">
              {/* 🔔 Notifications */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBellClick}
                title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "Notifications"}
                className="relative text-gray-300 hover:text-lime-400 transition-colors rounded-xl hover:bg-[#3d4e3f]"
              >
                <LucideIcons.Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-lime-500 rounded-full animate-pulse"></div>
                )}
              </Button>

              {/* 💬 Chat Icon */}
              <SupportChat
                userId={storedUser._id}
                username={storedUser.username}
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


              {/* 👤 Profile */}
              <Link
                href="/profile"
                className="text-gray-300 hover:text-lime-400 transition-colors rounded-xl hover:bg-[#3d4e3f] p-1"
                title="Profile"
              >
                {(storedUser.profile?.photoLink || (storedUser.profileimage && storedUser.profileimage !== "none" ? storedUser.profileimage : "")) ? (
                  <img src={storedUser.profile?.photoLink || storedUser.profileimage} alt={storedUser.username} className="w-8 h-8 rounded-full object-cover border border-lime-500/50" />
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
                    {storedUser.notifications.length > 0 ? (
                      <ul className="space-y-3">
                        {storedUser.notifications.map((notification, index) => {
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

        <main className="flex-1 overflow-auto pb-24">
          {/* Enhanced Hero Section */}
          <section className="relative w-full h-[400px] overflow-hidden bg-[#2d3e2f]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2d3e2f] via-[#3d4e3f] to-[#2d3e2f]"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-lime-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-lime-400/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="mb-6 p-5 rounded-full bg-lime-500 shadow-2xl">
                <LucideIcons.ArrowUpRight className="h-16 w-16 text-[#2d3e2f] rotate-45" />
              </div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Let's work
                <span className="block">together!</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mb-8">
                Discover seamless services, exclusive events, and unparalleled support in our premium platform.
              </p>
            </div>
          </section>

          {/* Enhanced Navigation Tabs */}
          <section className="w-full py-12 bg-[#3a4a3c]">
            <div className="max-w-7xl mx-auto px-4 md:px-6">
              <h2 className="text-3xl font-bold text-center mb-8 text-white">
                Premium <span className="text-lime-400">Dashboard</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {navTabs.map((tab) => {
  const IconComponent = LucideIcons[tab.iconName]

  const buttonContent = (
    <Button
      variant="ghost"
      className="group relative w-full h-32 p-0 overflow-hidden rounded-2xl bg-[#252f26] shadow-lg hover:shadow-2xl hover:shadow-lime-500/30 transition-all duration-300 transform hover:scale-105 border-2 border-[#3d4e3f] hover:border-lime-500/70 hover:bg-[#1f2820]"
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 p-4">
        <div
          className={`p-4 rounded-xl bg-gradient-to-r ${tab.color} shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
        >
          {IconComponent && <IconComponent className="h-7 w-7 text-[#2d3e2f]" />}
        </div>
        <span className="text-sm font-bold text-gray-200 group-hover:text-lime-400 transition-colors">
          {tab.name}
        </span>
      </div>
    </Button>
  )

  // Special case: "Service" tab opens a Dialog
  if (tab.name === "Service") {
    return (
      <div key={tab.name} className="w-full">
        <Dialog>
          <DialogTrigger asChild>{buttonContent}</DialogTrigger>
          <CS userId={storedUser._id} username={storedUser.username} />
        </Dialog>
      </div>
    )
  }

  // Special case: "FAQs" opens in a new tab
  if (tab.name === "FAQs") {
    return (
      <a
        key={tab.name}
        href={tab.href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full"
      >
        {buttonContent}
      </a>
    )
  }

  // All other tabs use Next.js Link
  return (
    <Link key={tab.name} href={tab.href} className="w-full">
      {buttonContent}
    </Link>
  )
})}
              </div>
            </div>
          </section>

          {/* Premium VIP Levels */}
          <section className="w-full py-16 bg-[#2d3e2f] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Exclusive VIP Levels</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Unlock premium benefits and exclusive rewards with our VIP membership tiers
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {vipLevels.map((vip, index) => {
                  const IconComponent = LucideIcons[vip.iconName]
                  return (
                    <Card
                      key={vip.level}
                      className="group relative p-6 text-center bg-[#3a4a3c] backdrop-blur-xl border border-[#4a5a4c] rounded-3xl hover:border-lime-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden shadow-lg"
                    >
                      {/* Rank Badge */}
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center text-[#2d3e2f] font-bold text-sm shadow-lg">
                        {index + 1}
                      </div>

                      <div className="relative z-10">
                        <div
                          className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${vip.color} shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                        >
                          {IconComponent && <IconComponent className="h-10 w-10 text-[#2d3e2f]" />}
                        </div>

                        <h3 className="text-3xl font-extrabold text-white mb-2 group-hover:text-lime-400 transition-colors">
                          {vip.level}
                        </h3>

                        <div className="mb-4">
                          <p className="text-2xl font-bold text-lime-400 mb-1">{vip.amount}</p>
                          <p className="text-gray-400 text-sm">Minimum Investment</p>
                        </div>

                        <div className="space-y-2 text-sm text-gray-300">
                          <div className="flex items-center justify-center gap-2">
                            <LucideIcons.Check className="h-4 w-4 text-lime-400" />
                            <span>Premium Support</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <LucideIcons.Check className="h-4 w-4 text-lime-400" />
                            <span>Exclusive Events</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <LucideIcons.Check className="h-4 w-4 text-lime-400" />
                            <span>Priority Processing</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-center mt-12">
                <Link href="/vip-levels">
                  <Button className="group bg-lime-500 hover:bg-lime-600 text-[#2d3e2f] font-bold px-8 py-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
                    View All VIP Benefits
                    <LucideIcons.Crown className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="w-full py-16 bg-[#3a4a3c]">
            <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
              <h2 className="text-3xl font-bold mb-4 text-white">Why Choose Us?</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience the future of digital services with our comprehensive platform designed for your success.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="p-6 rounded-2xl bg-[#2d3e2f] border border-[#3d4e3f] shadow-lg hover:shadow-xl hover:border-lime-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="w-16 h-16 bg-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LucideIcons.Shield className="h-8 w-8 text-[#2d3e2f]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Secure & Reliable</h3>
                  <p className="text-gray-300">Bank-level security with 99.9% uptime guarantee</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#2d3e2f] border border-[#3d4e3f] shadow-lg hover:shadow-xl hover:border-lime-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="w-16 h-16 bg-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LucideIcons.Zap className="h-8 w-8 text-[#2d3e2f]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
                  <p className="text-gray-300">Instant transactions and real-time processing</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#2d3e2f] border border-[#3d4e3f] shadow-lg hover:shadow-xl hover:border-lime-500/50 transition-all duration-300 transform hover:scale-105">
                  <div className="w-16 h-16 bg-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <LucideIcons.Users className="h-8 w-8 text-[#2d3e2f]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{workingHours?.enabled ? `${workingHours.startLabel} to ${workingHours.endLabel} EST` : "Available 24 Hours"}</h3>
                  <p className="text-gray-300">Round-the-clock customer support team</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        {/* Enhanced Fixed Badge */}
        <div className="fixed bottom-28 right-4 z-50">
          <Button className="group flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl bg-lime-500 hover:bg-lime-600 text-[#2d3e2f] transition-all duration-300 transform hover:scale-105 border-2 border-lime-400">
            <div className="w-8 h-8 rounded-full bg-[#2d3e2f]/30 flex items-center justify-center">
              <LucideIcons.UserCircle className="h-5 w-5 text-[#2d3e2f]" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium animate-shimmer">Welcome</p>
              <p className="font-bold text-sm animate-shimmer-username">{storedUser?.username || "User"}</p>
            </div>
            <LucideIcons.ChevronUp className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>

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
