"use client"

import SupportChat from "./SupportChat"
import { useUsersContext } from "@/app/AllContext/UsersContext"

// Single chat panel for the whole app, mounted in the root layout.
// Because it lives in the layout (not inside a page), the auto-open
// from ChatContext works on ANY page the user is on, including pages
// that never mounted their own SupportChat (e.g. Records, Terms).
// Per-page panel mounts were removed; header trigger buttons remain
// and only render a trigger, never a second panel.
export default function GlobalSupportChat() {
  const { user } = useUsersContext()
  if (!user?._id) return null
  return <SupportChat userId={user._id} username={user.username} />
}
