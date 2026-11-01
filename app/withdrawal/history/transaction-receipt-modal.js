"use client"
import { X, Receipt, Calendar, DollarSign, CreditCard, Wallet, CheckCircle, XCircle, Clock } from "lucide-react"

const TransactionReceiptModal = ({ transaction, onClose }) => {
  if (!transaction) return null

  const getStatusConfig = (status) => {
    const configs = {
      Successful: {
        color: "text-[#a3d65c]",
        bg: "bg-[#a3d65c]/20",
        icon: CheckCircle,
        label: "Successful",
      },
      Pending: {
        color: "text-yellow-400",
        bg: "bg-yellow-500/20",
        icon: Clock,
        label: "Pending",
      },
      Failed: {
        color: "text-red-400",
        bg: "bg-red-500/20",
        icon: XCircle,
        label: "Failed",
      },
    }
    return configs[status] || configs.Pending
  }

  const statusConfig = getStatusConfig(transaction.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#2d3e2f] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#3a4d3c]">
        {/* Header */}
        <div className="sticky top-0 bg-[#3a4d3c] p-6 rounded-t-3xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#a3d65c]/20 rounded-xl backdrop-blur-sm">
                <Receipt className="h-6 w-6 text-[#a3d65c]" />
              </div>
              <h2 className="text-xl font-bold text-white">Transaction Receipt</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
          >
            <StatusIcon className="h-4 w-4" />
            <span className="font-semibold">{statusConfig.label}</span>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-6">
          {/* Transaction Amount */}
          <div className="text-center py-4 bg-[#3a4d3c] rounded-2xl">
            <p className="text-sm text-gray-300 mb-1">Transaction Amount</p>
            <p className="text-4xl font-bold text-[#a3d65c]">${transaction.transactionAmount.toFixed(2)}</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[#3a4d3c] rounded-xl">
              <Calendar className="h-5 w-5 text-[#a3d65c] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Date & Time</p>
                <p className="text-sm font-semibold text-white">
                  {new Date(transaction.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-300">
                  {new Date(transaction.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#3a4d3c] rounded-xl">
              <CreditCard className="h-5 w-5 text-[#a3d65c] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Transaction Type</p>
                <p
                  className={`text-sm font-semibold ${transaction.type === "Credit" ? "text-[#a3d65c]" : "text-red-400"}`}
                >
                  {transaction.type === "Credit" ? "Deposit" : "Withdrawal"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[#3a4d3c] rounded-xl">
              <DollarSign className="h-5 w-5 text-[#a3d65c] mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Transaction ID</p>
                <p className="text-xs font-mono text-gray-300 break-all">{transaction._id}</p>
              </div>
            </div>

            {/* Wallet Details */}
            {transaction.walletId && (
              <div className="border-t border-[#3a4d3c] pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="h-5 w-5 text-[#a3d65c]" />
                  <h3 className="font-semibold text-white">Wallet Information</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#3a4d3c] rounded-xl">
                    <p className="text-xs text-[#a3d65c] mb-0.5">Wallet Label</p>
                    <p className="text-sm font-semibold text-white">{transaction.walletId.walletLabel}</p>
                  </div>

                  <div className="p-3 bg-[#3a4d3c] rounded-xl">
                    <p className="text-xs text-[#a3d65c] mb-0.5">Wallet Address</p>
                    <p className="text-xs font-mono text-white break-all">{transaction.walletId.walletAddress}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-center text-xs text-gray-400 pt-4 border-t border-[#3a4d3c]">
              Last updated: {new Date(transaction.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-[#3a4d3c] rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#a3d65c] text-[#2d3e2f] font-semibold rounded-xl hover:bg-[#8bc045] transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransactionReceiptModal
