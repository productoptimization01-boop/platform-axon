"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import * as LucideIcons from "lucide-react"
import { useUsersContext } from "../AllContext/UsersContext"
import Bottom from "@/app/Common/Bottom/Bottom"

export default function RecordsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)
  const [taskRecords, setTaskRecords] = useState([])
  const [totalTasks, setTotalTasks] = useState(0)
  const { user, fetchTasks, getCombos } = useUsersContext()
  const [profilePhotoLink, setProfilePhotoLink] = useState("")
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "{}")
      if (stored.profile?.photoLink) setProfilePhotoLink(stored.profile.photoLink)
    } catch (e) {}
  }, [])

  const notifications = [
    "🎉 Important update regarding service changes. Please check your inbox for details.",
    "🚀 NEW EVENT: Coming soon! Stay tuned for more information.",
    "💎 Don't miss out on our special VIP offers!",
  ]

  useEffect(() => {
    const loadTasks = async () => {
      if (!user?._id) return
      setLoading(true)

      // ==============================
      // FETCH DATA
      // ==============================
      const tasks = await fetchTasks(user._id)
      const combos = await getCombos(user._id)

      // ==============================
      // VIP LOGIC
      // ==============================
      const vipLevel = user.currentVIPLevel?.number || 1
      let commissionRate = 0.004
      let totalTasksCount = 40

      switch (vipLevel) {
        case 1:
          commissionRate = 0.004
          totalTasksCount = 40
          break
        case 2:
          commissionRate = 0.006
          totalTasksCount = 45
          break
        case 3:
          commissionRate = 0.008
          totalTasksCount = 50
          break
        case 4:
          commissionRate = 0.01
          totalTasksCount = 55
          break
        default:
          commissionRate = 0.004
      }

      setTotalTasks(totalTasksCount)

      // ==============================
      // REGULAR TASKS (combo = null)
      // ==============================
      const formattedTasks = tasks
        .filter(t => t.combo == null)
        .map(t => {
          const value = t.product?.productValue || 0
          return {
            id: t._id,
            productName: t.product?.productName || "Unnamed Product",
            taskCode: t.product?.taskCode || "N/A",
            productImage: t.product?.productImage?.url || "/placeholder.svg",
            value,
            commission: +(value * commissionRate).toFixed(2),
            status: t.status,
            submittedAt: t.createdAt,
            completedAt: t.updatedAt,
          }
        })

      // ==============================
      // COMBOS - merge consecutive same comboAt
      // ==============================
      let formattedCombos = combos.map(combo => {
        const rate = combo.commission || 0;

        return {
          id: combo._id,
          isCombo: true,
          comboAt: combo.comboAt,
          status: combo.status,
          submittedAt: combo.createdAt,
          comboProducts: combo.Products.map(p => ({
            taskCode: p.taskCode,
            productName: p.productName,
            productImage: p.productImage?.url || "/placeholder.svg",
            value: p.productValue,
            commission: +((p.productValue * rate) / 100).toFixed(2),
            status: combo.status, // ✅ product carries its own status
          })),
          totalValue: combo.comboPrice,
          totalCommission: combo.Products.reduce(
            (sum, p) => sum + +((p.productValue * rate) / 100).toFixed(2),
            0
          ),
        };
      });

      // ✅ Merge consecutive combos with same comboAt
      formattedCombos.sort((a, b) => a.comboAt - b.comboAt);
      const mergedComboGroups = [];

      formattedCombos.forEach(combo => {
        const lastGroup = mergedComboGroups[mergedComboGroups.length - 1];

        if (lastGroup && lastGroup.comboAt === combo.comboAt) {
          // Merge products and sums into last group
          lastGroup.comboProducts.push(...combo.comboProducts);
          lastGroup.totalValue += combo.totalValue;
          lastGroup.totalCommission += combo.totalCommission;
        } else {
          // New group for different comboAt
          mergedComboGroups.push({ ...combo });
        }
      });

      formattedCombos = mergedComboGroups; // Use this merged array for later


      // ==============================
      // MERGE TASKS + COMBOS
      // ==============================
      let mergedRecords = [...formattedTasks]

      formattedCombos.forEach(combo => {
        const insertIndex = Math.max(0, (mergedRecords.length + 1) - combo.comboAt)
        mergedRecords.splice(insertIndex, 0, combo)
      })

      setTaskRecords(mergedRecords)
      setLoading(false)
    }

    loadTasks()
  }, [user, fetchTasks, getCombos])

  // ==============================
  // FILTERING
  // ==============================
  const filteredRecords = taskRecords.filter(record => {
    if (record.isCombo) {
      const matchesSearch = record.comboProducts.some(
        p =>
          p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.taskCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const matchesStatus =
        filterStatus === "all" ||
        record.comboProducts.some(p => p.status === filterStatus)

      return matchesSearch && matchesStatus
    } else {
      const matchesSearch =
        record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.taskCode.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === "all" || record.status === filterStatus
      return matchesSearch && matchesStatus
    }
  })

  const completedTasks =
  // 1️⃣ Regular tasks (combo: null)
  taskRecords.filter(
    r => !r.isCombo && r.status === "completed"
  ).length
  +
  // 2️⃣ Combo tasks (1 combo = 1 task)
  taskRecords.filter(
    r =>
      r.isCombo &&
      r.comboProducts.every(p => p.status === "completed")
  ).length


  const processingTasks = taskRecords.filter((r) => r.status === "processing").length
  const failedTasks = taskRecords.filter((r) => r.status === "failed").length
  const totalEarnings = taskRecords.reduce((sum, r) => {

    // ✅ REGULAR TASK
    if (!r.isCombo) {
      return r.status === "completed"
        ? sum + r.commission
        : sum
    }

    // ✅ COMBO TASK → only completed products
    const completedComboCommission = r.comboProducts
      .filter(p => p.status === "completed")
      .reduce((cSum, p) => cSum + p.commission, 0)

    return sum + completedComboCommission

  }, 0)

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-[#a3d65c] text-[#1a2617] border-[#8bc34a] hover:bg-[#8bc34a]">
            <LucideIcons.CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200 hover:from-yellow-200 hover:to-orange-200">
            <LucideIcons.Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200 hover:from-red-200 hover:to-pink-200">
            <LucideIcons.XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500 text-white">
            <LucideIcons.AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#3a4d3c]/95 border-b border-[#4a5d4c] shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#a3d65c] flex items-center justify-center">
              <LucideIcons.Zap className="h-6 w-6 text-[#1a2617]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Axon</h1>
          </Link>
          <div className="flex items-center gap-3 relative">
            <Link
              href="/profile"
              className="text-gray-300 hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#3a4d3c] p-1"
              title="Profile"
            >
              {(profilePhotoLink || (user.profile?.photoLink && user.profile.photoLink !== "none" ? user.profile.photoLink : "") || (user.profileimage && user.profileimage !== "none" ? user.profileimage : "")) ? (
                <img src={profilePhotoLink || user.profile?.photoLink || user.profileimage} alt={user.username} className="w-8 h-8 rounded-full object-cover border border-[#a3d65c]/50" />
              ) : (
                <LucideIcons.UserCircle className="h-6 w-6" />
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 pb-32 lg:pb-48">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-[#a3d65c]">
              <LucideIcons.ClipboardList className="h-6 w-6 text-[#1a2617]" />
            </div>
            <h1 className="text-3xl font-bold text-white">Activity Records</h1>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="p-4 bg-[#3a4d3c] border border-[#4a5d4c] rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#a3d65c]">
                  <LucideIcons.Target className="h-4 w-4 text-[#1a2617]" />
                </div>
                <span className="text-sm font-medium text-gray-300">Total Activities</span>
              </div>
              <p className="text-2xl font-bold text-[#a3d65c]">{totalTasks}</p>
            </Card>

            <Card className="p-4 bg-[#3a4d3c] border border-[#4a5d4c] rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#8bc34a]">
                  <LucideIcons.CheckCircle className="h-4 w-4 text-[#1a2617]" />
                </div>
                <span className="text-sm font-medium text-gray-300">Completed</span>
              </div>
              <p className="text-2xl font-bold text-[#8bc34a]">{completedTasks}</p>
            </Card>

            <Card className="p-4 bg-[#3a4d3c] border border-[#4a5d4c] rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600">
                  <LucideIcons.Clock className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-300">Processing</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">{processingTasks}</p>
            </Card>

            <Card className="p-4 bg-[#3a4d3c] border border-[#4a5d4c] rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600">
                  <LucideIcons.XCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-300">Failed</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{failedTasks}</p>
            </Card>

            <Card className="p-4 bg-[#3a4d3c] border border-[#4a5d4c] rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[#a3d65c]">
                  <LucideIcons.DollarSign className="h-4 w-4 text-[#1a2617]" />
                </div>
                <span className="text-sm font-medium text-gray-300">Total Earned</span>
              </div>
              <p className="text-2xl font-bold text-[#a3d65c]">${totalEarnings.toFixed(2)}</p>
            </Card>
          </div>

          {/* Search & Filter + Records List */}
          <Card className="p-6 bg-[#3a4d3c] shadow-xl border border-[#4a5d4c] rounded-3xl">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product name or activity code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl bg-[#2d3e2f] border-[#4a5d4c] text-white placeholder:text-gray-500 focus:border-[#a3d65c] focus:ring-[#a3d65c]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${filterStatus === "all" ? "bg-[#a3d65c] text-[#1a2617] hover:bg-[#8bc34a]" : "bg-[#2d3e2f] border border-[#4a5d4c] text-slate-200 hover:bg-[#3a4d3c] hover:text-[#a3d65c]"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("completed")}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${filterStatus === "completed" ? "bg-[#a3d65c] text-[#1a2617] hover:bg-[#8bc34a]" : "bg-[#2d3e2f] border border-[#4a5d4c] text-slate-200 hover:bg-[#3a4d3c] hover:text-[#a3d65c]"}`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilterStatus("processing")}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${filterStatus === "processing" ? "bg-[#a3d65c] text-[#1a2617] hover:bg-[#8bc34a]" : "bg-[#2d3e2f] border border-[#4a5d4c] text-slate-200 hover:bg-[#3a4d3c] hover:text-[#a3d65c]"}`}
                >
                  Processing
                </button>
                <button
                  onClick={() => setFilterStatus("failed")}
                  className={`px-4 py-2 rounded-xl font-semibold transition-colors ${filterStatus === "failed" ? "bg-[#a3d65c] text-[#1a2617] hover:bg-[#8bc34a]" : "bg-[#2d3e2f] border border-[#4a5d4c] text-slate-200 hover:bg-[#3a4d3c] hover:text-[#a3d65c]"}`}
                >
                  Failed
                </button>
              </div>
            </div>

            {/* Records List */}
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-gray-400 py-6">Loading activities...</p>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  if (record.isCombo) {
                    return (
                      <Card
                        key={record.id}
                        className="p-5 bg-gradient-to-br from-[#3a4d3c] to-[#2d3e2f] border-2 border-[#a3d65c] rounded-2xl hover:shadow-2xl hover:border-[#8bc34a] transition-all duration-300"
                      >
                        {/* Combo Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#4a5d4c]">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[#a3d65c]">
                              <LucideIcons.Package className="h-5 w-5 text-[#1a2617]" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">Combo Activity Group</h3>
                              <p className="text-sm text-gray-400">{record.comboProducts.length} Products</p>
                            </div>
                          </div>
                          {/* {getStatusBadge(record.status)} */}
                        </div>

                        {/* Combo Products Grid */}
                        <div className="space-y-3 mb-4">
                          {record.comboProducts.map((product, index) => (
                            <div
                              key={`${record.id}-${product.taskCode}`}
                              className="flex items-center gap-3 p-3 bg-[#2d3e2f] rounded-xl border border-[#4a5d4c]"
                            >
                              <div className="relative overflow-hidden rounded-lg border border-[#4a5d4c]">
                                <Image
                                  src={product.productImage || "/placeholder.svg"}
                                  alt={product.productName}
                                  width={50}
                                  height={50}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold text-white truncate">
                                    {product.productName}
                                  </h4>
                                  {getStatusBadge(product.status)} {/* ✅ REAL STATUS */}
                                </div>

                                <div className="flex flex-wrap gap-3 text-xs text-gray-400 mt-1">
                                  <span>
                                    Code: <span className="text-[#a3d65c] font-mono">{product.taskCode}</span>
                                  </span>
                                  <span>
                                    Value: <span className="text-white font-semibold">${product.value.toFixed(2)}</span>
                                  </span>
                                  <span>
                                    Commission:{" "}
                                    <span className="text-[#8bc34a] font-semibold">
                                      ${product.commission.toFixed(2)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Combo Summary */}
                        <div className="flex items-center justify-between p-4 bg-[#2d3e2f] rounded-xl border border-[#a3d65c]">
                          <div className="grid grid-cols-2 gap-4 flex-1">
                            <div>
                              <span className="text-sm font-medium text-gray-300">Total Value:</span>
                              <p className="text-lg font-bold text-white">${record.totalValue.toFixed(2)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-300">Total Commission:</span>
                              <p className="text-lg font-bold text-[#a3d65c]">${record.totalCommission.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-300">Submitted:</span>
                            <p className="text-sm text-gray-400">{new Date(record.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  }

                  // Regular task card
                  return (
                    <Card
                      key={record.id}
                      className="p-4 bg-[#2d3e2f] border border-[#4a5d4c] rounded-2xl hover:shadow-lg hover:border-[#a3d65c] transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative overflow-hidden rounded-xl border-2 border-[#4a5d4c] shadow-md">
                          <Image
                            src={record.productImage || "/placeholder.svg"}
                            alt={record.productName}
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="text-lg font-bold text-white truncate">{record.productName}</h3>
                            {getStatusBadge(record.status)}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <LucideIcons.FileText className="h-4 w-4 text-[#a3d65c]" />
                              <span className="font-mono text-[#a3d65c]">{record.taskCode}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <LucideIcons.DollarSign className="h-4 w-4 text-white" />
                              <span className="text-white font-semibold">${record.value.toFixed(2)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <LucideIcons.TrendingUp className="h-4 w-4 text-[#8bc34a]" />
                              <span className="text-[#8bc34a] font-semibold">${record.commission.toFixed(2)}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <LucideIcons.Clock className="h-3 w-3" />
                              Submitted: {new Date(record.submittedAt).toLocaleDateString()}
                            </span>
                            {record.status === "completed" && record.completedAt && (
                              <span className="flex items-center gap-1">
                                <LucideIcons.CheckCircle className="h-3 w-3" />
                                Completed: {new Date(record.completedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })
              ) : (
                <p className="text-center text-gray-400 py-6">No activities found matching your criteria.</p>
              )}
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Bottom />
    </div>
  )
}
