"use client"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as LucideIcons from "lucide-react"
import TransactionHistory from "./history/Index"
import Bottom from "@/app/Common/Bottom/Bottom"
import WithdrawForm from "./withdraw/Index"
import { useUsersContext } from "../AllContext/UsersContext"

export default function WithdrawalPage() {
  const { user } = useUsersContext()

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#3a4d3c]/95 border-b border-[#a3d65c]/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 text-white/80 hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#a3d65c]/10 p-2"
          >
            <LucideIcons.ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-white">Withdrawal</h1>
          <div className="w-12 sm:w-16" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-28 sm:pb-32 lg:pb-48">
        <div className="max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-4 sm:px-6 py-2 sm:py-3 bg-[#a3d65c]/20 rounded-full border border-[#a3d65c]/30">
              <LucideIcons.Wallet className="h-4 w-4 sm:h-6 sm:w-6 text-[#a3d65c]" />
              <span className="text-[#a3d65c] font-semibold text-sm sm:text-base">Secure Withdrawals</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">Manage Your Funds</h2>
            <p className="text-base sm:text-lg text-white/70 px-4">
              Quick and secure withdrawals processed within an hour
            </p>
          </div>

          <Tabs defaultValue="withdraw" className="w-full">
            {/* Enhanced Tabs */}
            <TabsList className="grid w-full grid-cols-2 bg-[#3a4d3c]/70 backdrop-blur-sm border border-[#a3d65c]/20 rounded-2xl p-1 shadow-lg mb-6 sm:mb-8">
              <TabsTrigger
                value="withdraw"
                className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-[#a3d65c] data-[state=active]:text-[#2d3e2f] data-[state=active]:shadow-lg text-white/80 text-sm sm:text-base"
              >
                <LucideIcons.ArrowDownCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Withdraw
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-[#a3d65c] data-[state=active]:text-[#2d3e2f] data-[state=active]:shadow-lg text-white/80 text-sm sm:text-base"
              >
                <LucideIcons.History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Withdraw Tab */}
            <TabsContent value="withdraw" className="mt-0">
              <div className="grid gap-6 sm:gap-8 xl:grid-cols-3">
                {/* Account Balance Card */}
                <div className="xl:col-span-1 order-2 xl:order-1">
                  <Card className="p-4 sm:p-6 bg-[#3a4d3c] border border-[#a3d65c]/30 rounded-3xl shadow-xl">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#a3d65c] rounded-2xl mb-3 sm:mb-4">
                        <LucideIcons.Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-[#2d3e2f]" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-white/80 mb-2">Available Balance</h3>
                      <p className="text-2xl sm:text-3xl font-bold text-[#a3d65c] mb-2">
                        {user.walletBalance.toFixed(2)}
                      </p>
                      <p className="text-xs sm:text-sm text-white/60">Ready for withdrawal</p>
                    </div>
                  </Card>

                  {/* Quick Stats */}
                  <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-[#3a4d3c]/70 backdrop-blur-sm rounded-2xl border border-[#a3d65c]/20">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-[#a3d65c]/20">
                          <LucideIcons.Clock className="h-3 w-3 sm:h-4 sm:w-4 text-[#a3d65c]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-white/70">Processing Time</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white">&lt; 1 Hour</span>
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-[#3a4d3c]/70 backdrop-blur-sm rounded-2xl border border-[#a3d65c]/20">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-[#a3d65c]/20">
                          <LucideIcons.Shield className="h-3 w-3 sm:h-4 sm:w-4 text-[#a3d65c]" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-white/70">Security</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#a3d65c]">Secured</span>
                    </div>
                  </div>
                </div>

                {/* Withdrawal Form */}
                <WithdrawForm />
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-0">
              <TransactionHistory page="Withdrawal" />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <Bottom />
    </div>
  )
}
