"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import * as LucideIcons from "lucide-react"
import { useDashboard } from "@/app/AllContext/DashboardContext"
import UserActionsModal from "./user-actions-modal"
import UserTasksModal from "./user-tasks-modal"
import TransactionsListModal from "./transactions-list-modal"
import RandomRewardModal from "./random-reward-modal"
import { useToast } from "@/hooks/use-toast"
import { useUsersContext } from "../../app/AllContext/UsersContext"
import { useChatContext } from "../../app/AllContext/ChatContext"
import { formatLocation } from "@/lib/admin-settings"

export default function UsersManagement() {
  const { users, fetchUsers, searchUsers, deleteUser, isLoadingUsers, totalUserPages, setActiveTab, usersPage, setUsersPage, usersSearchTerm, setUsersSearchTerm, refreshUsers, onlineCount, realtimeEnabled, onlineUsers } = useDashboard()
  const { setSelectedUser: setChatSelectedUser } = useChatContext()
  const [lightboxImage, setLightboxImage] = useState(null)
  const [lightboxName, setLightboxName] = useState("")

  // Req 2: open this user in Live Chat so admin can send the first message.
  const handleMessageUser = (user) => {
    setChatSelectedUser({ id: user._id, username: user.username })
    setActiveTab("live-chat")
  }
  const { transactions, fetchTasksByUser, getCompletedSetsSummary } = useUsersContext()
  const [setsSummary, setSetsSummary] = useState({})
  const refreshSetsSummary = () => { getCompletedSetsSummary().then((r) => { if (r.success) setSetsSummary(r.summary) }) }
  // Stale-summary fix: the old code fetched the summary only once on
  // mount, so a set completed/reset after the admin opened this tab
  // still showed 0 until a full page reload. Now it refetches whenever
  // the users list reloads, every 30 seconds, and on Refresh.
  useEffect(() => { refreshSetsSummary() }, [users])
  useEffect(() => { const id = setInterval(refreshSetsSummary, 30000); return () => clearInterval(id) }, [])
  const { toast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  // Page/search live in context: returning to this tab restores them and
  // the cached list is shown instantly, with no refetch. A full page
  // reload clears the context, so the list is fetched once then.
  const searchTerm = usersSearchTerm
  const setSearchTerm = setUsersSearchTerm
  const currentPage = usersPage
  const setCurrentPage = setUsersPage

  const [showActionsModal, setShowActionsModal] = useState(false)
  const [selectedUserForActions, setSelectedUserForActions] = useState(null)

  const [showTasksModal, setShowTasksModal] = useState(false)
  const [selectedUserForTasks, setSelectedUserForTasks] = useState(null)

  const [showTransactionsModal, setShowTransactionsModal] = useState(false)

  const [showRewardModal, setShowRewardModal] = useState(false)
  // Online filter: clicking "users online now" filters the MAIN list below
  // to online users only (no separate section). Toggle again to go back.
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [locationRefreshMsg, setLocationRefreshMsg] = useState("")
  const onlineIds = new Set((onlineUsers || []).map((u) => String(u._id)))
  const formatLocationUpdated = (loc) => {
    if (!loc?.updatedAt) return "Location not taken yet"
    const d = new Date(loc.updatedAt)
    return `Location last taken: ${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
  const handleRequestLocationRefresh = async (user) => {
    setLocationRefreshMsg("")
    try {
      const res = await fetch(`https://platform-axon-rust.vercel.app/api/users/requestLocationRefresh/${user._id}`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setLocationRefreshMsg(`${user.username}: fresh location will be fetched on the next heartbeat / next time they come online.`)
      toast({ title: "Location refresh requested", description: data.message || "Fresh location will be fetched next time the user is online." })
    } catch (e) {
      setLocationRefreshMsg(`Failed to request location refresh for ${user.username}.`)
    }
  }
  const [selectedUserForReward, setSelectedUserForReward] = useState(null)

  const [userTaskCounts, setUserTaskCounts] = useState({})
  const [refreshingTasks, setRefreshingTasks] = useState({})

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (showOnlineOnly) {
        // Online-only: backend /users?online=true, full rows, paginated.
        fetchUsers(currentPage, { online: true })
      } else if (searchTerm.trim() === "") {
        // Req 1: load the latest accounts by default, 20 per page
        // (backend /users sorts by createdAt desc, limit 20).
        fetchUsers(currentPage)
      } else {
        searchUsers(searchTerm, currentPage)
      }
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm, currentPage, showOnlineOnly])

  // Keep the online-only list live: when the online set changes (30s poll),
  // refetch the current online page so users who went offline disappear
  // and newly online users appear, without leaving the filter.
  useEffect(() => {
    if (showOnlineOnly) fetchUsers(currentPage, { online: true, force: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineUsers])

  const handleRefreshTasks = async (userId) => {
    setRefreshingTasks((prev) => ({ ...prev, [userId]: true }))

    try {
      const tasks = await fetchTasksByUser(userId)

      setUserTaskCounts((prev) => ({
        ...prev,
        [userId]: tasks.length,
      }))

      toast({
        title: "Tasks Updated",
        description: `Found ${tasks.length} tasks for this user`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setRefreshingTasks((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const getTaskCount = (user) => {
    return userTaskCounts[user._id] !== undefined ? userTaskCounts[user._id] : user.NumOfTasks || 0
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setSelectedUser(null)
    setShowForm(false)
  }

  const handleOpenActions = (user) => {
    setSelectedUserForActions(user)
    setShowActionsModal(true)
  }

  const handleCloseActionsModal = () => {
    setSelectedUserForActions(null)
    setShowActionsModal(false)
  }

  const handleViewTasks = (user) => {
    setSelectedUserForTasks(user)
    setShowTasksModal(true)
  }

  const handleCloseTasksModal = () => {
    setSelectedUserForTasks(null)
    setShowTasksModal(false)
  }

  const handleOpenTransactions = () => {
    setShowTransactionsModal(true)
  }

  const handleCloseTransactionsModal = () => {
    setShowTransactionsModal(false)
  }

  const handleOpenReward = (user) => {
    setSelectedUserForReward(user)
    setShowRewardModal(true)
  }

  const handleCloseRewardModal = () => {
    setSelectedUserForReward(null)
    setShowRewardModal(false)
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalUserPages) return
    setCurrentPage(page)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };


  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Users Management
          </h2>
          <p className="text-slate-400 mt-2">Manage and control all user accounts</p>
          {realtimeEnabled ? (
            <button onClick={() => { const next = !showOnlineOnly; setShowOnlineOnly(next); if (next) { setSearchTerm(""); setCurrentPage(1) } }} className="text-sm mt-2 flex items-center gap-2 hover:underline" title={showOnlineOnly ? "Click to show all users again" : "Click to show only online users in the list below"}>
              <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-semibold">{onlineCount} users online now</span>
              <span className="text-slate-400">{showOnlineOnly ? "▲ Show all users" : "▼ Show online users"}</span>
            </button>
          ) : (
            <p className="text-sm mt-2 text-slate-500">Realtime OFF — online count paused (turn it on in Admin Settings)</p>
          )}
          {locationRefreshMsg && <p className="text-sm mt-2 text-cyan-300">{locationRefreshMsg}</p>}
        </div>

        <Button
          variant="outline"
          onClick={() => { if (showOnlineOnly) refreshUsers(currentPage, "", { online: true }); else refreshUsers(currentPage, searchTerm.trim()); refreshSetsSummary() }}
          title="Refresh users list"
          className="rounded-xl bg-slate-900/40 text-slate-300 border-slate-700 px-4 py-6"
        >
          <LucideIcons.RefreshCw className="h-5 w-5 mr-2" />
          <span className="font-semibold">Refresh</span>
        </Button>

        <Button
          onClick={handleOpenTransactions}
          className="relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl px-6 py-6 shadow-lg transition-all"
        >
          <LucideIcons.Receipt className="h-5 w-5 mr-2" />
          <span className="font-semibold">Transactions</span>
          {transactions && transactions.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center animate-pulse border-2 border-slate-900">
              {transactions.length}
            </span>
          )}
        </Button>
      </div>

      <Card className="p-4 bg-slate-800/40 backdrop-blur-sm shadow-lg rounded-2xl border border-slate-700/50">
        <div className="relative">
          <LucideIcons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            placeholder="Search by username or phone..."
            value={searchTerm}
            onChange={(e) => {
              setShowOnlineOnly(false)
              setCurrentPage(1)
              setSearchTerm(e.target.value)
            }}
            className="pl-12 h-12 bg-slate-900/60 border-2 border-slate-700 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </Card>

      {showOnlineOnly && realtimeEnabled && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-green-500/10 border border-green-500/40 rounded-2xl">
          <p className="text-sm text-green-300 font-semibold">
            Showing online users only ({onlineCount} online right now) — the list below is filtered, not the default 20 users.
          </p>
          <button onClick={() => setShowOnlineOnly(false)} className="text-sm font-semibold text-green-300 hover:text-green-200 hover:underline">
            Show all users
          </button>
        </div>
      )}

      <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
        {isLoadingUsers ? (
          <div className="p-12 text-center">
            <LucideIcons.Loader className="h-10 w-10 animate-spin text-slate-400 mx-auto" />
            <p className="text-slate-400 mt-4 font-semibold">Loading users...</p>
          </div>
        ) : (
          <>
            <div className="w-full">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] table-fixed text-sm text-slate-300">
                  <colgroup>
                    <col className="w-[160px]" />
                    <col className="w-[100px]" />
                    <col className="w-[260px]" />
                    <col className="w-[240px]" />
                    <col className="w-[200px]" />
                  </colgroup>

                  {/* ✅ Header (Hidden on Mobile) */}
                  <thead className="hidden md:table-header-group">
                    <tr className="bg-slate-800/60 border-b border-slate-700">

                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        Actions
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        Tasks
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        User Details
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        Financial Overview
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        VIP Level
                      </th>

                    </tr>
                  </thead>

                  <tbody className="flex flex-col gap-4 md:table-row-group">

                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr
                          key={user._id}
                          className="flex flex-col md:table-row 
                         bg-slate-900 md:bg-transparent
                         rounded-xl md:rounded-none
                         border border-slate-700/40 md:border-b md:border-slate-700/30
                         p-4 md:p-0
                         hover:bg-slate-800/40 transition-all duration-200"
                        >

                          {/* ✅ Actions */}
                          <td className="md:px-4 md:py-4 align-middle">
                            <div className="flex flex-nowrap justify-start md:justify-center gap-1 mb-4 md:mb-0">

                              <Button
                                onClick={() => handleMessageUser(user)}
                                variant="ghost"
                                size="icon"
                                className="text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300 rounded-lg"
                                title="Message user in Live Chat"
                              >
                                <LucideIcons.MessageCircle className="h-4 w-4" />
                              </Button>

                              <Button
                                onClick={() => handleOpenReward(user)}
                                variant="ghost"
                                size="icon"
                                className="text-yellow-400 hover:bg-yellow-900/20 hover:text-yellow-300 rounded-lg"
                                title="Random Reward"
                              >
                                <LucideIcons.Gift className="h-4 w-4" />
                              </Button>

                              <Button
                                onClick={() => handleViewTasks(user)}
                                variant="ghost"
                                size="icon"
                                className="text-green-400 hover:bg-green-900/20 hover:text-green-300 rounded-lg"
                                title={`View Tasks (${user.activeSetTasks?.length || 0})`}
                              >
                                <LucideIcons.CheckCircle className="h-4 w-4" />
                              </Button>

                              <Button
                                onClick={() => handleOpenActions(user)}
                                variant="ghost"
                                size="icon"
                                className="text-purple-400 hover:bg-purple-900/20 hover:text-purple-300 rounded-lg"
                                title="User Actions"
                              >
                                <LucideIcons.Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>

                          {/* ✅ Tasks */}
                          <td className="md:px-4 md:py-4 mb-4 md:mb-0 align-middle">
                            <div className="flex items-center justify-between md:justify-start gap-3">

                              <div className="flex flex-col">
                                <span className="text-xs text-slate-400 md:hidden">
                                  Active Tasks
                                </span>
                                <span className="text-lg font-bold text-green-400">
                                  {getTaskCount(user)}
                                </span>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRefreshTasks(user._id)}
                                disabled={refreshingTasks[user._id]}
                                className="h-7 w-7 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-md"
                                title="Refresh tasks count"
                              >
                                {refreshingTasks[user._id] ? (
                                  <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <LucideIcons.RefreshCw className="h-4 w-4" />
                                )}
                              </Button>

                            </div>
                          </td>

                          {/* ✅ User Info */}
                          <td className="md:px-4 md:py-4 mb-4 md:mb-0 align-middle">
                            <div className="space-y-1">
                              <div className="text-xs text-slate-400 md:hidden">
                                User Details
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                {(user.profile?.photoLink || user.profileimage) && user.profile?.photoLink !== "none" && user.profileimage !== "none" ? (
                                  <img
                                    src={user.profile?.photoLink || user.profileimage}
                                    alt={user.username}
                                    className="w-10 h-10 rounded-full object-cover cursor-pointer border border-slate-600"
                                    onClick={() => { setLightboxImage(user.profile?.photoLink || user.profileimage); setLightboxName(user.username) }}
                                    title="View profile picture in full screen"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {user.username?.charAt(0)}
                                  </div>
                                )}
                                {onlineIds.has(String(user._id)) && (
                                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-slate-900" title="Online now" />
                                )}
                              </div>
                                <div className="font-semibold text-slate-200 text-base truncate min-w-0">
                                  {user.username}
                                </div>
                              </div>
                              <div className="text-sm text-slate-400">
                                Location: {formatLocation(user.location) || "Not taken yet"}
                              </div>
                              <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                                <span>{formatLocationUpdated(user.location)}</span>
                                <button onClick={() => handleRequestLocationRefresh(user)} className="text-cyan-400 hover:underline" title="Next time this user is online, a fresh location will be fetched">
                                  Get latest location
                                </button>
                              </div>

                              <div className="text-sm text-slate-400">
                                Sets Completed Today: {setsSummary[String(user._id)]?.today || 0}
                              </div>
                              <div className="text-sm text-slate-400">
                                Referral: {user.ReferralName || "N/A"}
                              </div>

                              <div className="text-sm text-slate-500 truncate">
                                Phone: {user.phone}
                              </div>
                            </div>
                          </td>

                          {/* ✅ Financial Info */}
                          <td className="md:px-4 md:py-4 mb-4 md:mb-0 align-middle">
                            <div>
                              <div className="text-xs text-slate-400 md:hidden mb-2">
                                Financial Overview
                              </div>

                              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">

                                <div className="text-slate-400">Wallet</div>
                                <div className="text-green-400 font-semibold text-right whitespace-nowrap">
                                  {formatCurrency(user.walletBalance)}
                                </div>

                                <div className="text-slate-400">Total</div>
                                <div className="text-blue-400 font-semibold text-right whitespace-nowrap">
                                  {formatCurrency(user.totalBalance)}
                                </div>

                                <div className="text-slate-400">Commission</div>
                                <div className="text-purple-400 font-semibold text-right whitespace-nowrap">
                                  {formatCurrency(user.commissionTotal)}
                                </div>

                                <div className="text-slate-400">Salary</div>
                                <div className="text-indigo-400 font-semibold text-right whitespace-nowrap">
                                  {formatCurrency(user.salary)}
                                </div>

                              </div>
                            </div>
                          </td>

                          {/* ✅ VIP */}
                          <td className="md:px-4 md:py-4 align-middle">
                            <div className="text-xs text-slate-400 md:hidden mb-1">
                              VIP Level
                            </div>

                            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-800/40 to-indigo-800/40 
                                 text-purple-300 rounded-full text-xs font-semibold whitespace-nowrap
                                 border border-purple-600/40">
                              {user.currentVIPLevel?.name
                                ? `VIP ${user.currentVIPLevel.number} - ${user.currentVIPLevel.name}`
                                : "Not Assigned"}
                            </span>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-10 text-slate-400 font-semibold">
                          {showOnlineOnly ? "No users are online right now." : "No users found"}
                        </td>
                      </tr>
                    )}

                  </tbody>
                </table>
              </div>
            </div>


            <div className="flex justify-center py-4 gap-3">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="rounded-xl bg-slate-900/40 text-slate-300 border-slate-700"
              >
                Previous
              </Button>

              <span className="text-slate-300 font-semibold py-2">
                Page {currentPage} of {totalUserPages}
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalUserPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-xl bg-slate-900/40 text-slate-300 border-slate-700"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt={lightboxName} className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" />
            <p className="text-white text-sm">{lightboxName}</p>
            <Button onClick={() => setLightboxImage(null)} className="bg-slate-700 text-white rounded-lg">Close</Button>
          </div>
        </div>
      )}
      {showActionsModal && <UserActionsModal user={selectedUserForActions} onClose={handleCloseActionsModal} />}
      {showTasksModal && (
        <UserTasksModal
          userId={selectedUserForTasks._id}
          userDetails={selectedUserForTasks}
          onClose={handleCloseTasksModal}
        />
      )}
      {showTransactionsModal && <TransactionsListModal onClose={handleCloseTransactionsModal} />}
      {showRewardModal && <RandomRewardModal user={selectedUserForReward} onClose={handleCloseRewardModal} />}
    </div>
  )
}
