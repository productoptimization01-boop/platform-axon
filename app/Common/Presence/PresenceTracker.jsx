"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { fetchAdminSettings } from "@/lib/admin-settings"

// Realtime presence beacon for the main app.
// Every 45 seconds (and on every page change) a logged-in user sends a
// heartbeat to the backend, which stores lastSeenAt / currentPage /
// currentActivity on the user. The dashboard counts a user as online if
// lastSeenAt is within the last 2 minutes, so closing the tab makes the
// user go offline automatically, with no logout signal needed.
// If Realtime Events is OFF in Admin Settings, no heartbeat is sent at all.
const PAGE_LABELS = {
  "/": "Home",
  "/starting": "Starting",
  "/deposit": "Deposit",
  "/profile": "Profile",
  "/vip-levels": "VIP Levels",
  "/records": "Records",
  "/withdrawal": "Withdrawal",
  "/payment-method": "Payment Method",
  "/personal-information": "Personal Information",
  "/certificate": "Certificate",
  "/about": "About",
  "/event": "Event",
}

function pageLabel(pathname) {
  if (!pathname) return "App"
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  const first = pathname.split("/").filter(Boolean)[0]
  if (!first) return "Home"
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export default function PresenceTracker() {
  const pathname = usePathname()
  const activityRef = useRef("")
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  useEffect(() => {
    activityRef.current = pageLabel(pathname)
    sendHeartbeat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const onActivity = (e) => {
      if (e?.detail?.activity) {
        activityRef.current = String(e.detail.activity)
        sendHeartbeat()
      }
    }
    window.addEventListener("axon-activity", onActivity)
    const interval = setInterval(sendHeartbeat, 45000)
    return () => {
      window.removeEventListener("axon-activity", onActivity)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function sendHeartbeat() {
    try {
      const stored = localStorage.getItem("user")
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (!parsed?._id) return
      const settings = await fetchAdminSettings()
      if (settings?.realtimeEvents && settings.realtimeEvents.enabled === false) return
      const page = pageLabel(pathnameRef.current || pathname)
      const activity = activityRef.current || page
      await fetch(`https://platform-axon-rust.vercel.app/api/users/presence/${parsed._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, activity }),
      })
    } catch (e) {
      // Presence is best-effort; never break the app if it fails.
    }
  }

  return null
}
