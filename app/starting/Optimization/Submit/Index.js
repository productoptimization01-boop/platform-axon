

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import Image from "next/image"
import { useUsersContext } from "@/app/AllContext/UsersContext"
import CS from "@/app/Common/CustomerService/CS"

const ConfettiParticles = ({ isVisible }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            animation: `fall ${2 + Math.random() * 1.5}s linear infinite`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          <div
            className={`w-2 h-2 rounded-full ${["bg-[#a3d65c]", "bg-[#b8e986]", "bg-[#8bc34a]", "bg-[#9ccc65]", "bg-[#aed581]"][i % 5]
              }`}
            style={{
              boxShadow: `0 0 ${3 + Math.random() * 3}px currentColor`,
            }}
          />
        </div>
      ))}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

const TaskSubmissionDialog = ({ showTaskSubmissionDialog, task, setShowTaskSubmissionDialog, user, setTasksState, setTask }) => {
  const { saveTask, setUser } = useUsersContext()
  const [infoMessage, setInfoMessage] = useState("")
  const [productsWithValue, setProductsWithValue] = useState([])
  const [totalComboValue, setTotalComboValue] = useState(0)
  const isCombo = task?.orderType === "Combo"
  const [submitting, setSubmitting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showCSDialog, setShowCSDialog] = useState(false)
  const [continousCombo, setContinousCombo] = useState(0)

  // walletBalance

  useEffect(() => {
    if (isCombo && task.combo && task.combo.Products?.length > 0 && user) {
      const comboPrice = Number(task.combo.comboPrice || 0)
      const userTotalBalance = Number(user.totalBalance || 0)
      const totalValue = user.walletBalance === 0 ? userTotalBalance : comboPrice + userTotalBalance

      setTotalComboValue(totalValue)

      const perProductValue = totalValue / task.combo.Products.length

      const updatedProducts = task.combo.Products.map((p) => ({
        ...p,
        productValue: perProductValue,
      }))

      setProductsWithValue(updatedProducts)
      setShowConfetti(true)
    }
  }, [task, isCombo, user])

  const commissionPercentage = isCombo ? task.combo.commission || 9 : Number(user?.currentVIPLevel?.commission ?? 0)
  const commission = isCombo
    ? (totalComboValue * commissionPercentage) / 100
    : (task?.product?.productValue || 0) * (commissionPercentage / 100)

  const handleSubmitTask = async () => {
    if (!task || !user) return
    setSubmitting(true)

    if (user.walletBalance < 0 || continousCombo > 0) {
      setShowCSDialog(true)
      setSubmitting(false)
      return
    }

    try {
      const result = await saveTask({
        userId: user._id,
        orderType: task.orderType,
        combo: isCombo ? { ...task.combo, Products: productsWithValue } : null,
        product: !isCombo ? task.product : null,
        commission,
      })

      if (result) {

        // ==============================
        // CASE 1️⃣ : NEXT COMBO EXISTS
        // ==============================
        if (result.nextCombo && result.orderType === "Combo" && result.combo) {

          // 🔁 Replace current task with next combo data
          setContinousCombo((prevState) => prevState + 1)
          setTask(result)

          // 🔁 Update user
          setUser(result.user)

          setSubmitting(false)

          return // ⛔ stop here, don't run below logic
        }

        // ==============================
        // CASE 2️⃣ : NO NEXT COMBO (FINAL)
        // ==============================
        setShowTaskSubmissionDialog(false)
        setShowConfetti(false)
        setInfoMessage("")
        setUser(result.user)

        setTasksState((prevState) => prevState + 1)
      }

    } catch (err) {
      setInfoMessage("Failed to submit activity. Please try again.")
    }
    setSubmitting(false)
  }

  if (!task) return null

  const truncateName = (name, maxLength = 20) => {
    if (!name) return ""
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name
  }

  return (
    <>
      <ConfettiParticles isVisible={showConfetti && isCombo} />
      <Dialog open={showTaskSubmissionDialog} onOpenChange={setShowTaskSubmissionDialog}>
        <DialogContent
          className={`w-[95vw] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto ${isCombo
            ? "bg-gradient-to-br from-[#2d3e2f] via-[#3d4f3f] to-[#2d3e2f] border-2 border-[#a3d65c] shadow-2xl"
            : "bg-[#3d4f3f] border border-[#a3d65c]/30"
            } rounded-3xl`}
        >
          <div className={`pt-4 sm:pt-6 px-4 sm:px-6 text-center ${isCombo ? "animate-pulse" : ""}`}>
            {isCombo && (
              <div className="mb-3 sm:mb-4 flex justify-center gap-2">
                <LucideIcons.Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#a3d65c] animate-spin" />
                <LucideIcons.Star className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#b8e986] animate-bounce" />
                <LucideIcons.Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-[#a3d65c] animate-spin" />
              </div>
            )}

            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-2 tracking-tight ${isCombo ? "text-[#a3d65c]" : "text-white"
                }`}
            >
              {isCombo ? "🎁 PREMIUM COMBO!" : "Activity Submission"}
            </h2>

            {isCombo && (
              <p className="text-xs sm:text-sm font-semibold text-[#b8e986] mb-3 sm:mb-4 px-2">
                Congratulations! You won a special combo opportunity
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6 py-4 sm:py-6 px-4 sm:px-6">
            {isCombo && (
              <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] p-4 sm:p-6 shadow-xl transform hover:scale-105 transition-transform">
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm"></div>
                <div className="relative text-center">
                  <p className="text-xs sm:text-sm font-semibold text-[#2d3e2f]/80 uppercase tracking-widest mb-1 sm:mb-2">
                    Total Combo Value
                  </p>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#2d3e2f] drop-shadow-lg">
                    -${(task.combo?.comboPrice ?? 0).toFixed(2)}
                  </h3>

                  <div className="flex justify-center gap-2 mt-2 sm:mt-3">
                    <span className="px-2 sm:px-3 py-1 bg-[#2d3e2f]/20 rounded-full text-xs sm:text-sm font-bold text-[#2d3e2f] backdrop-blur">
                      {task.combo?.Products?.length || 0} Products
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div
              className={`grid ${isCombo ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4" : "gap-4"} justify-items-center`}
            >
              {(isCombo ? productsWithValue : [task.product]).map((p, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center w-full transform transition-all duration-500 ${isCombo ? `animate-bounce hover:scale-110` : ""
                    }`}
                  style={isCombo ? { animationDelay: `${idx * 100}ms` } : {}}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl border-3 ${isCombo ? "border-[#a3d65c] bg-[#2d3e2f]" : "border-[#a3d65c]/30 bg-[#2d3e2f]"
                      } w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 hover:shadow-2xl transition-all`}
                  >
                    <Image
                      src={p.productImage?.url || "/placeholder.svg"}
                      alt={p.productName}
                      fill
                      className="object-cover"
                    />
                    {isCombo && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>}
                  </div>

                  <div className="mt-2 sm:mt-3 text-center w-full px-1">
                    <p className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {truncateName(p.productName, 15)}
                    </p>
                    <p className={`text-base sm:text-lg font-black ${isCombo ? "text-[#a3d65c]" : "text-[#a3d65c]"}`}>
                      ${p.productValue?.toFixed(2)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 font-medium">{p.taskCode || "-"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`space-y-3 p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 shadow-lg ${isCombo ? "bg-[#2d3e2f] border-[#a3d65c]" : "bg-[#2d3e2f] border-[#a3d65c]/30"
                }`}
            >
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                  <LucideIcons.TrendingUp
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${isCombo ? "text-[#a3d65c]" : "text-[#a3d65c]"}`}
                  />
                  <span className={`text-sm sm:text-base font-semibold ${isCombo ? "text-white" : "text-white"}`}>
                    Your Commission
                  </span>
                </div>
                <div className="text-right">
                  <p className={`text-xl sm:text-2xl font-black ${isCombo ? "text-[#a3d65c]" : "text-[#a3d65c]"}`}>
                    ${commission.toFixed(2)}
                  </p>
                  <p className={`text-[10px] sm:text-xs font-semibold ${isCombo ? "text-gray-400" : "text-gray-400"}`}>
                    {commissionPercentage}% commission
                  </p>
                </div>
              </div>
            </div>

            {infoMessage && (
              <div className="text-sm sm:text-base text-red-400 font-bold text-center bg-red-900/30 p-3 sm:p-4 rounded-xl border border-red-500/30">
                {infoMessage}
              </div>
            )}

            <Button
              onClick={handleSubmitTask}
              disabled={submitting}
              className={`w-full h-12 sm:h-14 text-base sm:text-lg font-black rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-75 disabled:cursor-not-allowed ${isCombo
                ? "bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] hover:from-[#8bc34a] hover:to-[#a3d65c] text-[#2d3e2f]"
                : "bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] hover:from-[#8bc34a] hover:to-[#a3d65c] text-[#2d3e2f]"
                }`}
            >
              <LucideIcons.CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {submitting ? "Processing..." : isCombo ? "Claim Combo" : "Submit Activity"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCSDialog} onOpenChange={setShowCSDialog}>
        <CS userId={user._id} username={user.username} />
      </Dialog>
    </>
  )
}

export default TaskSubmissionDialog
