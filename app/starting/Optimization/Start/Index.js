"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useUsersContext } from "@/app/AllContext/UsersContext"
import { Dialog } from "@/components/ui/dialog"
import CS from "@/app/Common/CustomerService/CS"
import { fetchAdminSettings, DEFAULT_SETTINGS } from "@/lib/admin-settings"

const Index = ({ user, setShowTaskSubmissionDialog, setTask, starting, setStarting, tasksState, setTasksState }) => {
  const { fetchOptimizationProducts, fetchTasks, getTaskForUser, setUser } = useUsersContext()
  const [shuffled, setShuffled] = useState([])
  const [showCSModal, setShowCSModal] = useState(false)
  const [csMessage, setCSMessage] = useState("")
  const [workingHours, setWorkingHours] = useState(DEFAULT_SETTINGS.workingHours)
  const [completedSets, setCompletedSets] = useState({ today: 0, total: 0 })
  useEffect(() => {
    if (!user?._id) return
    fetch(`https://platform-axon-rust.vercel.app/api/combo/completed-sets/${user._id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setCompletedSets({ today: d.today || 0, total: d.total || 0 }) })
      .catch(() => {})
  }, [user?._id, tasksState])
  useEffect(() => { fetchAdminSettings().then((s) => setWorkingHours(s.workingHours || DEFAULT_SETTINGS.workingHours)) }, [])

  const fetchTasksAndSetState = async () => {
    if (!user?._id) return
    const result = await fetchTasks(user._id)
    setTasksState(result?.length || 0)
  }

  useEffect(() => {
    fetchTasksAndSetState()
  }, [user])

  const shuffleArray = (array) => {
    const newArr = [...array]
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
    }
    return newArr
  }

  // Working hours are admin-controlled (Req 12). When disabled, the
  // platform is available 24 hours; otherwise the admin-set window in
  // the configured timezone applies (defaults: 09:30-21:30 Eastern).
  const isWithinEasternWorkingHours = () => {
    if (!workingHours?.enabled) return true
    const now = new Date()
    const easternTimeString = now.toLocaleString("en-US", {
      timeZone: workingHours.timezone || "America/New_York",
    })
    const easternTime = new Date(easternTimeString)
    const totalMinutes = easternTime.getHours() * 60 + easternTime.getMinutes()
    return totalMinutes >= (workingHours.startMinutes ?? 570) && totalMinutes <= (workingHours.endMinutes ?? 1290)
  }

  const handleStartOptimization = async () => {
    if (!user?._id) return

    // ✅ Working hours check
    if (!isWithinEasternWorkingHours()) {
      setCSMessage(`Platform working hours are from ${workingHours.startLabel} to ${workingHours.endLabel} Eastern Time`)
      setShowCSModal(true)
      return
    }

    if (user.walletBalance < 0) {
      setShowCSModal(true)
      setCSMessage("Please contact the live support")
      setStarting(false)
      return
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("axon-activity", { detail: { activity: "Starting optimization" } }))
    }
    setStarting(true)

    const totalTasks =
      user?.currentVIPLevel.number === 1
        ? 40
        : user?.currentVIPLevel.number === 2
          ? 45
          : user?.currentVIPLevel.number === 3
            ? 50
            : 55

    if (tasksState >= totalTasks) {
      setStarting(false)
      setCSMessage("You've completed your set, please contact support to get reset")
      setShowCSModal(true)
      return
    }
    if (user.totalBalance < 70) {
      setCSMessage("Minimum required balance to start optimization is $70")
      setShowCSModal(true)
      return
    }

    try {
      const taskNo = tasksState === 0 ? 1 : tasksState + 1
      const taskResult = await getTaskForUser(user._id, taskNo)
      setUser(taskResult.user)

      setTask(taskResult)
      setShowTaskSubmissionDialog(true)
    } catch (error) {
      console.error("handleStartOptimization error:", error)
    }
    setStarting(false)
  }

  useEffect(() => {
    const fetchAndShuffle = async () => {
      if (!user?._id) return

      const products = await fetchOptimizationProducts(8)
      setShuffled(shuffleArray(products))
    }

    fetchAndShuffle()

    const interval = setInterval(() => {
      fetchAndShuffle()
    }, 8000)

    return () => clearInterval(interval)
  }, [user?._id])

  const getItem = (idx) => shuffled[idx] || null

  const totalTasks =
    user?.currentVIPLevel.number === 1
      ? 40
      : user?.currentVIPLevel.number === 2
        ? 45
        : user?.currentVIPLevel.number === 3
          ? 50
          : 55

  return (
    <>
      <div className="w-full">
        <Card className="relative p-4 lg:p-6 bg-[#3d4f3f] shadow-2xl border border-[#a3d65c]/30 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a3d65c]/5 to-transparent"></div>
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#a3d65c]/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="mb-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#a3d65c] to-[#8bc34a] shadow-md">
                  <LucideIcons.Sparkles className="h-6 w-6 text-[#2d3e2f]" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">Product Optimization</h2>
                  <p className="text-xs lg:text-sm text-gray-300 mt-1">
                    Optimize your products and complete tasks to earn rewards
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 lg:mb-8 p-3 lg:p-5 bg-[#2d3e2f] rounded-xl border border-[#a3d65c]/30 shadow-sm backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] shadow-sm">
                    <LucideIcons.Target className="h-5 w-5 text-[#2d3e2f]" />
                  </div>
                  <span className="text-sm lg:text-base font-semibold text-white">Activity Progress</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl lg:text-2xl font-bold text-[#a3d65c]">{tasksState}</div>
                    <div className="text-xs text-gray-400">of {totalTasks}</div>
                  </div>
                  <div className="h-12 w-1 bg-gradient-to-b from-[#a3d65c] to-[#8bc34a] rounded-full"></div>
                </div>
              </div>

              <div className="mt-4 h-2 bg-[#2d3e2f] rounded-full overflow-hidden border border-[#a3d65c]/20">
                <div
                  className="h-full bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] rounded-full transition-all duration-500"
                  style={{ width: `${(tasksState / totalTasks) * 100}%` }}
                ></div>
              </div>
              <div className="mt-4 flex items-center gap-6 text-sm">
                <span className="text-gray-300">Sets Completed Today: <span className="font-bold text-[#a3d65c]">{completedSets.today}</span></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:gap-4 items-center justify-items-center">
              {[0, 1, 2].map((i) => {
                const item = getItem(i)
                return (
                  <div key={`top-${i}`} className="w-full flex justify-center">
                    <div className="relative overflow-hidden rounded-xl border-2 border-[#a3d65c]/30 shadow-md bg-[#2d3e2f] backdrop-blur-lg p-1">
                      <Image
                        src={item?.productImage?.url || "/placeholder.svg"}
                        alt={item?.productName || "Product"}
                        width={100}
                        height={100}
                        className="w-full h-auto object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )
              })}

              <div className="w-full flex justify-center">
                <div className="relative overflow-hidden rounded-xl border-2 border-[#a3d65c]/30 shadow-md bg-[#2d3e2f] backdrop-blur-lg p-1">
                  <Image
                    src={getItem(3)?.productImage?.url || "/placeholder.svg"}
                    alt={getItem(3)?.productName || "Product"}
                    width={100}
                    height={100}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center w-full relative">
                {/* Lightning/spark effect rings when starting */}
                {starting && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-32 sm:w-36 md:w-40 lg:w-72 h-32 sm:h-36 md:h-40 lg:h-72 rounded-full border-4 border-[#a3d65c] animate-ping opacity-75"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-28 sm:w-32 md:w-36 lg:w-64 h-28 sm:h-32 md:h-36 lg:h-64 rounded-full border-2 border-[#8bc34a] animate-pulse opacity-50"></div>
                    </div>
                    {/* Spark icons rotating around */}
                    <div className="absolute inset-0 flex items-center justify-center animate-spin">
                      <LucideIcons.Zap className="absolute -top-2 lg:-top-4 w-6 h-6 lg:w-8 lg:h-8 text-[#a3d65c] drop-shadow-lg" />
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center animate-spin"
                      style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                    >
                      <LucideIcons.Sparkles className="absolute -bottom-2 lg:-bottom-4 w-6 h-6 lg:w-8 lg:h-8 text-[#8bc34a] drop-shadow-lg" />
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center animate-spin"
                      style={{ animationDuration: "2s" }}
                    >
                      <LucideIcons.Zap className="absolute -left-2 lg:-left-4 w-5 h-5 lg:w-7 lg:h-7 text-[#a3d65c] drop-shadow-lg" />
                    </div>
                    <div
                      className="absolute inset-0 flex items-center justify-center animate-spin"
                      style={{ animationDirection: "reverse", animationDuration: "2.5s" }}
                    >
                      <LucideIcons.Sparkles className="absolute -right-2 lg:-right-4 w-5 h-5 lg:w-7 lg:h-7 text-[#8bc34a] drop-shadow-lg" />
                    </div>
                  </>
                )}

                <Button
                  onClick={handleStartOptimization}
                  disabled={starting}
                  className={`
                  relative
                  w-24 sm:w-28 md:w-32 lg:w-60
                  h-24 sm:h-28 md:h-32 lg:h-60
                  rounded-full
                  bg-gradient-to-br from-[#a3d65c] to-[#8bc34a]
                  hover:from-[#8bc34a] hover:to-[#a3d65c]
                  shadow-xl hover:shadow-2xl
                  transition-all duration-300
                  disabled:opacity-90 disabled:cursor-not-allowed
                  text-[#2d3e2f]
                  font-extrabold
                  flex items-center justify-center
                  border-4 border-[#a3d65c]/40
                  ${starting ? "animate-spin shadow-[0_0_40px_rgba(163,214,92,0.8)]" : ""}
                `}
                  style={starting ? { animationDuration: "2s" } : {}}
                >
                  <span
                    className={`text-xl sm:text-2xl md:text-3xl lg:text-5xl tracking-wide select-none ${starting ? "animate-pulse" : ""}`}
                  >
                    {starting ? "" : "Start"}
                  </span>
                </Button>
              </div>

              <div className="w-full flex justify-center">
                <div className="relative overflow-hidden rounded-xl border-2 border-[#a3d65c]/30 shadow-md bg-[#2d3e2f] backdrop-blur-lg p-1">
                  <Image
                    src={getItem(4)?.productImage?.url || "/placeholder.svg"}
                    alt={getItem(4)?.productName || "Product"}
                    width={100}
                    height={100}
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </div>

              {[5, 6, 7].map((i) => {
                const item = getItem(i)
                return (
                  <div key={`bottom-${i}`} className="w-full flex justify-center">
                    <div className="relative overflow-hidden rounded-xl border-2 border-[#a3d65c]/30 shadow-md bg-[#2d3e2f] backdrop-blur-lg p-1">
                      <Image
                        src={item?.productImage?.url || "/placeholder.svg"}
                        alt={item?.productName || "Product"}
                        width={100}
                        height={100}
                        className="w-full h-auto object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Dialog open={showCSModal} onOpenChange={setShowCSModal}>
          <CS message={csMessage} userId={user._id} username={user.username} />
        </Dialog>
      </div>
    </>
  )
}

export default Index
