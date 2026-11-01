"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import * as LucideIcons from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { fetchAdminSettings, DEFAULT_SETTINGS } from "@/lib/admin-settings"
import CS from "@/app/Common/CustomerService/CS"

export default function VipLevelsPage() {
  const pathname = usePathname()
  const router = useRouter()
  const [storedUser, setStoredUser] = useState(null)
  const [isCSOpen, setIsCSOpen] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setStoredUser(JSON.parse(userData))
    }
  }, [])

  const defaultVipLevels = [
    {
      level: "VIP1",
      name: "Bronze Tier",
      amount: "1000.00 USD",
      iconName: "Star",
      depositRequired: 1000,
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#2d3e2f]",
      borderColor: "border-[#a3d65c]",
      commission: "0.4%",
      withdrawalLimit: "1300 USD",
      features: ["Basic Support", "Standard Processing", "Mobile Access"],
      badge: "Popular",
    },
    {
      level: "VIP2",
      name: "Silver Tier",
      amount: "2000.00 USD",
      iconName: "Crown",
      depositRequired: 2000,
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#2d3e2f]",
      borderColor: "border-[#a3d65c]",
      commission: "0.6%",
      withdrawalLimit: "4,000 USD",
      features: ["Priority Support", "Fast Processing", "Advanced Tools", "Email Alerts"],
      badge: "Recommended",
    },
    {
      level: "VIP3",
      name: "Gold Tier",
      amount: "3000.00 USD",
      iconName: "Gem",
      depositRequired: 3000,
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#2d3e2f]",
      borderColor: "border-[#a3d65c]",
      commission: "0.8%",
      withdrawalLimit: "8,000 USD",
      features: ["VIP Support", "Instant Processing", "Premium Tools", "SMS Alerts", "Personal Manager"],
      badge: "Best Value",
    },
    {
      level: "VIP4",
      name: "Diamond Tier",
      amount: "5,000.00 USD",
      iconName: "Diamond",
      depositRequired: 5000,
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#2d3e2f]",
      borderColor: "border-[#a3d65c]",
      commission: "1.0%",
      withdrawalLimit: "Unlimited",
      features: [
        "24/7 Dedicated Support",
        "Lightning Processing",
        "Exclusive Tools",
        "All Notifications",
        "Personal Manager",
        "Custom Solutions",
      ],
      badge: "Elite",
    },
  ]

  const [allVipLevels, setAllVipLevels] = useState(defaultVipLevels)
  useEffect(() => {
    fetchAdminSettings().then((s) => {
      const configured = (s.vipLevels || []).filter((v) => v.visible !== false)
      if (configured.length > 0) {
        setAllVipLevels(configured.map((v) => ({
          level: v.level,
          name: v.name,
          amount: v.amount || `${Number(v.depositRequired || 0).toLocaleString()}.00 USD`,
          iconName: v.iconName || "Star",
          depositRequired: v.depositRequired,
          color: "from-[#a3d65c] to-[#8bc34a]",
          bgColor: "from-[#3a4d3c] to-[#2d3e2f]",
          borderColor: "border-[#a3d65c]",
          commission: v.commission,
          withdrawalLimit: v.withdrawalLimit,
          features: v.features || [],
          badge: v.badge,
        })))
      }
    })
  }, [])

  const currentUserVipLevel = storedUser
    ? "VIP" + JSON.parse(localStorage.getItem("user")).currentVIPLevel.number
    : null

  const supportReps = [
    { name: "Support Representative 1", phone: "1234567890" },
    { name: "Support Representative 2", phone: "1234567891" },
    { name: "Support Representative 3", phone: "1234567892" },
  ]

  const bottomNavLinks = [
    { name: "Home", icon: LucideIcons.Home, href: "/" },
    { name: "Starting", icon: LucideIcons.PlayCircle, href: "/starting" },
    { name: "Records", icon: LucideIcons.ClipboardList, href: "/records" },
  ]

  const benefits = [
    {
      icon: LucideIcons.TrendingUp,
      title: "Higher Commissions",
      description: "Earn more with each transaction as you upgrade your VIP level",
      color: "from-[#a3d65c] to-[#8bc34a]",
    },
    {
      icon: LucideIcons.Zap,
      title: "Faster Processing",
      description: "Priority processing for all your transactions and requests",
      color: "from-[#a3d65c] to-[#8bc34a]",
    },
    {
      icon: LucideIcons.Shield,
      title: "Enhanced Security",
      description: "Advanced security features and dedicated account protection",
      color: "from-[#a3d65c] to-[#8bc34a]",
    },
    {
      icon: LucideIcons.Headphones,
      title: "Premium Support",
      description: "24/7 dedicated support team for VIP members",
      color: "from-[#a3d65c] to-[#8bc34a]",
    },
  ]

  if (!storedUser) return null

  return (
    <>
      <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#3a4d3c]/90 border-b border-[#a3d65c]/20 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 text-white hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#2d3e2f] p-2"
            >
              <LucideIcons.ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold text-[#a3d65c]">VIP Levels</h1>
            <div className="w-12 sm:w-16" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6 pb-32 lg:pb-48">
          <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-4 sm:px-6 py-2 sm:py-3 bg-[#a3d65c]/20 rounded-full">
                <LucideIcons.Crown className="h-4 w-4 sm:h-6 sm:w-6 text-[#a3d65c]" />
                <span className="text-[#a3d65c] font-semibold text-sm sm:text-base">Premium Membership</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">Exclusive VIP Tiers</h2>
              <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto px-4">
                Unlock premium benefits and exclusive rewards with our VIP membership tiers designed for your success
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card
                    key={index}
                    className="p-6 text-center bg-[#3a4d3c] backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl hover:shadow-2xl hover:border-[#a3d65c] transition-all duration-300 transform hover:scale-105"
                  >
                    <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${benefit.color} shadow-lg mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{benefit.description}</p>
                  </Card>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
              {allVipLevels.map((vip, index) => {
                const IconComponent = LucideIcons[vip.iconName]
                const isCurrent = vip.level === currentUserVipLevel
                const isUpgradeable =
                  !isCurrent && allVipLevels.indexOf(vip) > allVipLevels.findIndex((l) => l.level === currentUserVipLevel)

                return (
                  <Card
                    key={vip.level}
                    className={`group relative p-6 sm:p-8 text-center bg-gradient-to-br ${vip.bgColor} shadow-2xl border-2 ${isCurrent ? vip.borderColor : "border-[#a3d65c]/20"
                      } rounded-3xl hover:shadow-3xl hover:border-[#a3d65c] transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 overflow-hidden`}
                  >
                    {vip.badge && (
                      <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] text-[#2d3e2f] text-xs font-bold rounded-full shadow-lg">
                        {vip.badge}
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full flex items-center justify-center shadow-lg">
                        <LucideIcons.Check className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${vip.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                    ></div>

                    <div className="relative z-10">
                      <div
                        className={`inline-flex p-4 sm:p-5 rounded-3xl bg-gradient-to-r ${vip.color} shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {IconComponent && <IconComponent className="h-8 w-8 sm:h-10 sm:w-10 text-white" />}
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 group-hover:text-[#a3d65c] transition-colors">
                        {vip.level}
                      </h3>
                      <div className="text-lg font-semibold text-gray-300 mb-4">{vip.name}</div>

                      <div className="mb-6">
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                          ${vip.depositRequired.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400">Minimum Deposit</div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between p-3 bg-[#2d3e2f]/50 rounded-xl border border-[#a3d65c]/20">
                          <span className="text-sm font-medium text-gray-300">Commission</span>
                          <span className="text-sm font-bold text-[#a3d65c]">{vip.commission}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        {vip.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-300">
                            <LucideIcons.Check className="h-4 w-4 text-[#a3d65c] flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {isCurrent ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#a3d65c]/20 text-[#a3d65c] rounded-2xl font-bold border border-[#a3d65c]/40">
                          <LucideIcons.CheckCircle className="h-5 w-5" />
                          Current Level
                        </div>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className={`w-full py-3 text-lg font-bold bg-gradient-to-r ${vip.color} hover:opacity-90 text-white shadow-2xl rounded-2xl transition-all duration-300 transform hover:scale-105`}
                            >
                              <LucideIcons.ArrowUp className="h-5 w-5 mr-2" />
                              Upgrade Now
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-[#3a4d3c] backdrop-blur-xl border border-[#a3d65c]/20 rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-bold text-[#a3d65c]">
                                Upgrade to {vip.level}
                              </DialogTitle>
                              <DialogDescription className="text-gray-300">
                                Contact our support team to upgrade to {vip.level} - {vip.name} and unlock exclusive
                                benefits.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="p-4 bg-[#2d3e2f]/50 rounded-2xl border border-[#a3d65c]/20">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`p-2 rounded-xl bg-gradient-to-r ${vip.color}`}>
                                    {IconComponent && <IconComponent className="h-5 w-5 text-white" />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white">
                                      {vip.level} - {vip.name}
                                    </div>
                                    <div className="text-sm text-gray-300">
                                      Deposit: ${vip.depositRequired.toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-sm text-gray-300">
                                  Commission: <span className="font-bold text-[#a3d65c]">{vip.commission}</span> | Limit:{" "}
                                  <span className="font-bold text-[#a3d65c]">{vip.withdrawalLimit}</span>
                                </div>
                              </div>
                              {supportReps.map((rep, repIndex) => (
                                <a
                                  key={repIndex}
                                  href={`https://wa.me/${rep.phone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button
                                    variant="ghost"
                                    className="w-full justify-start text-white hover:text-[#a3d65c] hover:bg-[#2d3e2f] rounded-xl p-4 transition-all duration-200"
                                  >
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] mr-3">
                                      <LucideIcons.MessageCircle className="h-4 w-4 text-white" />
                                    </div>
                                    {rep.name}
                                  </Button>
                                </a>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>

            <Card className="p-6 sm:p-8 bg-[#3a4d3c] backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                  <LucideIcons.BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">VIP Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#a3d65c]/20">
                      <th className="text-left p-4 font-bold text-white">Feature</th>
                      {allVipLevels.map((vip) => (
                        <th key={vip.level} className="text-center p-4 font-bold text-white">
                          {vip.level}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#a3d65c]/10">
                      <td className="p-4 font-medium text-gray-300">Commission Rate</td>
                      {allVipLevels.map((vip) => (
                        <td key={vip.level} className="text-center p-4 font-bold text-[#a3d65c]">
                          {vip.commission}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-[#a3d65c]/10">
                      <td className="p-4 font-medium text-gray-300">Support Level</td>
                      {allVipLevels.map((vip, index) => (
                        <td key={vip.level} className="text-center p-4">
                          <div className="flex justify-center">
                            {Array.from({ length: index + 1 }, (_, i) => (
                              <LucideIcons.Star key={i} className="h-4 w-4 text-[#a3d65c] fill-current" />
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6 sm:p-8 text-center bg-gradient-to-r from-[#3a4d3c] to-[#2d3e2f] shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
          <div className="text-white">
            <div className="inline-flex p-3 rounded-2xl bg-[#a3d65c]/20 backdrop-blur-sm mb-4">
              <LucideIcons.Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-[#a3d65c]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Upgrade?</h2>
            <p className="text-lg sm:text-xl mb-6 text-gray-300">
              Join thousands of VIP members and unlock exclusive benefits today
            </p>

            {/* Dialog for Customer Service */}
            <Dialog open={isCSOpen} onOpenChange={setIsCSOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-[#a3d65c] text-[#2d3e2f] hover:bg-[#8bc34a] font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <LucideIcons.Crown className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md bg-[#3a4d3c] border border-[#a3d65c]/20 rounded-2xl p-4">
                <CS userId={storedUser._id} username={storedUser.username} />
              </DialogContent>
            </Dialog>
          </div>
        </Card>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#3a4d3c]/90 backdrop-blur-xl border-t border-[#a3d65c]/20 p-3 sm:p-4 shadow-2xl z-40">
          <div className="flex justify-around items-center max-w-md mx-auto">
            {bottomNavLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link key={link.name} href={link.href} className="flex-1">
                  <Button
                    variant="ghost"
                    className={`flex flex-col items-center gap-1 sm:gap-2 w-full p-2 sm:p-3 rounded-2xl transition-all duration-300 ${isActive
                        ? "bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] text-white shadow-lg transform scale-105"
                        : "text-gray-300 hover:text-[#a3d65c] hover:bg-[#2d3e2f]"
                      }`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs font-semibold">{link.name}</span>
                    {isActive && <div className="w-1 h-1 bg-white rounded-full"></div>}
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
