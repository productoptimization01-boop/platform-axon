"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUsersContext } from "../../app/AllContext/UsersContext"
import { useDashboard } from "@/app/AllContext/DashboardContext"

export default function UserTasks({ userId, onClose, userDetails }) {
  const { fetchProducts, createCombo, getCombosByUser, updateCombo, deleteCombo, resetUserData, refreshTasksForToday, getCompletedSets } = useUsersContext()
  const { users, updateUserAPI } = useDashboard()

  const { toast } = useToast()

  const [comboAt, setComboAt] = useState("")
  const [comboPrice, setComboPrice] = useState("")
  const [productCount, setProductCount] = useState("")
  const [products, setProducts] = useState([])
  const [combos, setCombos] = useState([])
  const [editingComboId, setEditingComboId] = useState(null)

  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCombos, setLoadingCombos] = useState(false)
  const [savingCombo, setSavingCombo] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState("")

  const [hasUserChanges, setHasUserChanges] = useState(false)
  const [localUserData, setLocalUserData] = useState(null)
  const [updatingUser, setUpdatingUser] = useState(false)

  const [commission, setCommission] = useState("9")

  useEffect(() => {
    const currentUser = users.find((u) => u._id === userId)
    if (currentUser) {
      setLocalUserData(currentUser)
    }
  }, [users, userId])

  // Load combos
  const loadCombos = async () => {
    setLoadingCombos(true)
    const data = await getCombosByUser(userId)
    setCombos(data)
    setLoadingCombos(false)
  }

  useEffect(() => {
    loadCombos()
  }, [])

  // Fetch products
  const handleFetchProducts = async () => {
    setError("")

    if (!productCount || Number(productCount) <= 0) {
      setError("Please enter a valid number of products.")
      return
    }

    try {
      setLoadingProducts(true)
      const items = await fetchProducts(productCount)

      if (!items.length) {
        setError("No products returned from server.")
        return
      }

      setProducts(items)
      toast({
        title: "Success",
        description: `${items.length} products fetched successfully`,
      })
    } catch (err) {
      setError("Failed to fetch products.")
    } finally {
      setLoadingProducts(false)
    }
  }

  // Save / Update combo
  const handleSaveCombo = async () => {
    setError("")

    if (!comboAt || !comboPrice || products.length === 0) {
      setError("Please fill all fields and fetch products first.")
      return
    }

    const payload = {
      userId,
      comboAt: Number(comboAt),
      comboPrice: Number(comboPrice),
      commission: Number(commission),
      Products: products,
    }

    setSavingCombo(true)
    let result

    if (editingComboId) {
      result = await updateCombo(editingComboId, payload)
    } else {
      result = await createCombo(payload)
    }

    if (!result.success) {
      setError(result.error)
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      await loadCombos()
      resetForm()
      toast({
        title: "Success",
        description: editingComboId ? "Combo updated successfully" : "Combo created successfully",
      })
    }

    setSavingCombo(false)
  }

  // Delete combo
  const handleDelete = async (id) => {
    if (!confirm("Delete this combo?")) return

    const result = await deleteCombo(id)

    if (result.success) {
      loadCombos()
      toast({
        title: "Success",
        description: "Combo deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  // Edit combo
  const handleEdit = (combo) => {
    setEditingComboId(combo._id)
    setComboAt(combo.comboAt)
    setComboPrice(combo.comboPrice)
    setCommission(combo.commission ?? "9")
    setProducts(combo.Products)
  }


  // Reset input fields
  const resetForm = () => {
    setEditingComboId(null)
    setComboAt("")
    setComboPrice("")
    setCommission("9")
    setProductCount("")
    setProducts([])
  }

  // Reset all combos & tasks for this user
  const handleReset = async () => {
    if (!confirm("Are you sure you want to delete all combos and tasks for this user?")) return

    setResetting(true)

    const result = await resetUserData(userId)

    setResetting(false)

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "Failed to reset user data.",
        variant: "destructive",
      })
      return
    }

    setCombos([])
    resetForm()

    toast({
      title: "Reset Complete",
      description: `Deleted ${result.combosDeleted} combos and ${result.tasksDeleted} tasks`,
    })
  }

  const [refreshingToday, setRefreshingToday] = useState(false)
  const [completedSets, setCompletedSets] = useState({ today: 0, total: 0 })
  useEffect(() => {
    if (!userId) return
    getCompletedSets(userId).then((r) => { if (r.success) setCompletedSets({ today: r.today, total: r.total }) })
  }, [userId])
  const handleRefreshToday = async () => {
    if (!confirm("Refresh all tasks for today? This will start a new day for this user. Combos and tasks will be deleted, like Reset. If the user had a full completed set, it will be recorded first.")) return
    setRefreshingToday(true)
    const result = await refreshTasksForToday(userId)
    setRefreshingToday(false)
    if (!result.success) {
      toast({ title: "Error", description: result.error || "Failed to refresh tasks for today.", variant: "destructive" })
      return
    }
    toast({ title: "Tasks Refreshed for Today", description: result.completedSetRecorded ? "A completed set was recorded, then combos and tasks were refreshed for a new day." : "Combos and tasks were refreshed for a new day." })
    getCompletedSets(userId).then((r) => { if (r.success) setCompletedSets({ today: r.today, total: r.total }) })
  }

  const handleRechargeTraining = async () => {
    if (!localUserData) return

    // Generate random combo price between 230 and 245
    const randomComboPrice = Math.floor(Math.random() * (245 - 230 + 1)) + 230

    // Update local user data
    const updatedUserData = {
      ...localUserData,
      currentVIPLevel: {
        ...localUserData.currentVIPLevel,
        number: 2,
      },
      walletBalance: 1085,
      totalBalance: 1085,
      commissionTotal: 0,
      todayProfit: 0,
      transaction: 1060
    }

    setLocalUserData(updatedUserData)
    setHasUserChanges(true)

    // Auto set combo fields
    setComboAt("33")
    setComboPrice(randomComboPrice.toString())
    setProductCount("2")

    try {
      setLoadingProducts(true)
      const items = await fetchProducts("2")

      if (items.length) {
        setProducts(items)
        toast({
          title: "Training Account Configured",
          description: `User data updated and ${items.length} products fetched automatically.`,
        })
      }
    } catch (err) {
      toast({
        title: "Training Account Configured",
        description: "User data updated but failed to fetch products automatically.",
      })
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!localUserData || !hasUserChanges) return

    setUpdatingUser(true)

    const result = await updateUserAPI(userId, localUserData)

    setUpdatingUser(false)

    if (result) {
      setHasUserChanges(false)
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 border-b border-slate-700/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <LucideIcons.Package className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Combo Management</h2>
                <p className="text-blue-100 text-sm">Create and manage product combos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <LucideIcons.X className="text-white" size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="mb-6 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-5 border border-indigo-700/50">
            <div className="flex items-center gap-2 mb-4">
              <LucideIcons.Zap className="text-yellow-400" size={20} />
              <h3 className="text-lg font-semibold text-white">Training Account Actions</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRechargeTraining}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 flex items-center gap-2"
              >
                <LucideIcons.Zap size={18} />
                Recharge Training
              </Button>

              {hasUserChanges && (
                <Button
                  onClick={handleUpdateUser}
                  disabled={updatingUser}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 flex items-center gap-2 animate-pulse"
                >
                  {updatingUser ? (
                    <LucideIcons.Loader2 className="animate-spin" size={18} />
                  ) : (
                    <LucideIcons.Save size={18} />
                  )}
                  Update User
                </Button>
              )}
            </div>

            {localUserData && hasUserChanges && (
              <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                <p className="text-xs text-slate-400 mb-2">Pending Changes:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-300">
                    <span className="text-slate-500">VIP Level:</span> {localUserData.currentVIPLevel.number}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Wallet:</span> ${localUserData.walletBalance}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Total Balance:</span> ${localUserData.totalBalance}
                  </div>
                  <div className="text-slate-300">
                    <span className="text-slate-500">Commission:</span> ${localUserData.commissionTotal}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-4">
                  <LucideIcons.Plus className="text-purple-400" size={20} />
                  <h3 className="text-lg font-semibold text-white">
                    {editingComboId ? "Edit Combo" : "Create New Combo"}
                  </h3>
                </div>

                {error && (
                  <div className="mb-4 flex items-start gap-2 text-red-400 bg-red-900/20 p-3 rounded-xl border border-red-700/30">
                    <LucideIcons.AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <LucideIcons.Hash size={16} />
                      Combo At (Position)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter combo position"
                      value={comboAt}
                      onChange={(e) => setComboAt(e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <LucideIcons.DollarSign size={16} />
                      Combo Price
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter combo price"
                      value={comboPrice}
                      onChange={(e) => setComboPrice(e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <LucideIcons.Percent size={16} />
                      Combo Commission Rate (%)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter commission rate"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                    />
                  </div>


                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <LucideIcons.Package size={16} />
                      Number of Products
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Enter product count"
                        value={productCount}
                        onChange={(e) => setProductCount(e.target.value)}
                        className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500"
                      />
                      <Button
                        onClick={handleFetchProducts}
                        disabled={loadingProducts}
                        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shrink-0"
                      >
                        {loadingProducts ? (
                          <LucideIcons.Loader2 className="animate-spin" size={18} />
                        ) : (
                          <LucideIcons.Download size={18} />
                        )}
                      </Button>
                    </div>
                  </div>

                  {products.length > 0 && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-900/20 p-3 rounded-xl border border-emerald-700/30">
                      <LucideIcons.CheckCircle size={18} />
                      <p className="text-sm font-medium">{products.length} products loaded</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveCombo}
                      disabled={savingCombo}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
                    >
                      {savingCombo ? (
                        <LucideIcons.Loader2 className="animate-spin mr-2" size={18} />
                      ) : (
                        <LucideIcons.Save className="mr-2" size={18} />
                      )}
                      {editingComboId ? "Update Combo" : "Save Combo"}
                    </Button>

                    {editingComboId && (
                      <Button onClick={resetForm} className="bg-slate-700 hover:bg-slate-600">
                        <LucideIcons.X size={18} />
                      </Button>
                    )}
                  </div>

                  <p className="text-sm text-slate-300">Sets Completed Today: <span className="font-bold text-white">{completedSets.today}</span></p>
                  <Button
                    onClick={handleRefreshToday}
                    disabled={refreshingToday}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                  >
                    {refreshingToday ? (
                      <LucideIcons.Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      <LucideIcons.RefreshCw className="mr-2" size={18} />
                    )}
                    Refresh All Sets of Tasks for Today
                  </Button>
                  <Button
                    onClick={handleReset}
                    disabled={resetting}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                  >
                    {resetting ? (
                      <LucideIcons.Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                      <LucideIcons.Trash2 className="mr-2" size={18} />
                    )}
                    Reset All Combos & Tasks
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LucideIcons.List className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Existing Combos</h3>
                  </div>
                  <div className="bg-blue-600/20 px-3 py-1 rounded-full border border-blue-500/30">
                    <span className="text-blue-300 text-sm font-semibold">{combos.length}</span>
                  </div>
                </div>

                {loadingCombos ? (
                  <div className="flex items-center justify-center py-12">
                    <LucideIcons.Loader2 className="animate-spin text-slate-400" size={32} />
                  </div>
                ) : combos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-slate-700/30 p-4 rounded-full mb-3">
                      <LucideIcons.PackageX className="text-slate-500" size={32} />
                    </div>
                    <p className="text-slate-400 text-sm">No combos found</p>
                    <p className="text-slate-500 text-xs mt-1">Create your first combo above</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {combos.map((c) => (
                      <div
                        key={c._id}
                        className="group bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-all"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-500/30">
                                <LucideIcons.Package className="text-purple-400" size={16} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-semibold">Position {c.comboAt}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-emerald-400 font-semibold">${c.comboPrice}</span>
                                </div>
                                <p className="text-slate-400 text-xs mt-1">{c.Products.length} products included</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(c)}
                              className="bg-blue-600/20 hover:bg-blue-600/30 p-2 rounded-lg border border-blue-500/30 transition-all"
                            >
                              <LucideIcons.Edit className="text-blue-400" size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(c._id)}
                              className="bg-red-600/20 hover:bg-red-600/30 p-2 rounded-lg border border-red-500/30 transition-all"
                            >
                              <LucideIcons.Trash className="text-red-400" size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </div>
  )
}
