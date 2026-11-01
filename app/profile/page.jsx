"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useUsersContext } from "../AllContext/UsersContext"
import { useRouter } from "next/navigation"
import Bottom from "@/app/Common/Bottom/Bottom"
import CS from "@/app/Common/CustomerService/CS"

export default function ProfilePage() {
  const { logout } = useUsersContext()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [storedUser, setStoredUser] = useState(null)
  const [profilePhotoLink, setProfilePhotoLink] = useState("")
  const [loggingout, setLoggingout] = useState(false)
  const [user, setUser] = useState({
    name: null,
    invitationCode: null,
    vipLevel: null,
    vipTier: null,
    walletAmount: null,
    commission: null,
    joinDate: null,
    creditScore: null,
    notifications: null,
  })

  useEffect(() => {
    const userFromStorage = localStorage.getItem("user")
    setStoredUser(userFromStorage)

    if (userFromStorage) {
      const userData = JSON.parse(userFromStorage)

      const joinDate = new Date(userData.createdAt).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })

      setUser({
        userId: userData._id,
        name: userData.username,
        invitationCode: userData.myinviteCode,
        vipLevel: "VIP " + userData.currentVIPLevel?.number,
        vipTier: userData.currentVIPLevel?.name,
        walletAmount: userData.walletBalance,
        commission: userData.commissionTotal,
        joinDate: joinDate,
        creditScore: userData.creditScore,
        notifications: userData.notifications
      })

      setProfilePhotoLink(userData.profile?.photoLink || "")
    } else {
      router.push("/login")
    }
  }, [router])

  // Profile picture via Cloudinary (Req 8): the file is uploaded to
  // Cloudinary through the backend, and only the returned URL is saved
  // on the user. It is therefore visible from any browser/device and
  // in the admin panel, not just the browser where it was set.
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !storedUser) return
    const userData = JSON.parse(storedUser)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const response = await fetch("https://platform-axon-rust.vercel.app/api/users/uploadProfileImage/" + userData._id, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Upload failed")
        userData.profile = userData.profile || {}
        userData.profile.photoLink = result.photoLink
        localStorage.setItem("user", JSON.stringify(userData))
        setProfilePhotoLink(result.photoLink)
      } catch (error) {
        alert(error.message || "Failed to upload profile picture. Ask an admin to configure Cloudinary in Admin Settings.")
      }
    }
    reader.readAsDataURL(file)
  }

  const financialFeatures = [
    {
      name: "Deposit",
      iconName: "ArrowUpCircle",
      href: "/deposit",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#a3d65c]/20 to-[#8bc34a]/20",
    },
    {
      name: "Withdraw",
      iconName: "ArrowDownCircle",
      href: "/withdrawal",
      color: "from-[#7cb342] to-[#689f38]",
      bgColor: "from-[#7cb342]/20 to-[#689f38]/20",
    },
  ]

  const myDetails = [
    {
      name: "Personal Information",
      iconName: "User",
      href: "/personal-information",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#a3d65c]/20 to-[#8bc34a]/20",
    },
    {
      name: "Payment Method",
      iconName: "CreditCard",
      href: "/payment-method",
      color: "from-[#7cb342] to-[#689f38]",
      bgColor: "from-[#7cb342]/20 to-[#689f38]/20",
    },
  ]

  const otherSections = [
    {
      name: "Contact Us",
      iconName: "Mail",
      href: "#",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#a3d65c]/20 to-[#8bc34a]/20",
      action: "contact",
    },
    {
      name: "Notifications",
      iconName: "Bell",
      href: "#",
      color: "from-[#7cb342] to-[#689f38]",
      bgColor: "from-[#7cb342]/20 to-[#689f38]/20",
      action: "notifications",
    },
  ]

  const [showNotifications, setShowNotifications] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)

  const notifications = [
    "🎉 Important update regarding service changes. Please check your inbox for details.",
    "🚀 NEW EVENT: Coming soon! Stay tuned for more information.",
    "💎 Don't miss out on our special VIP offers!",
  ]

  const handleLogout = () => {
    setLoggingout(true)
    logout()
  }

  if (!storedUser) return null

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#3a4d3c]/80 border-b border-[#a3d65c]/20 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-gray-300 hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#a3d65c]/10 p-2"
            >
              <LucideIcons.ChevronLeft className="h-6 w-6" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <div className="w-16" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 pb-32 lg:pb-48">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="relative p-8 bg-[#3a4d3c]/80 shadow-2xl border border-[#a3d65c]/20 rounded-3xl overflow-hidden backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-[#a3d65c]/5 to-[#7cb342]/5"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#a3d65c]/10 to-[#7cb342]/10 rounded-full blur-2xl"></div>

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
                      className="relative group w-28 h-28 rounded-3xl overflow-hidden border-4 border-[#a3d65c] shadow-2xl bg-gradient-to-br from-[#a3d65c] to-[#7cb342] p-1 hover:shadow-3xl transition-shadow cursor-pointer"
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
                        <div className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#a3d65c] to-[#7cb342] flex items-center justify-center">
                          <LucideIcons.User className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center rounded-2xl">
                        <LucideIcons.Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>

                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full border-4 border-[#3a4d3c] flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <h2 className="text-4xl font-bold text-white mb-3">{user.name}</h2>

                    {/* VIP Status - More prominent position */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full shadow-lg">
                        <LucideIcons.Crown className="h-5 w-5 text-[#2d3e2f]" />
                        <span className="font-bold text-[#2d3e2f]">{user.vipLevel}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-200">{user.vipTier}</span>
                    </div>

                    {/* Member Since */}
                    <p className="text-sm text-gray-400 mb-3">Member since {user.joinDate}</p>

                    {/* Invitation Code - Now at bottom as utility info */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#a3d65c]/20 rounded-full border border-[#a3d65c]/30">
                      <LucideIcons.Hash className="h-4 w-4 text-[#a3d65c]" />
                      <span className="text-sm font-medium text-gray-200">{user.invitationCode}</span>
                    </div>
                  </div>
                </div>

                {/* Credit Score */}
                <div className="w-full mb-8">
                  {/* Labels */}
                  <div className="relative mb-2 h-5">
                    {/* Current Score (moves with bar) */}
                    <span
                      className="absolute text-sm font-bold text-[#a3d65c] transition-all duration-500"
                      style={{ left: `calc(${user.creditScore}% - 20px)` }}
                    >
                      {user.creditScore}%
                    </span>

                    {/* Max Score */}
                    <span className="absolute right-0 text-sm font-medium text-gray-400">{/* 100% */}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-[#2d3e2f] rounded-full overflow-hidden border border-[#a3d65c]/20">
                    <div
                      className="h-full bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full transition-all duration-500"
                      style={{ width: `${user.creditScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3a4d3c] to-[#2d3e2f] border-2 border-[#a3d65c]/30 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] shadow-lg">
                        <LucideIcons.Wallet className="h-6 w-6 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-semibold text-gray-300">Wallet Balance</span>
                    </div>
                    <p className="text-4xl font-extrabold text-[#a3d65c] drop-shadow-lg">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(user.walletAmount)}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3a4d3c] to-[#2d3e2f] border-2 border-[#a3d65c]/30 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#7cb342] to-[#689f38] shadow-lg">
                        <LucideIcons.TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-300">Commission</span>
                    </div>
                    <p className="text-4xl font-extrabold text-[#a3d65c] drop-shadow-lg">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(user.commission)}
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3a4d3c] to-[#2d3e2f] border-2 border-[#a3d65c]/30 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] shadow-lg">
                        <LucideIcons.DollarSign className="h-6 w-6 text-[#2d3e2f]" />
                      </div>
                      <span className="text-sm font-semibold text-gray-300">Salary</span>
                    </div>
                    <p className="text-4xl font-extrabold text-[#a3d65c] drop-shadow-lg">
                      ${user.salary?.toFixed(2) || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[#3a4d3c]/80 backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                  <LucideIcons.Banknote className="h-6 w-6 text-[#2d3e2f]" />
                </div>
                <h3 className="text-2xl font-bold text-white">My Financial</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {financialFeatures.map((feature) => {
                  const IconComponent = LucideIcons[feature.iconName]
                  return (
                    <Link key={feature.name} href={feature.href} className="w-full">
                      <Button
                        variant="ghost"
                        className="group relative w-full h-20 p-0 overflow-hidden rounded-2xl bg-[#3a4d3c]/50 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#a3d65c]/20 hover:border-[#a3d65c]/40 hover:bg-[#3a4d3c]/70"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-30 group-hover:opacity-40 transition-opacity`}
                        ></div>
                        <div className="relative z-10 flex items-center justify-between w-full px-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}>
                              {IconComponent && <IconComponent className="h-6 w-6 text-[#2d3e2f]" />}
                            </div>
                            <span className="text-lg font-bold text-white group-hover:text-[#a3d65c] transition-colors">
                              {feature.name}
                            </span>
                          </div>
                          <LucideIcons.ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-[#a3d65c] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6 bg-[#3a4d3c]/80 backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                  <LucideIcons.Settings className="h-6 w-6 text-[#2d3e2f]" />
                </div>
                <h3 className="text-2xl font-bold text-white">My Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myDetails.map((detail) => {
                  const IconComponent = LucideIcons[detail.iconName]
                  return (
                    <Link key={detail.name} href={detail.href} className="w-full">
                      <Button
                        variant="ghost"
                        className="group relative w-full h-20 p-0 overflow-hidden rounded-2xl bg-[#3a4d3c]/50 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#a3d65c]/20 hover:border-[#a3d65c]/40 hover:bg-[#3a4d3c]/70"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${detail.bgColor} opacity-30 group-hover:opacity-40 transition-opacity`}
                        ></div>
                        <div className="relative z-10 flex items-center justify-between w-full px-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${detail.color} shadow-lg`}>
                              {IconComponent && <IconComponent className="h-6 w-6 text-[#2d3e2f]" />}
                            </div>
                            <span className="text-lg font-bold text-white group-hover:text-[#a3d65c] transition-colors">
                              {detail.name}
                            </span>
                          </div>
                          <LucideIcons.ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-[#a3d65c] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Button>
                    </Link>
                  )
                })}
              </div>
            </Card>

            <Card className="p-6 bg-[#3a4d3c]/80 backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                  <LucideIcons.MoreHorizontal className="h-6 w-6 text-[#2d3e2f]" />
                </div>
                <h3 className="text-2xl font-bold text-white">Support & Settings</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherSections.map((section) => {
                  const IconComponent = LucideIcons[section.iconName]

                  const handleClick = () => {
                    if (section.action === "contact") {
                      setShowContactDialog(true)
                    } else if (section.action === "notifications") {
                      setShowNotifications(!showNotifications)
                    }
                  }

                  return (
                    <div key={section.name} className="w-full">
                      <Button
                        variant="ghost"
                        onClick={handleClick}
                        className="group relative w-full h-20 p-0 overflow-hidden rounded-2xl bg-[#3a4d3c]/50 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#a3d65c]/20 hover:border-[#a3d65c]/40 hover:bg-[#3a4d3c]/70"
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${section.bgColor} opacity-30 group-hover:opacity-40 transition-opacity`}
                        ></div>
                        <div className="relative z-10 flex items-center justify-between w-full px-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color} shadow-lg`}>
                              {IconComponent && <IconComponent className="h-6 w-6 text-[#2d3e2f]" />}
                            </div>
                            <span className="text-lg font-bold text-white group-hover:text-[#a3d65c] transition-colors">
                              {section.name}
                            </span>
                          </div>
                          <LucideIcons.ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-[#a3d65c] group-hover:translate-x-1 transition-all" />
                        </div>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>

            <div className="mt-8 mb-40 lg:mb-12">
              <Button
                onClick={handleLogout}
                className="group w-full py-4 text-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-2xl rounded-2xl transition-all duration-300 transform hover:scale-105 border border-red-500/30"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <LucideIcons.LogOut className="h-6 w-6" />
                  </div>
                  <span>{loggingout ? "Logging Out..." : "Logout"}</span>
                  <LucideIcons.ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </div>
          </div>
        </main>

        {showNotifications && (
          <div className="fixed inset-x-0 bottom-20 mx-4 mb-4 p-6 bg-[#3a4d3c] border border-[#a3d65c]/30 rounded-3xl shadow-2xl backdrop-blur-xl z-40 max-w-2xl lg:mx-auto animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#a3d65c]/20">
                  <LucideIcons.Bell className="h-6 w-6 text-[#a3d65c]" />
                </div>
                <h3 className="text-xl font-bold text-white">Notifications</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white hover:bg-[#a3d65c]/20"
              >
                <LucideIcons.X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-3">
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
                        key={index}
                        className={`text-sm p-3 rounded-xl ${bgColor} border hover:bg-[#2d3e2f] transition-all duration-200 ${textColor}`}
                      >
                        <p>{notification.message}</p>
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
          </div>
        )}

        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="bg-[#3a4d3c] border-[#a3d65c]/30 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Contact Support</DialogTitle>
              <DialogDescription className="text-gray-300">Get in touch with our support team</DialogDescription>
            </DialogHeader>
            <CS userId={user.userId} username={user.name} />
          </DialogContent>
        </Dialog>

        <Bottom />
      </div>
    </>
  )
}
