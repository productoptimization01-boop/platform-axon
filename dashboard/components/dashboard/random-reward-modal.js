"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Gift, Loader2 } from "lucide-react"
import { useDashboard } from "@/app/AllContext/DashboardContext"
import { useUsersContext } from "@/app/AllContext/UsersContext"
import { useToast } from "@/hooks/use-toast"

export default function RandomRewardModal({ user, onClose }) {
    const [rewardAmount, setRewardAmount] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [letClear, setLetClear] = useState(false)

    const { updateUserAPI } = useDashboard()
    const { createTransactionAPI } = useUsersContext()
    const { toast } = useToast()

    // Effect to manage the checkbox state based on wallet balance
    useEffect(() => {
        if (user.walletBalance < 0 && Number.parseFloat(rewardAmount) >= Math.abs(user.walletBalance)) {
            // If wallet balance is negative, check the checkbox and disable it
            setLetClear(true)
        } else {
            // If wallet balance is positive, uncheck the checkbox and disable it
            setLetClear(false)
        }
    }, [user.walletBalance, rewardAmount])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!rewardAmount || Number.parseFloat(rewardAmount) <= 0) {
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid reward amount",
                variant: "destructive",
            })
            return
        }

        setIsSubmitting(true)

        try {
            const amount = Number.parseFloat(rewardAmount)

            // Step 1: Create transaction
            const transactionData = {
                userId: user._id,
                transactionAmount: amount,
                status: "Successful",
                type: "Credit",
            }

            const transactionResult = await createTransactionAPI(transactionData)

            if (transactionResult.error) {
                throw new Error(transactionResult.error)
            }

            // Step 2: Update user balance
            const updatedUserData = {
                totalBalance: user.totalBalance + amount,
                walletBalance: user.walletBalance + amount,
                letClear: letClear,
            };

            const updatedUser = await updateUserAPI(user._id, updatedUserData)

            if (!updatedUser) {
                throw new Error("Failed to update user")
            }

            toast({
                title: "Reward Added Successfully",
                description: `${user.username} received $${amount} reward`,
            })

            setRewardAmount("")
            onClose()
        } catch (error) {
            console.error("Random Reward Error:", error)
            toast({
                title: "Error",
                description: error.message || "Failed to add reward",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-slate-800 border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Gift className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100">Deposit balance</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-100 hover:bg-slate-700 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                        <p className="text-sm text-slate-400 mb-1">Adding balance to user</p>
                        <p className="text-xl font-bold text-slate-100">{user.username}</p>
                        <p className="text-sm text-slate-500 mt-1">Phone: {user.phone}</p>
                    </div>

                    {/* Reward Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300">Amount ($)</label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Enter reward amount"
                            value={rewardAmount}
                            onChange={(e) => setRewardAmount(e.target.value)}
                            className="h-12 bg-slate-900/60 border-2 border-slate-700 rounded-xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 text-slate-100 placeholder:text-slate-500"
                            required
                        />
                    </div>

                    {/* Allow User to Clear Combo */}
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            id="letClear"
                            checked={letClear}
                            onChange={(e) => setLetClear(e.target.checked)}
                            className="w-5 h-5 text-yellow-500 bg-slate-900 border-slate-700 rounded focus:ring-yellow-500"
                            disabled={true}
                        />
                        <label htmlFor="letClear" className="text-sm font-medium text-slate-300">
                            Allow User to Clear Combo
                        </label>
                    </div>

                    {/* Current Balance Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Current Wallet</p>
                            <p className="text-lg font-bold text-green-400">${user.walletBalance.toFixed(2)}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Current Total</p>
                            <p className="text-lg font-bold text-blue-400">${user.totalBalance.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-700 bg-transparent"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Gift className="h-4 w-4 mr-2" />
                                    Add Balance
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    )
}
