"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import * as LucideIcons from "lucide-react"
import { fetchAdminSettings, invalidateAdminSettingsCache, DEFAULT_SETTINGS } from "@/lib/admin-settings"
import { useDashboard } from "@/app/AllContext/DashboardContext"

const API = "https://platform-axon-rust.vercel.app/api/settings"

export default function AdminSettings() {
  const dashboardCtx = useDashboard()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [cloudSecret, setCloudSecret] = useState("")
  const [cloudTest, setCloudTest] = useState("")
  const testCloudinary = async () => {
    setCloudTest("Testing Cloudinary...")
    try {
      const res = await fetch("https://platform-axon-rust.vercel.app/api/settings/test-cloudinary", { method: "POST" })
      const data = await res.json()
      setCloudTest(data.ok ? "Cloudinary test passed." : `Cloudinary test failed: ${data.error || "Unknown error"}`)
    } catch (e) {
      setCloudTest(`Cloudinary test failed: ${e.message}`)
    }
  }

  useEffect(() => { fetchAdminSettings().then(setSettings) }, [])

  const save = async () => {
    setSaving(true)
    setMessage("")
    try {
      const payload = { ...settings }
      payload.cloudinary = { cloudName: settings.cloudinary?.cloudName || "", apiKey: settings.cloudinary?.apiKey || "", apiSecret: cloudSecret || undefined }
      const res = await fetch(API, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      setSettings(data.settings)
      if (dashboardCtx?.setRealtimeEnabled && data.settings?.realtimeEvents) {
        dashboardCtx.setRealtimeEnabled(data.settings.realtimeEvents.enabled !== false)
      }
      setCloudSecret("")
      invalidateAdminSettingsCache()
      setMessage("Settings saved.")
    } catch (e) {
      setMessage(e.message || "Failed to save settings.")
    } finally {
      setSaving(false)
    }
  }

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }))
  const updateWorkingHours = (key, value) => setSettings((s) => ({ ...s, workingHours: { ...s.workingHours, [key]: value } }))
  const updateRealtime = (key, value) => setSettings((s) => ({ ...s, realtimeEvents: { ...s.realtimeEvents, [key]: value } }))
  const updateCloud = (key, value) => setSettings((s) => ({ ...s, cloudinary: { ...s.cloudinary, [key]: value } }))

  const editChannel = (i, key, value) => setSettings((s) => ({ ...s, contactChannels: s.contactChannels.map((c, j) => (j === i ? { ...c, [key]: value } : c)) }))
  const addChannel = () => setSettings((s) => ({ ...s, contactChannels: [...s.contactChannels, { name: "New Channel", type: "custom", value: "", url: "", visible: true }] }))
  const removeChannel = (i) => setSettings((s) => ({ ...s, contactChannels: s.contactChannels.filter((_, j) => j !== i) }))

  const editVip = (i, key, value) => setSettings((s) => ({ ...s, vipLevels: s.vipLevels.map((v, j) => (j === i ? { ...v, [key]: value } : v)) }))
  const addVip = () => setSettings((s) => ({ ...s, vipLevels: [...s.vipLevels, { level: `VIP${s.vipLevels.length + 1}`, name: "New Tier", amount: "", depositRequired: 0, commission: "", withdrawalLimit: "", features: [], badge: "", iconName: "Star", visible: true }] }))
  const removeVip = (i) => setSettings((s) => ({ ...s, vipLevels: s.vipLevels.filter((_, j) => j !== i) }))

  const editDeposit = (i, key, value) => setSettings((s) => ({ ...s, depositAddresses: s.depositAddresses.map((a, j) => (j === i ? { ...a, [key]: value } : a)) }))
  const addDeposit = () => setSettings((s) => ({ ...s, depositAddresses: [...(s.depositAddresses || []), { label: "", walletName: "", walletAddress: "", visible: true }] }))
  const removeDeposit = (i) => setSettings((s) => ({ ...s, depositAddresses: s.depositAddresses.filter((_, j) => j !== i) }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Admin Settings</h2>
        <p className="text-slate-400 mt-2">Brand, contact channels, VIP levels, working hours, Cloudinary and deposit addresses. Changes apply to the whole system.</p>
        {message && <p className="text-slate-200 mt-3">{message}</p>}
      </div>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Brand Name</h3>
        <div className="space-y-2">
          <Label className="text-slate-300">Brand name (used throughout the system)</Label>
          <Input value={settings.brandName || ""} onChange={(e) => update("brandName", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" />
        </div>
        <p className="text-sm text-slate-400">Admin panel login: set a username and password by opening the /admin-password page directly (it is intentionally not linked). After that, the panel requires that username and password.</p>
      </Card>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Contact Channels</h3>
        <p className="text-sm text-slate-400">Show, hide, edit or add channels. Even Live Chat can be hidden. For WhatsApp, change the number here.</p>
        {(settings.contactChannels || []).map((channel, i) => (
          <div key={i} className="grid md:grid-cols-4 gap-3 items-end border border-slate-700/50 rounded-xl p-3">
            <div><Label className="text-slate-300">Name</Label><Input value={channel.name} onChange={(e) => editChannel(i, "name", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Value / number</Label><Input value={channel.value || ""} onChange={(e) => editChannel(i, "value", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Link (optional)</Label><Input value={channel.url || ""} onChange={(e) => editChannel(i, "url", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div className="flex gap-2">
              <Button onClick={() => editChannel(i, "visible", !channel.visible)} className="bg-slate-700 text-slate-100 rounded-lg">{channel.visible !== false ? "Visible" : "Hidden"}</Button>
              <Button onClick={() => removeChannel(i)} className="bg-red-600 text-white rounded-lg">Remove</Button>
            </div>
          </div>
        ))}
        <Button onClick={addChannel} className="bg-cyan-600 text-white rounded-lg">Add Channel</Button>
      </Card>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">VIP Levels</h3>
        <p className="text-sm text-slate-400">Defaults are the existing levels (VIP1 1000 USD, VIP2 2000 USD, VIP3 3000 USD, VIP4 5000 USD). Edit name, deposit, commission, withdrawal limit and features, or add/remove a level.</p>
        {(settings.vipLevels || []).map((vip, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-3 border border-slate-700/50 rounded-xl p-3">
            <div><Label className="text-slate-300">Level</Label><Input value={vip.level} onChange={(e) => editVip(i, "level", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Name</Label><Input value={vip.name} onChange={(e) => editVip(i, "name", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Minimum deposit (USD)</Label><Input type="number" value={vip.depositRequired} onChange={(e) => editVip(i, "depositRequired", Number(e.target.value))} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Amount label</Label><Input value={vip.amount || ""} onChange={(e) => editVip(i, "amount", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Commission</Label><Input value={vip.commission || ""} onChange={(e) => editVip(i, "commission", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div><Label className="text-slate-300">Withdrawal limit</Label><Input value={vip.withdrawalLimit || ""} onChange={(e) => editVip(i, "withdrawalLimit", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div className="md:col-span-2"><Label className="text-slate-300">Features (comma separated)</Label><Input value={(vip.features || []).join(", ")} onChange={(e) => editVip(i, "features", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div className="flex gap-2 items-end">
              <Button onClick={() => editVip(i, "visible", !vip.visible)} className="bg-slate-700 text-slate-100 rounded-lg">{vip.visible !== false ? "Visible" : "Hidden"}</Button>
              <Button onClick={() => removeVip(i)} className="bg-red-600 text-white rounded-lg">Remove</Button>
            </div>
          </div>
        ))}
        <Button onClick={addVip} className="bg-cyan-600 text-white rounded-lg">Add VIP Level</Button>
      </Card>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Realtime Events</h3>
        <p className="text-sm text-slate-400">Controls the Realtime Events tab, the online-users count, and presence tracking. When OFF, the main app stops sending presence heartbeats and the dashboard closes its realtime SSE feed, so realtime-server consumption drops. Live support chat is separate and keeps working. Remember to click “Save All Settings” at the bottom after changing this.</p>
        <div className="flex gap-2 items-center">
          <Button onClick={() => updateRealtime("enabled", !settings.realtimeEvents?.enabled)} className="bg-slate-700 text-slate-100 rounded-lg">{settings.realtimeEvents?.enabled !== false ? "Turn OFF Realtime Events" : "Turn ON Realtime Events"}</Button>
          <span className="text-sm text-slate-300">Current: {settings.realtimeEvents?.enabled !== false ? "ON — realtime feed active" : "OFF — no realtime feed, no presence tracking"}</span>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Working Hours</h3>
        <p className="text-sm text-slate-400">How to end the restriction: click the button below to turn Working Hours OFF, then click “Save All Settings” at the bottom of this page. When OFF, tasks can be started at any time, and every place in the app that showed a fixed time window will show 24 hours instead. When ON, tasks are only allowed between the Start and End times below.</p>
        <div className="flex gap-2 items-center">
          <Button onClick={() => updateWorkingHours("enabled", !settings.workingHours?.enabled)} className="bg-slate-700 text-slate-100 rounded-lg">{settings.workingHours?.enabled ? "Turn OFF — make platform available 24 hours" : "Turn ON — restrict to working hours below"}</Button>
          <span className="text-sm text-slate-300">Current: {settings.workingHours?.enabled ? "Restricted to working hours" : "Available 24 hours (no restriction)"}</span>
        </div>
        {!settings.workingHours?.enabled && <p className="text-sm text-slate-400">The Start/End times below are ignored while Working Hours is OFF. They will apply again only if you turn it back ON and save.</p>}
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label className="text-slate-300">Start label</Label><Input value={settings.workingHours?.startLabel || ""} onChange={(e) => updateWorkingHours("startLabel", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
          <div><Label className="text-slate-300">End label</Label><Input value={settings.workingHours?.endLabel || ""} onChange={(e) => updateWorkingHours("endLabel", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
          <div><Label className="text-slate-300">Timezone</Label><Input value={settings.workingHours?.timezone || ""} onChange={(e) => updateWorkingHours("timezone", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
          <div><Label className="text-slate-300">Start (minutes from midnight)</Label><Input type="number" value={settings.workingHours?.startMinutes ?? 570} onChange={(e) => updateWorkingHours("startMinutes", Number(e.target.value))} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
          <div><Label className="text-slate-300">End (minutes from midnight)</Label><Input type="number" value={settings.workingHours?.endMinutes ?? 1290} onChange={(e) => updateWorkingHours("endMinutes", Number(e.target.value))} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Cloudinary (Profile Pictures)</h3>
        <p className="text-sm text-slate-400">Store Cloudinary credentials here; the system then uses Cloudinary for image storing. The secret is never shown back after saving — leave it blank to keep the existing secret. {settings.cloudinary?.configured ? "Cloudinary is configured." : "Cloudinary is not configured yet."}</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div><Label className="text-slate-300">Cloud name</Label><Input value={settings.cloudinary?.cloudName || ""} onChange={(e) => updateCloud("cloudName", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
          <div><Label className="text-slate-300">API key</Label><Input value={settings.cloudinary?.apiKey || ""} onChange={(e) => updateCloud("apiKey", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
          <div><Label className="text-slate-300">API secret (new value only)</Label><Input type="password" value={cloudSecret} onChange={(e) => setCloudSecret(e.target.value)} placeholder={settings.cloudinary?.secretSet ? "Secret is set (hidden)" : "Enter API secret"} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
        </div>
        <div className="flex gap-3 items-center">
          <Button onClick={testCloudinary} className="bg-cyan-600 text-white rounded-lg">Test Cloudinary</Button>
          {cloudTest && <p className="text-sm text-slate-200">{cloudTest}</p>}
        </div>
      </Card>

      <Card className="p-6 bg-slate-800/40 border border-slate-700/50 space-y-4">
        <h3 className="text-xl font-bold text-slate-100">Crypto Deposit Addresses</h3>
        <p className="text-sm text-slate-400">Addresses saved here show on the Deposit page. Existing deposit wallets are also shown there.</p>
        {(settings.depositAddresses || []).map((addr, i) => (
          <div key={i} className="grid md:grid-cols-3 gap-3 items-end border border-slate-700/50 rounded-xl p-3">
            <div><Label className="text-slate-300">Wallet name</Label><Input value={addr.walletName || ""} onChange={(e) => editDeposit(i, "walletName", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div className="md:col-span-2"><Label className="text-slate-300">Address</Label><Input value={addr.walletAddress || ""} onChange={(e) => editDeposit(i, "walletAddress", e.target.value)} className="bg-slate-900/60 border-slate-700 text-slate-100" /></div>
            <div className="flex gap-2">
              <Button onClick={() => editDeposit(i, "visible", !addr.visible)} className="bg-slate-700 text-slate-100 rounded-lg">{addr.visible !== false ? "Visible" : "Hidden"}</Button>
              <Button onClick={() => removeDeposit(i)} className="bg-red-600 text-white rounded-lg">Remove</Button>
            </div>
          </div>
        ))}
        <Button onClick={addDeposit} className="bg-cyan-600 text-white rounded-lg">Add Deposit Address</Button>
      </Card>

      <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl px-8 py-3 font-bold">
        {saving ? "Saving..." : "Save All Settings"}
      </Button>
    </div>
  )
}
