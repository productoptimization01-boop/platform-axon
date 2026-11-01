"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"
import { DashboardProvider, useDashboard } from "@/app/AllContext/DashboardContext"
import UsersManagement from "@/components/dashboard/users-management"
import ProductsManagement from "@/components/dashboard/products-management"
import WalletsManagement from "@/components/dashboard/wallets-management"
import LiveChat from "@/components/dashboard/live-chat"
import AdminSettings from "@/components/dashboard/admin-settings"
import RealtimeEvents from "@/components/dashboard/realtime-events"
import { fetchAdminSettings, DEFAULT_SETTINGS } from "@/lib/admin-settings"
import { useChatContext } from "@/app/AllContext/ChatContext"

function DashboardContent() {
  const { activeTab, setActiveTab } = useDashboard()
  const [showLogout, setShowLogout] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  useEffect(() => { try { if (localStorage.getItem("axon-sidebar-collapsed") === "1") setSidebarCollapsed(true) } catch (e) {} }, [])
  useEffect(() => { try { localStorage.setItem("axon-sidebar-collapsed", sidebarCollapsed ? "1" : "0") } catch (e) {} }, [sidebarCollapsed])
  const [brandName, setBrandName] = useState(DEFAULT_SETTINGS.brandName)
  const router = useRouter()
  useEffect(() => {
    fetchAdminSettings().then((s) => {
      if (s.brandName) setBrandName(s.brandName)
      // Req 10: once an admin password is set, the panel requires it.
      if (s.admin?.hasPassword && typeof window !== "undefined" && localStorage.getItem("admin-auth") !== "1") {
        router.push("/login")
      }
    })
  }, [router])
  // Count of users with pending messages (real-time)
  const [pendingUsersCount, setPendingUsersCount] = useState(0);

  // Count of users with pending messages
  const { messages, users } = useChatContext() // assuming your context provides users/messages

  // Audio ref for notification sound
  const audioRef = useRef(null)

  // Initialize audio ONLY once properly
  useEffect(() => {
    audioRef.current = new Audio("/notification-sound.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.3

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Play / pause sound based on pendingUsersCount
  useEffect(() => {
    if (!audioRef.current) return

    if (pendingUsersCount > 0) {
      audioRef.current.play().catch(err => {
        console.log("Audio play failed:", err)
      })
    } else {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [pendingUsersCount])

  useEffect(() => {
    if (users) {
      const count = users.filter(u => u.pendingMessages > 0).length;
      setPendingUsersCount(count);
    }
  }, [users]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("admin-auth")
    router.push("/login")
  }

  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}

  const sidebarItems = [
    { id: "users", label: "Users Management", icon: "Users", color: "from-blue-500 to-cyan-500" },
    { id: "products", label: "Products Management", icon: "Package", color: "from-purple-500 to-pink-500" },
    { id: "wallets", label: "Manage Wallets", icon: "Wallet", color: "from-green-500 to-emerald-500" },
    {
      id: "live-chat",
      label: "Live Chat",
      icon: "MessageSquare",
      color: "from-cyan-500 to-blue-500",
      badge: pendingUsersCount
    },
    { id: "settings", label: "Admin Settings", icon: "Settings", color: "from-amber-500 to-orange-500" },
    { id: "realtime", label: "Realtime Events", icon: "Activity", color: "from-cyan-500 to-teal-500" },

  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-800/50 shadow-lg">
        <div className="flex items-center justify-between p-4 md:p-6">
          <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-slate-800/60"
          >
            {sidebarCollapsed ? <LucideIcons.ChevronsRight className="h-5 w-5" /> : <LucideIcons.ChevronsLeft className="h-5 w-5" />}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <LucideIcons.LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
              {brandName} Admin Dashboard
            </h1>
          </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <img
                src={user.profileimage || "/placeholder.svg?height=32&width=32"}
                alt="profile"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-sm font-semibold text-slate-200">{user.username || "Admin"}</span>
            </div>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowLogout(!showLogout)}
                className="text-slate-300 hover:text-red-400 transition-colors rounded-xl hover:bg-red-950/20"
              >
                <LucideIcons.LogOut className="h-5 w-5" />
              </Button>

              {showLogout && (
                <Card className="absolute right-0 mt-2 p-3 bg-slate-800 shadow-lg rounded-xl border border-slate-700 w-48 z-50">
                  <p className="text-sm text-slate-300 mb-3">Sure you want to logout?</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowLogout(false)}
                      className="flex-1 bg-slate-700 text-slate-100 hover:bg-slate-600 rounded-lg"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLogout}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-lg"
                      size="sm"
                    >
                      Logout
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className={`hidden md:flex flex-col ${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 self-stretch bg-slate-900/60 backdrop-blur-xl border-r border-slate-800/50 shadow-lg overflow-y-auto transition-all duration-300`}>
          <div className="p-3 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-slate-800/60"
            >
              {sidebarCollapsed ? <LucideIcons.ChevronsRight className="h-5 w-5" /> : <LucideIcons.ChevronsLeft className="h-5 w-5" />}
            </Button>
          </div>
          <nav className={`${sidebarCollapsed ? "p-3" : "p-6"} pt-0 space-y-3`}>
            {sidebarItems.map((item) => {
              const IconComponent = LucideIcons[item.icon]
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center ${sidebarCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-xl transition-all duration-300 relative ${isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-100"
                    }`}
                >
                  {IconComponent && <IconComponent className="h-5 w-5 shrink-0" />}
                  {!sidebarCollapsed && <span className="font-semibold">{item.label}</span>}
                  {item.badge && item.badge > 0 && (
                    sidebarCollapsed
                      ? <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900" title={`${item.badge} new`} />
                      : <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5">{item.badge}</Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="md:hidden fixed top-20 left-0 right-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 px-4 py-3 flex gap-2 overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all ${activeTab === item.id
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
            >
              {item.label}
              {item.badge && item.badge > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto pt-4 md:pt-0">
          <div className="md:p-8 p-4 md:mt-0 mt-16">
            {activeTab === "users" && <UsersManagement />}
            {activeTab === "products" && <ProductsManagement />}
            {activeTab === "wallets" && <WalletsManagement />}
            {activeTab === "live-chat" && <LiveChat />}
            {activeTab === "settings" && <AdminSettings />}
            {activeTab === "realtime" && <RealtimeEvents />}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}
