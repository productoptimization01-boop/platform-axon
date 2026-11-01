"use client"
import { useEffect, useState } from "react"
import * as LucideIcons from "lucide-react"

// First-time popup for a new unread notification: shows once per notification
// (the parent marks the notification id as "shown" in localStorage), slides in
// above the bottom nav, and auto-dismisses after 12s. Dismissing is NOT reading:
// the bell dot stays until the user opens the notifications dropdown.
export default function NotificationPopup({ notification, unreadCount, onView, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const enter = setTimeout(() => setVisible(true), 50)
    const autoHide = setTimeout(onDismiss, 12000)
    return () => { clearTimeout(enter); clearTimeout(autoHide) }
  }, [onDismiss])

  if (!notification) return null

  const iconColor =
    notification.type === "success" ? "text-green-400" :
    notification.type === "warning" ? "text-yellow-400" :
    notification.type === "error" ? "text-red-400" : "text-lime-400"

  return (
    <div
      className={`fixed z-[100] inset-x-4 bottom-24 sm:inset-x-auto sm:right-6 sm:w-96 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <div className="bg-gradient-to-br from-[#3d4e3f] to-[#2d3e2f] border-2 border-[#a3d65c] rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#a3d65c] via-lime-400 to-[#8bc34a]" />
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#a3d65c]/20 shrink-0">
              <LucideIcons.BellRing className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">
                New notification{unreadCount > 1 ? ` (${unreadCount} unread)` : ""}
              </p>
              <p className="text-sm text-gray-200 mt-1 leading-snug">{notification.message}</p>
              {notification.createdAt && (
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={onDismiss}
              title="Dismiss"
              className="text-gray-400 hover:text-white transition-colors p-1 shrink-0"
            >
              <LucideIcons.X className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={onView}
            className="mt-3 w-full py-2.5 rounded-xl bg-[#a3d65c] text-[#1a2617] font-bold hover:bg-[#8bc34a] transition-colors"
          >
            View notifications
          </button>
        </div>
      </div>
    </div>
  )
}
