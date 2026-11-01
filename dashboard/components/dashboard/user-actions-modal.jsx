"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { useDashboard } from "../../app/AllContext/DashboardContext"
import { useUsersContext } from "@/app/AllContext/UsersContext"

export default function UserActionsModal({ user, onClose }) {
  const { updateUserAPI } = useDashboard()
  const { getWalletAddressesByUser, updateWalletAddress } = useUsersContext()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [walletAddresses, setWalletAddresses] = useState([])
  const [walletLoading, setWalletLoading] = useState(false)
  const [updatingWalletId, setUpdatingWalletId] = useState(null)
  const [walletStatus, setWalletStatus] = useState({
    id: null,
    type: null, // "success" | "error"
    message: "",
  })

  const [formData, setFormData] = useState({
    username: user.username || "",
    phone: user.phone || "",
    loginPassword: user.loginPassword || "",
    transactionPassword: user.transactionPassword || "",
    myinviteCode: user.myinviteCode || "",
    refinviteCode: user.refinviteCode || "",
    profileimage: user.profileimage || "",
    photoLink: user.profile?.photoLink || "",
    identifier: user.profile?.identifier || "",
    walletBalance: user.walletBalance || 0,
    totalBalance: user.totalBalance || 0,
    commissionTotal: user.commissionTotal || 0,
    todayProfit: user.todayProfit || 0,
    salary: user.salary || 0,
    canWithdraw: user.canWithdraw || false,
    vipName: user.currentVIPLevel?.name || "",
    vipNumber: user.currentVIPLevel?.number || 0,
    vipWithdrawLimit: user.currentVIPLevel?.withdraw_limit || 0,
    vipCommission: user.currentVIPLevel?.commission || 0,
    notifications: user.notifications || [],
    creditScore: user.creditScore || 0
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const loadWalletAddresses = async () => {
    setWalletLoading(true)
    const res = await getWalletAddressesByUser(user._id)
    if (res.success) {
      setWalletAddresses(res.addresses)
    }
    setWalletLoading(false)
  }

  useEffect(() => {
    if (activeTab === "wallets") {
      loadWalletAddresses()
    }
  }, [activeTab])

  const handleWalletChange = (index, field, value) => {
    setWalletAddresses((prev) =>
      prev.map((wallet, i) =>
        i === index ? { ...wallet, [field]: value } : wallet
      )
    )
  }

  const handleWalletUpdate = async (wallet) => {
    setUpdatingWalletId(wallet._id)
    setWalletStatus({ id: null, type: null, message: "" })

    const res = await updateWalletAddress(wallet._id, {
      userId: user._id,
      walletLabel: wallet.walletLabel,
      walletAddress: wallet.walletAddress,
    })

    if (res.success) {
      setWalletStatus({
        id: wallet._id,
        type: "success",
        message: "Wallet updated successfully",
      })
    } else {
      setWalletStatus({
        id: wallet._id,
        type: "error",
        message: res.error || "Failed to update wallet",
      })
    }

    setUpdatingWalletId(null)
  }


  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const updateData = {
        username: formData.username,
        phone: formData.phone,
        loginPassword: formData.loginPassword,
        transactionPassword: formData.transactionPassword,
        myinviteCode: formData.myinviteCode,
        refinviteCode: formData.refinviteCode,
        profileimage: formData.profileimage,
        profile: {
          photoLink: formData.photoLink,
          identifier: formData.identifier,
        },
        walletBalance: formData.walletBalance,
        totalBalance: formData.totalBalance,
        commissionTotal: formData.commissionTotal,
        todayProfit: formData.todayProfit,
        salary: formData.salary,
        canWithdraw: formData.canWithdraw,
        currentVIPLevel: {
          name: formData.vipName,
          number: formData.vipNumber,
          withdraw_limit: formData.vipWithdrawLimit,
          commission: formData.vipCommission,
        },
        creditScore: formData.creditScore,
        notifications: formData.notifications,
      }

      await updateUserAPI(user._id, updateData)

      toast({
        title: "Success",
        description: "User updated successfully",
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteNotification = (index) => {
    setFormData((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((_, i) => i !== index),
    }))
  }

  const handleAddNotification = () => {
    setFormData((prev) => ({
      ...prev,
      notifications: [
        ...prev.notifications,
        {
          type: "info",
          message: "",
          timestamp: new Date().toISOString(),
          read: false,
        },
      ],
    }))
  }

  const handleNotificationChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((notif, i) => (i === index ? { ...notif, [field]: value } : notif)),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-3xl border-b border-slate-700 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <LucideIcons.User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <p className="text-blue-100 text-sm">{user.username}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-xl h-10 w-10"
            >
              <LucideIcons.X className="h-6 w-6" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            {[
              { id: "basic", label: "Basic Info", icon: LucideIcons.User },
              { id: "financial", label: "Financial", icon: LucideIcons.DollarSign },
              { id: "vip", label: "VIP Level", icon: LucideIcons.Crown },
              { id: "notifications", label: "Notifications", icon: LucideIcons.Bell },
              { id: "wallets", label: "Wallet Addresses", icon: LucideIcons.Wallet },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white text-blue-600 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.User className="h-4 w-4 text-blue-400" />
                    Username
                  </Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Phone className="h-4 w-4 text-green-400" />
                    Phone
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Lock className="h-4 w-4 text-red-400" />
                    Login Password
                  </Label>
                  <Input
                    value={formData.loginPassword}
                    onChange={(e) => handleChange("loginPassword", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Lock className="h-4 w-4 text-red-400" />
                    Transaction Password
                  </Label>
                  <Input
                    value={formData.transactionPassword}
                    onChange={(e) => handleChange("transactionPassword", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Code className="h-4 w-4 text-purple-400" />
                    My Invite Code
                  </Label>
                  <Input
                    value={formData.myinviteCode}
                    onChange={(e) => handleChange("myinviteCode", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Link className="h-4 w-4 text-yellow-400" />
                    Referral Invite Code
                  </Label>
                  <Input
                    value={formData.refinviteCode}
                    onChange={(e) => handleChange("refinviteCode", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Image className="h-4 w-4 text-pink-400" />
                    Profile Image URL
                  </Label>
                  <Input
                    value={formData.profileimage}
                    onChange={(e) => handleChange("profileimage", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Camera className="h-4 w-4 text-cyan-400" />
                    Photo Link
                  </Label>
                  <Input
                    value={formData.photoLink}
                    onChange={(e) => handleChange("photoLink", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Hash className="h-4 w-4 text-orange-400" />
                    Identifier
                  </Label>
                  <Input
                    value={formData.identifier}
                    onChange={(e) => handleChange("identifier", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Hash className="h-4 w-4 text-orange-400" />
                    Credit Score
                  </Label>
                  <Input
                    value={formData.creditScore}
                    onChange={(e) => handleChange("creditScore", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === "financial" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Wallet className="h-4 w-4 text-green-400" />
                    Wallet Balance
                  </Label>
                  <Input
                    type="number"
                    value={formData.walletBalance}
                    onChange={(e) => handleChange("walletBalance", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Coins className="h-4 w-4 text-blue-400" />
                    Total Balance
                  </Label>
                  <Input
                    type="number"
                    value={formData.totalBalance}
                    onChange={(e) => handleChange("totalBalance", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.TrendingUp className="h-4 w-4 text-purple-400" />
                    Commission Total
                  </Label>
                  <Input
                    type="number"
                    value={formData.commissionTotal}
                    onChange={(e) => handleChange("commissionTotal", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.DollarSign className="h-4 w-4 text-emerald-400" />
                    Today Profit
                  </Label>
                  <Input
                    type="number"
                    value={formData.todayProfit}
                    onChange={(e) => handleChange("todayProfit", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Briefcase className="h-4 w-4 text-amber-400" />
                    Salary
                  </Label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleChange("salary", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <LucideIcons.CreditCard className="h-4 w-4 text-yellow-400" />
                    <Label className="text-slate-300 font-semibold">Can Withdraw</Label>
                  </div>
                  <Switch
                    checked={formData.canWithdraw}
                    onCheckedChange={(checked) => handleChange("canWithdraw", checked)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIP Level Tab */}
          {activeTab === "vip" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Crown className="h-4 w-4 text-yellow-400" />
                    VIP Name
                  </Label>
                  <Input
                    value={formData.vipName}
                    onChange={(e) => handleChange("vipName", e.target.value)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Hash className="h-4 w-4 text-blue-400" />
                    VIP Number
                  </Label>
                  <Input
                    type="number"
                    value={formData.vipNumber}
                    onChange={(e) => handleChange("vipNumber", Number.parseInt(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Banknote className="h-4 w-4 text-green-400" />
                    Withdraw Limit
                  </Label>
                  <Input
                    type="number"
                    value={formData.vipWithdrawLimit}
                    onChange={(e) => handleChange("vipWithdrawLimit", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="text-slate-300 font-semibold flex items-center gap-2 mb-2">
                    <LucideIcons.Percent className="h-4 w-4 text-purple-400" />
                    Commission Rate
                  </Label>
                  <Input
                    type="number"
                    value={formData.vipCommission}
                    onChange={(e) => handleChange("vipCommission", Number.parseFloat(e.target.value) || 0)}
                    className="bg-slate-800/60 border-slate-700 text-slate-100 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-200">Manage Notifications</h3>
                <Button
                  onClick={handleAddNotification}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl"
                >
                  <LucideIcons.Plus className="h-4 w-4 mr-2" />
                  Add Notification
                </Button>
              </div>

              {formData.notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <LucideIcons.Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.notifications.map((notif, index) => (
                    <div key={index} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <select
                          value={notif.type}
                          onChange={(e) => handleNotificationChange(index, "type", e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
                        >
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>

                        <Button
                          onClick={() => handleDeleteNotification(index)}
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:bg-red-900/20"
                        >
                          <LucideIcons.Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <Input
                        value={notif.message}
                        onChange={(e) => handleNotificationChange(index, "message", e.target.value)}
                        placeholder="Notification message..."
                        className="bg-slate-900 border-slate-700 text-slate-100 rounded-xl"
                      />

                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <LucideIcons.Clock className="h-4 w-4" />
                        {new Date(notif.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wallet Addresses Tab */}
        {activeTab === "wallets" && (
          <div className="space-y-4">
            {walletLoading ? (
              <div className="text-center text-slate-400">Loading wallets...</div>
            ) : walletAddresses.length === 0 ? (
              <div className="text-center text-slate-400">
                No wallet addresses found
              </div>
            ) : (
              walletAddresses.map((wallet, index) => (
                <div
                  key={wallet._id}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300 mb-2 block">
                        Wallet Label
                      </Label>
                      <Input
                        value={wallet.walletLabel}
                        onChange={(e) =>
                          handleWalletChange(index, "walletLabel", e.target.value)
                        }
                        className="bg-slate-900 border-slate-700 text-slate-100 rounded-xl"
                      />
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-2 block">
                        Wallet Address
                      </Label>
                      <Input
                        value={wallet.walletAddress}
                        onChange={(e) =>
                          handleWalletChange(index, "walletAddress", e.target.value)
                        }
                        className="bg-slate-900 border-slate-700 text-slate-100 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleWalletUpdate(wallet)}
                      disabled={updatingWalletId === wallet._id}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
                    >
                      {updatingWalletId === wallet._id ? (
                        <>
                          <LucideIcons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <LucideIcons.Save className="h-4 w-4 mr-2" />
                          Update Wallet
                        </>
                      )}
                    </Button>
                    {walletStatus.id === wallet._id && (
                      <div
                        className={`text-sm mt-2 font-medium ${walletStatus.type === "success"
                            ? "text-green-400"
                            : "text-red-400"
                          }`}
                      >
                        {walletStatus.message}
                      </div>
                    )}

                  </div>
                </div>
              ))
            )}
          </div>
        )}


        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur p-6 border-t border-slate-700 rounded-b-3xl">
          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-6 py-2.5 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <LucideIcons.Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <LucideIcons.Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
