"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import * as LucideIcons from "lucide-react"
import UserDetailsModal from "./user-details-modal"
import { useUsersContext } from "../../app/AllContext/UsersContext"

export default function TransactionsListModal({ onClose }) {
  const { transactions } = useUsersContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  const filteredTransactions = transactions?.filter(
    (transaction) =>
      transaction.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionAmount?.toString().includes(searchTerm),
  )

  const handleViewUser = (transaction) => {
    setSelectedTransaction(transaction)
    setShowUserDetails(true)
  }

  const handleCloseUserDetails = () => {
    setShowUserDetails(false)
    setSelectedTransaction(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Successful":
        return "bg-green-900/40 text-green-300 border-green-700/50"
      case "Pending":
        return "bg-yellow-900/40 text-yellow-300 border-yellow-700/50"
      case "Failed":
        return "bg-red-900/40 text-red-300 border-red-700/50"
      default:
        return "bg-slate-900/40 text-slate-300 border-slate-700/50"
    }
  }

  const getTypeColor = (type) => {
    return type === "Credit"
      ? "bg-emerald-900/40 text-emerald-300 border-emerald-700/50"
      : "bg-rose-900/40 text-rose-300 border-rose-700/50"
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-6xl bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LucideIcons.Receipt className="h-8 w-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">All Transactions</h2>
                <p className="text-emerald-100 text-sm">Real-time transaction monitoring</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg">
              <LucideIcons.X className="h-6 w-6" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-slate-700">
            <div className="relative">
              <LucideIcons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Search by status, type, or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-800 border-2 border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 text-slate-100"
              />
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-auto p-6">
            {!filteredTransactions || filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <LucideIcons.Inbox className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-semibold">No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-800/60 border-b border-slate-700">
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Transaction ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Amount</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-slate-200">Date</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-slate-200">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-slate-300 font-mono text-sm">{transaction._id?.slice(0, 8)}...</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-emerald-400">${transaction.transactionAmount}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(transaction.type)}`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transaction.status)}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}{" "}
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            onClick={() => handleViewUser(transaction)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
                          >
                            <LucideIcons.User className="h-4 w-4 mr-2" />
                            View User
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedTransaction && (
        <UserDetailsModal userId={selectedTransaction.userId} onClose={handleCloseUserDetails} />
      )}
    </>
  )
}
