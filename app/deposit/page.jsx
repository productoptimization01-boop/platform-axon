"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import * as LucideIcons from "lucide-react"
import Bottom from "@/app/Common/Bottom/Bottom"
import CS from "@/app/Common/CustomerService/CS"
import { useRouter } from "next/navigation"
import Deposit from "./deposit/Index"
import TransactionHistory from "@/app/withdrawal/history/Index"

export default function DepositPage() {
  const [isCSOpen, setIsCSOpen] = useState(false)

  const router = useRouter()
  const [storedUser, setStoredUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setStoredUser(JSON.parse(userData))
    }
  }, [])
  // Prevent rendering until localStorage is checked
  if (!storedUser) return null

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#2d3e2f] via-[#3a4d3c] to-[#2d3e2f]">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#2d3e2f]/90 border-b border-[#a3d65c]/20 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 text-gray-300 hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#3a4d3c] p-2"
            >
              <LucideIcons.ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-[#a3d65c] bg-clip-text text-transparent">
              Deposit
            </h1>
            <div className="w-12 sm:w-16" />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 pb-28 sm:pb-32 lg:pb-48">
          <div className="max-w-7xl mx-auto w-full">
            {/* Hero Section */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-4 sm:px-6 py-2 sm:py-3 bg-[#a3d65c]/20 border border-[#a3d65c]/30 rounded-full">
                <LucideIcons.PlusCircle className="h-4 w-4 sm:h-6 sm:w-6 text-[#a3d65c]" />
                <span className="text-[#a3d65c] font-semibold text-sm sm:text-base">Crypto Deposit</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-white">Deposit Funds</h2>
              <p className="text-base sm:text-lg text-gray-300 px-4">
                Choose from 3 secure cryptocurrency deposit addresses
              </p>
            </div>

            <Tabs defaultValue="deposit" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#3a4d3c]/70 backdrop-blur-sm border border-[#a3d65c]/20 rounded-2xl p-1 shadow-lg mb-6 sm:mb-8">
                <TabsTrigger
                  value="deposit"
                  className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-[#a3d65c] data-[state=active]:text-[#2d3e2f] data-[state=active]:shadow-lg text-gray-300 text-sm sm:text-base"
                >
                  <LucideIcons.PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-[#a3d65c] data-[state=active]:text-[#2d3e2f] data-[state=active]:shadow-lg text-gray-300 text-sm sm:text-base"
                >
                  <LucideIcons.History className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit">
                <Deposit />
              </TabsContent>
              <TabsContent value="history">
                <TransactionHistory page="Deposit" />
              </TabsContent>
            </Tabs>

            <div className="mt-8 mb-6 flex justify-center">
              <Dialog open={isCSOpen} onOpenChange={setIsCSOpen}>
                <DialogTrigger asChild>
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] hover:from-[#8bc34a] hover:to-[#a3d65c] text-[#2d3e2f] font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3">
                    <div className="p-2 bg-[#2d3e2f]/20 rounded-lg group-hover:bg-[#2d3e2f]/30 transition-all">
                      <LucideIcons.Headphones className="h-5 w-5" />
                    </div>
                    <span className="text-base sm:text-lg">Contact to Support</span>
                    <LucideIcons.MessageCircle className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                  </button>
                </DialogTrigger>
                <CS userId={storedUser._id} username={storedUser.username} />
              </Dialog>
            </div>
          </div>
        </main>
        <Bottom />
      </div>
    </>
  )
}
