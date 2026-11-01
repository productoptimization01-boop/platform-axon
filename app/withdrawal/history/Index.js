"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { useUsersContext } from "@/app/AllContext/UsersContext"
import TransactionReceiptModal from "./transaction-receipt-modal"

const Index = ({ page }) => {
  const { getUserTransactionsAPI, user } = useUsersContext()
  const [transactions, setTransactions] = useState([])
  const [rawTransactions, setRawTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?._id) return
      setLoading(true)
      setError("")

      const result = await getUserTransactionsAPI(user._id)

      if (result.error) {
        setError(result.error)
      } else {
        setRawTransactions(result)

        // Map backend data to table-friendly format
        const formatted = result.map((tx, index) => ({
          id: tx._id,
          date: new Date(tx.createdAt).toLocaleDateString(),
          amount: tx.transactionAmount.toFixed(2),
          status: tx.status === "Successful" ? "Completed" : tx.status === "Pending" ? "Pending" : "Failed",
          transactionId: tx._id,
          method: tx.type === "Debit" ? "Withdraw" : "Deposit",
          fee: "0.00",
          hasWallet: tx.walletId !== null,
        }))
        setTransactions(formatted)
      }

      setLoading(false)
    }

    fetchTransactions()
  }, [user])

  const handleViewReceipt = (transactionId) => {
    const transaction = rawTransactions.find((tx) => tx._id === transactionId)
    if (transaction) {
      setSelectedTransaction(transaction)
      setIsModalOpen(true)
    }
  }

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

  if (loading)
    return (
      <Card className="p-4 sm:p-6 bg-[#2d3e2f] backdrop-blur-sm shadow-2xl border border-[#3a4d3c] rounded-3xl text-center">
        <p className="text-white">Loading transactions...</p>
      </Card>
    )

  if (error)
    return (
      <Card className="p-4 sm:p-6 bg-[#2d3e2f] backdrop-blur-sm shadow-2xl border border-[#3a4d3c] rounded-3xl text-center text-red-400">
        <p>{error}</p>
      </Card>
    )

    const filteredTransactions = transactions.filter(txn => {
      if (page === "Deposit") return txn.method === "Deposit";
      if (page === "Withdrawal") return txn.method === "Withdraw";
      return true; // fallback
    });

  return (
    <Tabs defaultValue="history" className="mt-0">
      <TabsContent value="history" className="mt-0">
        <Card className="p-4 sm:p-6 bg-[#2d3e2f] backdrop-blur-sm shadow-2xl border border-[#3a4d3c] rounded-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 rounded-2xl bg-[#a3d65c]">
              <LucideIcons.History className="h-4 w-4 sm:h-6 sm:w-6 text-[#2d3e2f]" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">Transaction History</h2>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-[#3a4d3c] hover:bg-[#354a37] border-b-2 border-[#a3d65c]">
                      <TableHead className="text-white font-bold text-xs sm:text-sm px-2 sm:px-4">Date</TableHead>
                      <TableHead className="text-white font-bold text-xs sm:text-sm px-2 sm:px-4">Amount</TableHead>
                      <TableHead className="text-white font-bold text-xs sm:text-sm px-2 sm:px-4">Status</TableHead>
                      <TableHead className="text-white font-bold text-xs sm:text-sm px-2 sm:px-4">Type</TableHead>
                      <TableHead className="text-white px-2 sm:px-4 hidden sm:table-cell">Fee</TableHead>
                      <TableHead className="text-white text-xs font-mono px-2 sm:px-4 hidden lg:table-cell">
                        Transaction ID
                      </TableHead>
                      <TableHead className="text-white font-bold text-xs sm:text-sm px-2 sm:px-4 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((item) => (
                      <TableRow
                        key={item.id}
                        className="border-b border-[#3a4d3c] hover:bg-[#3a4d3c] transition-all duration-200"
                      >
                        <TableCell className="font-medium text-white px-2 sm:px-4 py-2 sm:py-3">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <LucideIcons.Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-[#a3d65c]" />
                            <span className="text-xs sm:text-sm">{item.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">
                          <div className="font-bold text-white text-xs sm:text-sm">${item.amount}</div>
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3">{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-white">{item.method}</TableCell>
                        <TableCell className="text-white px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                          <div className="flex items-center gap-1 text-xs sm:text-sm">
                            <LucideIcons.Minus className="h-3 w-3" />${item.fee}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 text-xs font-mono px-2 sm:px-4 py-2 sm:py-3 hidden lg:table-cell">
                          {item.transactionId}
                        </TableCell>
                        <TableCell className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                          {item.hasWallet ? (
                            <button
                              onClick={() => handleViewReceipt(item.id)}
                              className="p-2 rounded-lg bg-[#a3d65c] hover:bg-[#8bc045] transition-all duration-200 shadow-md hover:shadow-lg"
                              title="View Receipt"
                            >
                              <LucideIcons.Eye className="h-4 w-4 text-[#2d3e2f]" />
                            </button>
                          ) : (
                            <span className="text-gray-500 text-xs">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[#3a4d3c] rounded-2xl mb-3 sm:mb-4">
                <LucideIcons.FileX className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-base sm:text-lg">No withdrawal history found</p>
            </div>
          )}
        </Card>

        {isModalOpen && (
          <TransactionReceiptModal
            transaction={selectedTransaction}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedTransaction(null)
            }}
          />
        )}
      </TabsContent>
    </Tabs>
  )
}

export default Index
