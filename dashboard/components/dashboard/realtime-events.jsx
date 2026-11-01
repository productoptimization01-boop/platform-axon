"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import { useDashboard } from "@/app/AllContext/DashboardContext"
import { formatLocation } from "@/lib/admin-settings"

function timeAgo(iso) {
  if (!iso) return "—"
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

// Realtime Events tab: who is online right now, what page they are on,
// what activity they are doing, and a live feed of realtime changes.
// Data comes from the already-used SSE transport (EventSource) plus the
// backend /online endpoint polled every 30s. A user is online if their
// last heartbeat was within the last 2 minutes.
export default function RealtimeEvents() {
  const { onlineUsers, onlineCount, realtimeEnabled, realtimeConnected, realtimeEvents, setActiveTab, users } = useDashboard()

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Realtime Events
        </h2>
        <p className="text-slate-400 mt-2">Live online users, their current page and activity, and realtime changes.</p>
      </div>

      {!realtimeEnabled ? (
        <Card className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3">
          <p className="text-slate-200 font-semibold">Realtime Events is OFF</p>
          <p className="text-slate-400 text-sm">The realtime feed and presence tracking are turned off in Admin Settings to reduce realtime-server consumption. Turn it back on there to see online users here again.</p>
          <Button onClick={() => setActiveTab("settings")} className="bg-cyan-600 text-white rounded-lg">Go to Admin Settings</Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-slate-400 text-sm">Users online now</span>
              </div>
              <p className="text-3xl font-bold text-white mt-2">{onlineCount}</p>
              <p className="text-slate-500 text-xs mt-1">Seen in the last 2 minutes</p>
            </Card>
            <Card className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
              <span className="text-slate-400 text-sm">Realtime feed</span>
              <p className="text-3xl font-bold text-white mt-2">{realtimeConnected ? "Connected" : "Connecting…"}</p>
              <p className="text-slate-500 text-xs mt-1">Live SSE feed from the realtime server</p>
            </Card>
            <Card className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
              <span className="text-slate-400 text-sm">Total users loaded</span>
              <p className="text-3xl font-bold text-white mt-2">{users?.length || 0}</p>
              <p className="text-slate-500 text-xs mt-1">From the Users Management list</p>
            </Card>
          </div>

          <Card className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-100">Online Users</h3>
            {onlineUsers.length === 0 ? (
              <p className="text-slate-400 text-sm">No users are online right now. A user appears here within about a minute of opening the app, and disappears about 2 minutes after closing it.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] table-fixed text-sm text-slate-300">
                  <colgroup><col className="w-[220px]" /><col className="w-[140px]" /><col className="w-[180px]" /><col className="w-[180px]" /></colgroup>
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">User</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">VIP</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Current Page</th>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Activity / Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onlineUsers.map((u) => (
                      <tr key={u._id} className="border-b border-slate-700/30">
                        <td className="px-4 py-3 align-middle">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                            {(u.profile?.photoLink || u.profileimage) && u.profile?.photoLink !== "none" && u.profileimage !== "none" ? (
                              <img src={u.profile?.photoLink || u.profileimage} alt={u.username} className="w-9 h-9 rounded-full object-cover border border-slate-600" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">{u.username?.charAt(0)}</div>
                            )}
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-slate-900" title="Online" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-200 truncate">{u.username}</div>
                              {formatLocation(u.location) && <div className="text-xs text-slate-500 truncate">{formatLocation(u.location)}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle whitespace-nowrap">{u.currentVIPLevel ? `VIP ${u.currentVIPLevel.number} - ${u.currentVIPLevel.name}` : "—"}</td>
                        <td className="px-4 py-3 align-middle truncate">{u.currentPage || "—"}</td>
                        <td className="px-4 py-3 align-middle">
                          <div className="truncate">{u.currentActivity || u.currentPage || "Browsing"}</div>
                          <div className="text-xs text-slate-500">{timeAgo(u.lastSeenAt)} · <span className="text-green-400">Online</span></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl space-y-3">
            <h3 className="text-xl font-bold text-slate-100">Live Events Feed</h3>
            {realtimeEvents.length === 0 ? (
              <p className="text-slate-400 text-sm">No realtime events yet in this session. New events appear here as they happen.</p>
            ) : (
              <div className="space-y-2">
                {realtimeEvents.map((e, i) => (
                  <div key={i} className="flex gap-3 items-start text-sm border border-slate-700/40 rounded-xl p-3">
                    <LucideIcons.Activity className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-slate-200 font-semibold">{e.username ? `${e.username} — ` : ""}{e.description}</span>
                      <span className="text-slate-500"> · {e.type} · {new Date(e.time).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
