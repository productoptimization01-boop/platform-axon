"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import * as LucideIcons from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useUsersContext } from "@/app/AllContext/UsersContext"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Index = ({ page = null, setWalletId, walletId }) => {
  const { user, getWalletAddressesAPI, updateWalletAddressAPI, deleteWalletAddressAPI, createWalletAddressAPI } =
    useUsersContext()
  const [walletAddresses, setWalletAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEditWalletDialog, setShowEditWalletDialog] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [editWallet, setEditWallet] = useState({ label: "", address: "" })
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [actionLoading, setActionLoading] = useState({ update: false, delete: null, add: false })
  const [newWallet, setNewWallet] = useState({
    type: "Bitcoin",
    address: "",
    label: "",
  })

  const cryptoTypes = [
    {
      name: "Bitcoin",
      icon: LucideIcons.Bitcoin,
      color: "from-orange-500 to-yellow-600",
      bgColor: "from-orange-50 to-yellow-50",
      symbol: "BTC",
    },
    {
      name: "Ethereum",
      icon: LucideIcons.Coins,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      symbol: "ETH",
    },
    {
      name: "USDT",
      icon: LucideIcons.DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      symbol: "USDT",
    },
  ]

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000)
  }

  useEffect(() => {
    if (!user?._id) return
    fetchWallets()
  }, [user])

  const fetchWallets = async () => {
    setLoading(true)
    setError("")
    const result = await getWalletAddressesAPI(user._id)
    if (result.error) {
      setError(result.error)
      showToast(result.error, "error")
    } else {
      setWalletAddresses(result.addresses || [])
    }
    setLoading(false)
  }

  const handleAddWallet = async () => {
    if (!newWallet.address || !newWallet.label) {
      showToast("Please fill in all fields", "error")
      return
    }

    if (!user?._id) {
      showToast("User not found. Please login again.", "error")
      return
    }

    setActionLoading({ ...actionLoading, add: true })

    try {
      const payload = {
        userId: user._id,
        walletLabel: newWallet.label,
        walletAddress: newWallet.address,
      }

      const result = await createWalletAddressAPI(payload)

      if (result.error) {
        showToast(result.error, "error")
      } else {
        showToast("Wallet address added successfully!", "success")
        setNewWallet({ type: "Bitcoin", address: "", label: "" })
        fetchWallets()
      }
    } catch (err) {
      showToast("Something went wrong. Please try again.", "error")
      console.error("AddWallet Error:", err)
    } finally {
      setActionLoading({ ...actionLoading, add: false })
    }
  }

  const handleUpdateWallet = async () => {
    if (!editWallet.label || !editWallet.address) {
      showToast("Please fill in all fields", "error")
      return
    }

    setActionLoading({ ...actionLoading, update: true })
    setError("")

    const result = await updateWalletAddressAPI(selectedWallet._id, {
      userId: user._id,
      walletLabel: editWallet.label,
      walletAddress: editWallet.address,
    })

    setActionLoading({ ...actionLoading, update: false })

    if (result.error) {
      showToast(result.error, "error")
    } else {
      showToast("Wallet updated successfully!", "success")
      setWalletAddresses(walletAddresses.map((w) => (w._id === result.address._id ? result.address : w)))
      setShowEditWalletDialog(false)
      setSelectedWallet(null)
      setEditWallet({ label: "", address: "" })
    }
  }

  const handleDeleteWallet = async (walletId) => {
    setActionLoading({ ...actionLoading, delete: walletId })
    setError("")

    const result = await deleteWalletAddressAPI(walletId, user._id)

    setActionLoading({ ...actionLoading, delete: null })

    if (result.error) {
      showToast(result.error, "error")
    } else {
      showToast("Wallet address deleted successfully!", "success")
      setWalletAddresses(walletAddresses.filter((w) => w._id !== walletId))
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showToast("Address copied to clipboard!", "success")
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#a3d65c] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading wallets...</p>
        </div>
      </div>
    )

  if (error && walletAddresses.length === 0)
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-6 bg-red-900/20 border-red-800">
          <div className="flex items-center gap-3 text-red-400">
            <LucideIcons.AlertCircle className="h-6 w-6" />
            <p className="font-medium">{error}</p>
          </div>
        </Card>
      </div>
    )

  return (
    <>
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div
            className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
              toast.type === "success" ? "bg-[#a3d65c] text-[#2d3e2f]" : "bg-red-600 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <LucideIcons.CheckCircle className="h-5 w-5" />
            ) : (
              <LucideIcons.XCircle className="h-5 w-5" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <Tabs defaultValue="wallets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#3a4d3c] p-1 rounded-2xl">
          <TabsTrigger
            value="wallets"
            className="rounded-xl font-semibold text-white data-[state=active]:bg-[#a3d65c] data-[state=active]:text-[#2d3e2f] data-[state=active]:shadow-md"
          >
            <LucideIcons.Wallet className="h-4 w-4 mr-2" />
            My Wallets
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="rounded-xl font-semibold text-white data-[state=active]:bg-[#a3d65c] data-[state=active]:text-[#2d3e2f] data-[state=active]:shadow-md"
          >
            <LucideIcons.Plus className="h-4 w-4 mr-2" />
            Add Wallet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="mt-0">
          {walletAddresses.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {walletAddresses.map((wallet) => {
                const Icon = cryptoTypes.find((c) => c.name === wallet.type)?.icon || LucideIcons.Wallet
                return (
                  <Card
                    key={wallet._id}
                    className="p-4 sm:p-6 bg-[#3a4d3c] shadow-xl border border-[#a3d65c]/20 rounded-3xl hover:shadow-2xl hover:border-[#a3d65c]/40 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 rounded-2xl bg-[#a3d65c] shadow-lg">
                          <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#2d3e2f]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{wallet.walletLabel}</h3>
                          <p className="text-sm text-gray-300 mb-2">{wallet.type} Wallet</p>

                          <div className="flex items-center gap-2 p-2 bg-[#2d3e2f] rounded-xl border border-[#a3d65c]/20">
                            <code className="text-xs sm:text-sm font-mono text-gray-200 truncate flex-1">
                              {wallet.walletAddress}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.walletAddress)}
                              className="text-[#a3d65c] hover:text-[#a3d65c] hover:bg-[#a3d65c]/20 rounded-lg p-1"
                            >
                              <LucideIcons.Copy className="h-4 w-4" />
                            </Button>
                          </div>

                          <p className="text-xs text-gray-400 mt-2">
                            Added on {new Date(wallet.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center w-full sm:w-auto">
                        {page === "Withdrawal" && (
                          <div
                            onClick={() => setWalletId(wallet._id)}
                            variant="outline"
                            className={`flex items-center justify-center h-10 w-10 rounded-full border-2 cursor-pointer ${
                              walletId === wallet._id
                                ? "border-[#a3d65c] bg-[#a3d65c]/20"
                                : "border-gray-500 bg-[#2d3e2f]"
                            }`}
                          >
                            <LucideIcons.Circle
                              className={`h-5 w-5 ${
                                walletId === wallet._id ? "fill-[#a3d65c] text-[#a3d65c]" : "text-gray-500"
                              }`}
                            />
                          </div>
                        )}

                        <Button
                          onClick={() => {
                            setSelectedWallet(wallet)
                            setEditWallet({ label: wallet.walletLabel, address: wallet.walletAddress })
                            setShowEditWalletDialog(true)
                          }}
                          className="flex-1 sm:flex-none bg-[#a3d65c] hover:bg-[#a3d65c]/80 text-[#2d3e2f] font-bold px-4 py-2 rounded-xl text-sm"
                        >
                          <LucideIcons.Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>

                        <Button
                          onClick={() => handleDeleteWallet(wallet._id)}
                          disabled={actionLoading.delete === wallet._id}
                          className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading.delete === wallet._id ? (
                            <LucideIcons.Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <LucideIcons.Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="p-8 sm:p-12 text-center bg-[#3a4d3c] backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl">
              <div className="inline-flex p-4 rounded-2xl bg-[#2d3e2f] mb-4">
                <LucideIcons.Wallet className="h-8 w-8 sm:h-12 sm:w-12 text-[#a3d65c]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">No Wallet Addresses</h3>
              <p className="text-gray-300 mb-6">You haven't added any wallet addresses yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-0">
          <Card className="p-6 sm:p-8 bg-[#3a4d3c] backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 rounded-2xl bg-[#a3d65c]">
                <LucideIcons.Plus className="h-5 w-5 sm:h-6 sm:w-6 text-[#2d3e2f]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Add New Wallet Address</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-white font-semibold mb-4 block">Select Cryptocurrency</Label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {cryptoTypes.map((crypto) => {
                    const Icon = crypto.icon
                    return (
                      <Button
                        key={crypto.name}
                        variant="ghost"
                        onClick={() => setNewWallet({ ...newWallet, type: crypto.name })}
                        className={`p-4 h-auto rounded-2xl border-2 transition-all duration-300 ${
                          newWallet.type === crypto.name
                            ? "bg-[#a3d65c]/20 border-[#a3d65c] shadow-lg"
                            : "bg-[#2d3e2f] border-gray-600 hover:bg-[#2d3e2f]/80"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="p-2 rounded-xl bg-[#a3d65c]">
                            <Icon className="h-5 w-5 text-[#2d3e2f]" />
                          </div>
                          <span className="text-sm font-medium text-white">{crypto.name}</span>
                          <span className="text-xs text-gray-300">{crypto.symbol}</span>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="wallet-label" className="text-white font-semibold">
                  Wallet Label
                </Label>
                <Input
                  id="wallet-label"
                  type="text"
                  placeholder="e.g., Main Trading Wallet"
                  value={newWallet.label}
                  onChange={(e) => setNewWallet({ ...newWallet, label: e.target.value })}
                  className="mt-2 h-12 text-base bg-[#2d3e2f] text-white border-2 border-gray-600 rounded-xl focus:border-[#a3d65c] focus:ring-4 focus:ring-[#a3d65c]/20"
                  disabled={actionLoading.add}
                />
              </div>

              <div>
                <Label htmlFor="wallet-address" className="text-white font-semibold">
                  {newWallet.type} Wallet Address
                </Label>
                <Input
                  id="wallet-address"
                  type="text"
                  placeholder={`Enter your ${newWallet.type} wallet address`}
                  value={newWallet.address}
                  onChange={(e) => setNewWallet({ ...newWallet, address: e.target.value })}
                  className="mt-2 h-12 text-base bg-[#2d3e2f] text-white border-2 border-gray-600 rounded-xl focus:border-[#a3d65c] focus:ring-4 focus:ring-[#a3d65c]/20 font-mono"
                  disabled={actionLoading.add}
                />
              </div>

              <div className="p-4 bg-yellow-900/20 rounded-2xl border border-yellow-700">
                <div className="flex items-center gap-3 mb-2">
                  <LucideIcons.AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-400">Security Notice</span>
                </div>
                <p className="text-sm text-yellow-300">
                  Please double-check your wallet address before saving. Incorrect addresses may result in loss of
                  funds.
                </p>
              </div>

              <Button
                onClick={handleAddWallet}
                disabled={actionLoading.add}
                className={`w-full h-14 text-lg font-bold shadow-2xl rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  actionLoading.add
                    ? "bg-gray-600 cursor-not-allowed text-gray-300"
                    : "bg-[#a3d65c] hover:bg-[#a3d65c]/80 text-[#2d3e2f]"
                }`}
              >
                {actionLoading.add ? (
                  <>
                    <LucideIcons.Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <LucideIcons.Plus className="h-5 w-5 mr-2" />
                    Add Wallet Address
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {showEditWalletDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => {
              setShowEditWalletDialog(false)
              setSelectedWallet(null)
              setEditWallet({ label: "", address: "" })
            }}
          ></div>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in zoom-in-95 duration-200">
            <Card className="w-full max-w-md p-6 sm:p-8 bg-[#3a4d3c] shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Wallet</h2>
                <button
                  onClick={() => {
                    setShowEditWalletDialog(false)
                    setSelectedWallet(null)
                    setEditWallet({ label: "", address: "" })
                  }}
                  className="p-2 hover:bg-[#2d3e2f] rounded-full transition-colors"
                >
                  <LucideIcons.X className="h-5 w-5 text-gray-300" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-white font-medium mb-2 block">Wallet Label</Label>
                  <Input
                    value={editWallet.label}
                    onChange={(e) => setEditWallet({ ...editWallet, label: e.target.value })}
                    placeholder="e.g., My Main Wallet"
                    className="rounded-xl bg-[#2d3e2f] text-white border-gray-600 focus:border-[#a3d65c] focus:ring-[#a3d65c]/20"
                  />
                </div>

                <div>
                  <Label className="text-white font-medium mb-2 block">Wallet Address</Label>
                  <Input
                    value={editWallet.address}
                    onChange={(e) => setEditWallet({ ...editWallet, address: e.target.value })}
                    placeholder="Enter wallet address"
                    className="rounded-xl bg-[#2d3e2f] text-white border-gray-600 focus:border-[#a3d65c] focus:ring-[#a3d65c]/20 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateWallet}
                  disabled={actionLoading.update}
                  className="flex-1 bg-[#a3d65c] hover:bg-[#a3d65c]/80 text-[#2d3e2f] font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {actionLoading.update ? (
                    <>
                      <LucideIcons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <LucideIcons.Check className="h-4 w-4 mr-2" />
                      Update Wallet
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowEditWalletDialog(false)
                    setSelectedWallet(null)
                    setEditWallet({ label: "", address: "" })
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </>
  )
}

export default Index
