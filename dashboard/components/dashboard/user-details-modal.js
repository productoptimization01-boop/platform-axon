"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUsersContext } from "../../app/AllContext/UsersContext"

export default function UserDetailsModal({ userId, onClose }) {
  const { getUserByUserId, updateTransactionStatus, transactions, fetchWalletAddress } = useUsersContext()
  const { toast } = useToast()
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingTransaction, setUpdatingTransaction] = useState(null)
  const [walletDetailsDialog, setWalletDetailsDialog] = useState({ open: false, data: null, loading: false })

  useEffect(() => {
    fetchUserDetails()
  }, [userId])

  const userTransactions = useMemo(() => {
    if (!transactions || !userId) return []
    return transactions.filter((transaction) => transaction.userId === userId)
  }, [transactions, userId])

  const fetchUserDetails = async () => {
    setLoading(true)
    const result = await getUserByUserId(userId)
    if (result.success) {
      setUserDetails(result.user)
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to fetch user details",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleStatusChange = async (transactionId, newStatus) => {
    console.log("[v0] Status change triggered for:", transactionId, "New status:", newStatus)
    setUpdatingTransaction(transactionId)
    const result = await updateTransactionStatus(transactionId, newStatus)

    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Transaction status changed to ${newStatus}`,
      })
      // Refresh user details to get updated transactions
      await fetchUserDetails()
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update status",
        variant: "destructive",
      })
    }
    setUpdatingTransaction(null)
  }

  const handleViewWalletDetails = async (walletId) => {
    if (!walletId) {
      toast({
        title: "Error",
        description: "Wallet ID not found in transaction",
        variant: "destructive",
      })
      return
    }

    setWalletDetailsDialog({ open: true, data: null, loading: true })

    const result = await fetchWalletAddress(walletId)

    if (result.success) {
      setWalletDetailsDialog({ open: true, data: result.walletAddress, loading: false })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to fetch wallet address",
        variant: "destructive",
      })
      setWalletDetailsDialog({ open: false, data: null, loading: false })
    }
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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center">
        <Card className="bg-slate-900 border-2 border-slate-700 p-12 rounded-2xl">
          <LucideIcons.Loader className="h-12 w-12 animate-spin text-emerald-400 mx-auto" />
          <p className="text-slate-300 mt-4 font-semibold">Loading user details...</p>
        </Card>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center">
        <Card className="bg-slate-900 border-2 border-slate-700 p-12 rounded-2xl">
          <LucideIcons.AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-slate-300 mt-4 font-semibold">Failed to load user details</p>
          <Button onClick={onClose} className="mt-4 w-full">
            Close
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
        <Card className="w-full max-w-7xl bg-slate-900 border-2 border-slate-700 shadow-2xl rounded-2xl max-h-[95vh] overflow-hidden flex flex-col my-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LucideIcons.UserCircle className="h-8 w-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">User Details & Transactions</h2>
                <p className="text-blue-100 text-sm">Complete user information and transaction history</p>
              </div>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-lg">
              <LucideIcons.X className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* User Information Card */}
            <Card className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                <LucideIcons.User className="h-5 w-5 text-blue-400" />
                User Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Username</p>
                  <p className="text-slate-100 font-semibold">{userDetails.username}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Phone</p>
                  <p className="text-slate-100 font-semibold">{userDetails.phone}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">VIP Level</p>
                  <p className="text-purple-400 font-semibold">
                    {userDetails.currentVIPLevel?.name
                      ? `VIP${userDetails.currentVIPLevel.number} ${userDetails.currentVIPLevel.name}`
                      : "Not Set"}
                  </p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Wallet Balance</p>
                  <p className="text-green-400 font-bold text-lg">${userDetails.walletBalance}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Total Balance</p>
                  <p className="text-blue-400 font-bold text-lg">{userDetails.totalBalance}</p>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">Commission Total</p>
                  <p className="text-emerald-400 font-bold text-lg">${userDetails.commissionTotal}</p>
                </div>
              </div>
            </Card>

            {/* Transactions Card */}
            <Card className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
                <LucideIcons.Receipt className="h-5 w-5 text-emerald-400" />
                Transaction History
                <span className="ml-2 px-3 py-1 bg-emerald-900/40 text-emerald-300 rounded-full text-sm font-semibold border border-emerald-700/50">
                  {userTransactions.length} Transactions
                </span>
              </h3>

              {userTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <LucideIcons.Inbox className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold">No transactions found for this user</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900/60 border-b border-slate-700">
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-200">Transaction ID</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-200">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-200">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-200">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-200">Date</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-200">Change Status</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.map((transaction) => (
                        <tr
                          key={transaction._id}
                          className="border-b border-slate-700/30 hover:bg-slate-900/40 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="text-slate-300 font-mono text-xs">{transaction._id?.slice(0, 8)}...</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-lg font-bold text-emerald-400">${transaction.transactionAmount}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold border ${getTypeColor(transaction.type)}`}
                            >
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(transaction.status)}`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                            <br />
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3">
                            <Select
                              value={transaction.status}
                              onValueChange={(value) => handleStatusChange(transaction._id, value)}
                              disabled={updatingTransaction === transaction._id}
                            >
                              <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-700 z-[100]">
                                <SelectItem
                                  value="Pending"
                                  className="text-yellow-300 hover:bg-slate-800 cursor-pointer"
                                >
                                  Pending
                                </SelectItem>
                                <SelectItem
                                  value="Successful"
                                  className="text-green-300 hover:bg-slate-800 cursor-pointer"
                                >
                                  Successful
                                </SelectItem>
                                <SelectItem value="Failed" className="text-red-300 hover:bg-slate-800 cursor-pointer">
                                  Failed
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {updatingTransaction === transaction._id && (
                              <LucideIcons.Loader className="h-4 w-4 animate-spin text-slate-400 mx-auto mt-1" />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              onClick={() => handleViewWalletDetails(transaction.walletId)}
                              disabled={!transaction.walletId}
                              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg px-3 py-1 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <LucideIcons.Wallet className="h-3 w-3 mr-1" />
                              Wallet Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Footer */}
          <div className="bg-slate-800/60 border-t border-slate-700 p-4 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg px-6"
            >
              Close
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        open={walletDetailsDialog.open}
        onOpenChange={(open) => setWalletDetailsDialog({ ...walletDetailsDialog, open })}
      >
        <DialogContent className="bg-slate-900 border-2 border-slate-700 text-slate-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <LucideIcons.Wallet className="h-6 w-6 text-cyan-400" />
              Wallet Address Details
            </DialogTitle>
            <DialogDescription className="text-slate-400">Withdrawal destination wallet information</DialogDescription>
          </DialogHeader>

          {walletDetailsDialog.loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LucideIcons.Loader className="h-12 w-12 animate-spin text-cyan-400 mb-4" />
              <p className="text-slate-300 font-semibold">Loading wallet details...</p>
            </div>
          ) : walletDetailsDialog.data ? (
            <div className="space-y-4 py-4">
              <Card className="bg-slate-800/60 border border-slate-700 p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <LucideIcons.Tag className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm mb-1">Wallet Label</p>
                      <p className="text-slate-100 font-semibold text-lg">{walletDetailsDialog.data.walletLabel}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <LucideIcons.MapPin className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm mb-1">Wallet Address</p>
                      <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700">
                        <p className="text-emerald-300 font-mono text-sm break-all">
                          {walletDetailsDialog.data.walletAddress}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <LucideIcons.User className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-slate-400 text-sm mb-1">User ID</p>
                      <p className="text-slate-100 font-mono text-sm">{walletDetailsDialog.data.userId}</p>
                    </div>
                  </div>

                  {walletDetailsDialog.data.createdAt && (
                    <div className="flex items-start gap-3">
                      <LucideIcons.Calendar className="h-5 w-5 text-cyan-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-400 text-sm mb-1">Created At</p>
                        <p className="text-slate-100 text-sm">
                          {new Date(walletDetailsDialog.data.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 flex items-start gap-3">
                <LucideIcons.Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-blue-200 text-sm">
                  This is the wallet address where the user wants to receive their withdrawal funds.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <LucideIcons.AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-slate-300 font-semibold">Failed to load wallet details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
