import { TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const Index = () => {
  const depositHistory = [
    {
      id: 1,
      date: "2025-07-22",
      amount: "0.5",
      currency: "ETH",
      status: "Completed",
      transactionId: "0x742d35Cc6634C0532925a3b844Bc09e7f1f0d1E9",
      address: "0x742d35Cc6634C0532925a3b844Bc09e7f1f0d1E9",
    },
    {
      id: 2,
      date: "2025-07-18",
      amount: "0.1",
      currency: "BTC",
      status: "Completed",
      transactionId: "1A1z7agoat5d5MK1C6dL8Ku6q3gJqTqN3Y",
      address: "1A1z7agoat5d5MK1C6dL8Ku6q3gJqTqN3Y",
    },
    {
      id: 3,
      date: "2025-07-12",
      amount: "1000",
      currency: "USDT",
      status: "Pending",
      transactionId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
  ]

  const getStatusBadge = (status) => {
    const statusConfig = {
      Completed: {
        bg: "bg-[#a3d65c]/20",
        text: "text-[#a3d65c]",
        icon: LucideIcons.CheckCircle,
      },
      Pending: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        icon: LucideIcons.Clock,
      },
      Failed: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        icon: LucideIcons.XCircle,
      },
    }

    const config = statusConfig[status] || statusConfig.Pending
    const Icon = config.icon

    return (
      <div
        className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{status}</span>
        <span className="sm:hidden">{status.charAt(0)}</span>
      </div>
    )
  }

  return (
    <TabsContent value="history" className="mt-0">
      <Card className="p-4 sm:p-6 bg-[#3a4d3c]/70 backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a]">
            <LucideIcons.History className="h-4 w-4 sm:h-6 sm:w-6 text-[#2d3e2f]" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-white">Deposit History</h2>
        </div>

        {depositHistory.length > 0 ? (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-[#2d3e2f]/70 hover:bg-[#2d3e2f] border-b-2 border-[#a3d65c]/30">
                    <TableHead className="text-gray-300 font-bold text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                    <TableHead className="text-gray-300 font-bold text-xs sm:text-sm px-2 sm:px-4">Amount</TableHead>
                    <TableHead className="text-gray-300 font-bold text-xs sm:text-sm px-2 sm:px-4">Currency</TableHead>
                    <TableHead className="text-gray-300 font-bold text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                    <TableHead className="text-gray-300 font-bold text-xs sm:text-sm px-2 sm:px-4 hidden lg:table-cell">
                      Transaction ID
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {depositHistory.map((item) => (
                    <TableRow
                      key={item.id}
                      className="border-b border-[#a3d65c]/20 hover:bg-[#2d3e2f]/50 transition-all duration-200"
                    >
                      <TableCell className="font-medium text-gray-300 px-2 sm:px-4 py-2 sm:py-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <LucideIcons.Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                          <span className="text-xs sm:text-sm">{item.date}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="font-bold text-white text-xs sm:text-sm">{item.amount}</div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                        <div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] text-[#2d3e2f] text-xs font-medium rounded-lg">
                          {item.currency}
                        </div>
                      </TableCell>
                      <TableCell className="px-2 sm:px-4 py-2 sm:py-3">{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-gray-400 text-xs font-mono px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                        {item.transactionId}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#2d3e2f] rounded-2xl mb-3 sm:mb-4">
              <LucideIcons.FileX className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
            <p className="text-gray-400 text-base sm:text-lg">No deposit history found</p>
          </div>
        )}
      </Card>
    </TabsContent>
  )
}

export default Index
