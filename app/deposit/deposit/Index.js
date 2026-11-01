"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useUsersContext } from "@/app/AllContext/UsersContext"
import { fetchAdminSettings } from "@/lib/admin-settings"

const Index = () => {
  const { getWallets } = useUsersContext()
  const [wallets, setWallets] = useState([])
  const [brandName, setBrandName] = useState("Axon")

  useEffect(() => {
    const fetchData = async () => {
      const data = await getWallets()
      // Admin-saved crypto deposit addresses (Req 13) are shown here
      // alongside the existing deposit wallets; duplicates by address
      // are removed. If neither source has any, an empty state is shown.
      const settings = await fetchAdminSettings()
      setBrandName(settings.brandName || "Axon")
      const adminAddresses = (settings.depositAddresses || [])
        .filter((a) => a.visible !== false && a.walletAddress)
        .map((a, i) => ({ _id: `admin-${i}`, walletName: a.walletName || a.label || "Crypto", walletAddress: a.walletAddress }))
      const seen = new Set()
      const merged = [...adminAddresses, ...(data || [])].filter((w) => {
        if (seen.has(w.walletAddress)) return false
        seen.add(w.walletAddress)
        return true
      })
      setWallets(merged)
    }
    fetchData()
  }, [])

  const copyToClipboard = (address) => {
    navigator.clipboard.writeText(address)
  }

  const iconMapping = {
    ETH: LucideIcons.Zap,
    Ethereum: LucideIcons.Zap,

    BTC: LucideIcons.Bitcoin,
    Bitcoin: LucideIcons.Bitcoin,

    USDT: LucideIcons.DollarSign,
    Tether: LucideIcons.DollarSign,
    "Tether USD": LucideIcons.DollarSign,
  }

  const colorMapping = {
    ETH: "from-[#a3d65c] to-[#8bc34a]",
    BTC: "from-[#cddc39] to-[#a3d65c]",
    USDT: "from-[#8bc34a] to-[#9ccc65]",
  }

  const bgColorMapping = {
    ETH: "from-[#a3d65c]/10 to-[#8bc34a]/10",
    BTC: "from-[#cddc39]/10 to-[#a3d65c]/10",
    USDT: "from-[#8bc34a]/10 to-[#9ccc65]/10",
  }

  return (
    <Tabs defaultValue="deposit">
      <TabsContent value="deposit" className="mt-0">
        <div className="grid gap-6 sm:gap-8">
          <Card className="p-4 sm:p-6 lg:p-8 bg-[#3a4d3c]/70 backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
                <LucideIcons.Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-[#2d3e2f]" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Deposit Addresses</h2>
            </div>

            {wallets.length === 0 && (
              <p className="text-sm text-gray-300">No deposit addresses configured yet. Please contact support.</p>
            )}
            <div className="grid gap-6 sm:gap-8 mb-8">
              {wallets.map((wallet) => {
                const Icon = iconMapping[wallet.walletName] || LucideIcons.Wallet

                const color = colorMapping[wallet.walletName] || "from-[#a3d65c] to-[#8bc34a]"

                const bgColor = bgColorMapping[wallet.walletName] || "from-[#a3d65c]/10 to-[#8bc34a]/10"

                return (
                  <div
                    key={wallet._id}
                    className="p-4 sm:p-6 bg-[#2d3e2f] border border-[#a3d65c]/30 rounded-2xl hover:shadow-xl hover:border-[#a3d65c]/50 transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                      <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#2d3e2f]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white">{wallet.walletName}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{wallet.walletName}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <p className="text-xs sm:text-sm font-semibold text-gray-300 mb-2">Deposit Address:</p>
                      <div className="flex items-center gap-2 p-3 bg-[#3a4d3c] rounded-xl border border-[#a3d65c]/30">
                        <code className="text-xs sm:text-sm font-mono text-gray-200 flex-1 truncate">
                          {wallet.walletAddress}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(wallet.walletAddress)}
                          className="flex-shrink-0 text-[#a3d65c] hover:text-[#8bc34a] hover:bg-[#a3d65c]/10"
                        >
                          <LucideIcons.Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className={`p-3 sm:p-4 bg-gradient-to-br ${bgColor} rounded-xl border-l-4 border-l-[#a3d65c]`}>
                      <div className="flex gap-2 sm:gap-3">
                        <LucideIcons.AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5 text-[#a3d65c]" />
                        <p className="text-xs sm:text-sm text-gray-300">
                          Send funds to the address above. After sending, please contact {brandName} support with the receipt
                          & username for verification.
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

export default Index
