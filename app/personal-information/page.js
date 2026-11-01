"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import * as LucideIcons from "lucide-react"
import { useRouter } from "next/navigation"
import { useUsersContext } from "../AllContext/UsersContext"
import Bottom from "@/app/Common/Bottom/Bottom"

export default function PersonalInformationPage() {
  const { user, updateUserAPI, logout } = useUsersContext()

  const formateDate = (date) => {
    const joinDate = new Date(date).toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    })
    return joinDate
  }

  const router = useRouter()
  const [storedUser, setStoredUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setStoredUser(JSON.parse(userData))
    }
  }, [])

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showTransactionPasswordDialog, setShowTransactionPasswordDialog] = useState(false)

  const [notification, setNotification] = useState({ show: false, message: "", type: "" })

  // All input state here
  const [editValues, setEditValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    currentTransactionPassword: "",
    newTransactionPassword: "",
    confirmTransactionPassword: "",
  })

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingTransactionPassword, setIsUpdatingTransactionPassword] = useState(false)

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type })
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" })
    }, 4000)
  }

  const handlePasswordUpdate = async () => {
    // Validation checks
    if (!editValues.currentPassword) {
      showNotification("Please enter your current password", "error")
      return
    }

    if (!editValues.newPassword) {
      showNotification("Please enter a new password", "error")
      return
    }

    if (editValues.newPassword.length < 6) {
      showNotification("Password must be at least 6 characters", "error")
      return
    }

    if (editValues.newPassword !== editValues.confirmPassword) {
      showNotification("Passwords do not match", "error")
      return
    }

    setIsUpdatingPassword(true)

    try {
      const updated = await updateUserAPI(user._id, {
        loginPassword: editValues.newPassword,
        currentPassword: editValues.currentPassword,
      })

      if (!updated) {
        showNotification("Failed to update password. Please check your current password.", "error")
        setIsUpdatingPassword(false)
        return
      }

      showNotification("Login password updated successfully!", "success")
      logout()

      setEditValues({
        ...editValues,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      setShowPasswordDialog(false)
    } catch (error) {
      showNotification(error.message || "An error occurred while updating password", "error")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleTransactionPasswordUpdate = async () => {
    // Validation checks
    if (!editValues.currentTransactionPassword) {
      showNotification("Please enter your current transaction password", "error")
      return
    }

    if (!editValues.newTransactionPassword) {
      showNotification("Please enter a new transaction password", "error")
      return
    }

    if (editValues.newTransactionPassword.length < 6) {
      showNotification("Transaction password must be at least 6 characters", "error")
      return
    }

    if (editValues.newTransactionPassword !== editValues.confirmTransactionPassword) {
      showNotification("Transaction passwords do not match", "error")
      return
    }

    setIsUpdatingTransactionPassword(true)

    try {
      const updated = await updateUserAPI(user._id, {
        transactionPassword: editValues.newTransactionPassword,
        currentTransactionPassword: editValues.currentTransactionPassword,
      })

      if (!updated) {
        showNotification("Failed to update transaction password. Please check your current password.", "error")
        setIsUpdatingTransactionPassword(false)
        return
      }

      showNotification("Transaction password updated successfully!", "success")

      setEditValues({
        ...editValues,
        currentTransactionPassword: "",
        newTransactionPassword: "",
        confirmTransactionPassword: "",
      })

      setShowTransactionPasswordDialog(false)
    } catch (error) {
      showNotification(error.message || "An error occurred while updating transaction password", "error")
    } finally {
      setIsUpdatingTransactionPassword(false)
    }
  }

  // Prevent rendering until localStorage is checked
  if (!storedUser) return null

  return (
    <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
      {notification.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-[#a3d65c]/95 border-[#a3d65c] text-[#2d3e2f]"
                : "bg-red-50/95 border-red-500 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <LucideIcons.CheckCircle className="h-6 w-6 flex-shrink-0" />
            ) : (
              <LucideIcons.XCircle className="h-6 w-6 flex-shrink-0" />
            )}
            <p className="font-semibold text-sm sm:text-base">{notification.message}</p>
            <button
              onClick={() => setNotification({ show: false, message: "", type: "" })}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <LucideIcons.X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header - Updated to dark olive with lime accents */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#3a4d3c]/80 border-b border-[#a3d65c]/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 sm:gap-3 text-white hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#2d3e2f] p-2"
          >
            <LucideIcons.ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-medium text-sm sm:text-base">Back</span>
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-[#a3d65c]">Personal Information</h1>
          <div className="w-12 sm:w-16" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 pb-32 lg:pb-48">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Personal Details Section - Updated card colors to dark olive */}
          <Card className="p-6 sm:p-8 bg-[#3a4d3c] backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 rounded-2xl bg-[#a3d65c]">
                <LucideIcons.User className="h-5 w-5 sm:h-6 sm:w-6 text-[#2d3e2f]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Personal Details</h2>
            </div>

            <div className="space-y-6">
              {/* Username - Updated to dark olive with lime border */}
              <div className="p-4 sm:p-6 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/30">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[#a3d65c] font-semibold flex items-center gap-2">
                    <LucideIcons.User className="h-4 w-4" />
                    Username
                  </Label>
                </div>
                <p className="text-white font-medium">{user?.username}</p>
              </div>

              {/* Phone - Updated colors */}
              <div className="p-4 sm:p-6 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/30">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-[#a3d65c] font-semibold flex items-center gap-2">
                    <LucideIcons.Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                </div>
                <p className="text-white font-medium">{user?.phone}</p>
              </div>

              {/* Join Date - Updated colors */}
              <div className="p-4 sm:p-6 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/30">
                <Label className="text-[#a3d65c] font-semibold flex items-center gap-2 mb-3">
                  <LucideIcons.Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <p className="text-white font-medium">{formateDate(user?.createdAt)}</p>
              </div>
            </div>
          </Card>

          {/* SECURITY SECTION - Updated to olive-lime scheme */}
          <Card className="p-6 sm:p-8 bg-[#3a4d3c] backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="p-2 sm:p-3 rounded-2xl bg-[#a3d65c]">
                <LucideIcons.Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#2d3e2f]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Security Settings</h2>
            </div>

            <div className="space-y-4">
              {/* Login Password - Updated colors */}
              <div className="p-4 sm:p-6 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#a3d65c] font-semibold flex items-center gap-2 mb-2">
                      <LucideIcons.Lock className="h-4 w-4" /> Login Password
                    </Label>
                    <p className="text-white/70 text-sm">Used for logging into the account</p>
                  </div>

                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#a3d65c] text-[#2d3e2f] font-bold px-4 py-2 rounded-xl hover:bg-[#8bc34a]">
                        <LucideIcons.Key className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px] bg-[#3a4d3c] backdrop-blur-xl border-[#a3d65c]/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Change Login Password</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="text-[#a3d65c]">Current Password</Label>
                          <Input
                            type="password"
                            value={editValues.currentPassword}
                            onChange={(e) => setEditValues({ ...editValues, currentPassword: e.target.value })}
                            placeholder="Enter current password"
                            className="bg-[#2d3e2f] border-[#a3d65c]/30 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-[#a3d65c]">New Password</Label>
                          <Input
                            type="password"
                            value={editValues.newPassword}
                            onChange={(e) => setEditValues({ ...editValues, newPassword: e.target.value })}
                            placeholder="Enter new password (min 6 characters)"
                            className="bg-[#2d3e2f] border-[#a3d65c]/30 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-[#a3d65c]">Confirm New Password</Label>
                          <Input
                            type="password"
                            value={editValues.confirmPassword}
                            onChange={(e) => setEditValues({ ...editValues, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                            className="bg-[#2d3e2f] border-[#a3d65c]/30 text-white"
                          />
                        </div>

                        <Button
                          onClick={handlePasswordUpdate}
                          disabled={isUpdatingPassword}
                          className="w-full bg-[#a3d65c] hover:bg-[#8bc34a] text-[#2d3e2f] font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdatingPassword ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-5 w-5 border-2 border-[#2d3e2f] border-t-transparent rounded-full animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Transaction Password - Updated colors */}
              <div className="p-4 sm:p-6 bg-[#2d3e2f] rounded-2xl border border-[#a3d65c]/30">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-[#a3d65c] font-semibold flex items-center gap-2 mb-2">
                      <LucideIcons.CreditCard className="h-4 w-4" />
                      Transaction Password
                    </Label>
                    <p className="text-white/70 text-sm">Used for withdrawals and sensitive operations</p>
                  </div>

                  <Dialog open={showTransactionPasswordDialog} onOpenChange={setShowTransactionPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#a3d65c] text-[#2d3e2f] font-bold px-4 py-2 rounded-xl hover:bg-[#8bc34a]">
                        <LucideIcons.Key className="h-4 w-4 mr-2" />
                        Change
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px] bg-[#3a4d3c] backdrop-blur-xl border-[#a3d65c]/20">
                      <DialogHeader>
                        <DialogTitle className="text-white">Change Transaction Password</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <Label className="text-[#a3d65c]">Current Transaction Password</Label>
                          <Input
                            type="password"
                            value={editValues.currentTransactionPassword}
                            onChange={(e) =>
                              setEditValues({ ...editValues, currentTransactionPassword: e.target.value })
                            }
                            placeholder="Enter current transaction password"
                            className="bg-[#2d3e2f] border-[#a3d65c]/30 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-[#a3d65c]">New Transaction Password</Label>
                          <Input
                            type="password"
                            value={editValues.newTransactionPassword}
                            onChange={(e) => setEditValues({ ...editValues, newTransactionPassword: e.target.value })}
                            placeholder="Enter new transaction password (min 6 characters)"
                            className="bg-[#2d3e2f] border-[#a3d65c]/30 text-white"
                          />
                        </div>

                        <div>
                          <Label className="text-[#a3d65c]">Confirm New Transaction Password</Label>
                          <Input
                            type="password"
                            value={editValues.confirmTransactionPassword}
                            onChange={(e) =>
                              setEditValues({ ...editValues, confirmTransactionPassword: e.target.value })
                            }
                            placeholder="Confirm new transaction password"
                            className="bg-[#2d3e2f] border-[#a3d65c]/30 text-white"
                          />
                        </div>

                        <Button
                          onClick={handleTransactionPasswordUpdate}
                          disabled={isUpdatingTransactionPassword}
                          className="w-full bg-[#a3d65c] hover:bg-[#8bc34a] text-[#2d3e2f] font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdatingTransactionPassword ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-5 w-5 border-2 border-[#2d3e2f] border-t-transparent rounded-full animate-spin" />
                              <span>Updating...</span>
                            </div>
                          ) : (
                            "Update Transaction Password"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Bottom />
    </div>
  )
}
