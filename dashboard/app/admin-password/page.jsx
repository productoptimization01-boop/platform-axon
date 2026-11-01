"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as LucideIcons from "lucide-react"

// Secure admin setup page (Req 10).
// This page is intentionally not linked from public pages; an admin
// reaches it directly at /admin-password. It sets the admin panel
// username and password. After it is set, the dashboard login requires
// that username and password, and the password is stored only as a hash.
export default function AdminPasswordPage() {
  const [formData, setFormData] = useState({ username: "", password: "", confirmPassword: "" })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    if (!formData.username.trim() || !formData.password) {
      setError("Please enter a username and password.")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("https://platform-axon-rust.vercel.app/api/settings/admin-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.username.trim(), password: formData.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save admin credentials.")
      setMessage("Admin username and password saved. The admin panel now requires them to log in.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Password Setup</h2>
            <p className="text-slate-600 mt-2">Set the username and password for the admin panel.</p>
          </div>
          <Card className="p-8 bg-white/70 backdrop-blur-sm shadow-2xl border border-white/20 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Admin username</Label>
                <Input value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Enter admin username" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Admin password</Label>
                <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter admin password" className="h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Confirm password</Label>
                <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm admin password" className="h-12" />
              </div>
              {error && <p className="text-red-700 text-sm">{error}</p>}
              {message && <p className="text-green-700 text-sm">{message}</p>}
              <Button type="submit" disabled={saving} className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                {saving ? <LucideIcons.Loader2 className="h-5 w-5 animate-spin" /> : "Save Admin Credentials"}
              </Button>
            </form>
          </Card>
          <div className="text-center mt-6">
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">Go to Admin Login</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
