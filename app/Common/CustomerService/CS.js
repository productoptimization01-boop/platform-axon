"use client"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import { useEffect, useState } from "react"
import { useLiveSupportContext } from "@/app/AllContext/ChatContext"
import { fetchAdminSettings, DEFAULT_SETTINGS, whatsappUrlFromValue } from "@/lib/admin-settings"

export default function CS({ message = "How can we help you today? Choose your preferred contact method.", userId, username }) {
  const { setIsChatOpen, connectSSE, fetchChatHistory } = useLiveSupportContext()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  useEffect(() => { fetchAdminSettings().then(setSettings) }, [])

  const handleOpenChat = async () => {
    if (!userId) return
    setIsChatOpen(true)
    await fetchChatHistory(userId)
    connectSSE(userId)
  }

  // Admin-controlled contact channels (Req 5): only visible channels
  // from Admin Settings are shown, in admin order. Live Chat can be
  // hidden by an admin, and a WhatsApp number can be changed there.
  const contactMethods = (settings.contactChannels || [])
    .filter((channel) => channel.visible !== false)
    .map((channel) => {
      if (channel.type === "live-chat" || channel.name === "Live Chat") {
        return { name: channel.name, icon: "MessageCircle", description: "Chat with our support team", onClick: handleOpenChat }
      }
      if (channel.type === "whatsapp" || channel.name === "WhatsApp") {
        return {
          name: channel.name,
          icon: "MessageSquare",
          description: channel.value || "+1 781-961-7200",
          onClick: () => { window.open(channel.url || whatsappUrlFromValue(channel.value, "https://wa.me/17819617200"), "_blank") },
        }
      }
      return {
        name: channel.name,
        icon: "MessageSquare",
        description: channel.value || "",
        onClick: () => { if (channel.url) window.open(channel.url, "_blank") },
      }
    })

  return (
    <DialogContent className="bg-[#2d3e2f] border-[#3d4f3f] text-white max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#a3d65c]">Online Support</DialogTitle>
        <DialogDescription className="text-gray-300">
          {message}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {contactMethods.map((method) => {
          const IconComponent = LucideIcons[method.icon]
          return (
            <Button
              key={method.name}
              variant="outline"
              onClick={method.onClick}
              className="w-full h-auto p-4 bg-[#3d4f3f]/50 border-[#3d4f3f] hover:bg-[#3d4f3f] hover:border-[#a3d65c] transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-3 rounded-xl bg-[#a3d65c] shadow-lg flex-shrink-0">
                  {IconComponent && <IconComponent className="h-6 w-6 text-[#2d3e2f]" />}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-white group-hover:text-[#a3d65c] transition-colors">{method.name}</h3>
                  <p className="text-sm text-gray-400">{method.description}</p>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#a3d65c] transition-colors" />
              </div>
            </Button>
          )
        })}

      </div>

      <div className="pt-4 border-t border-[#3d4f3f]">
        <p className="text-sm text-gray-400 text-center">
          <LucideIcons.Clock className="h-4 w-4 inline mr-1" />
          {/* Fixed support hours for this dialog only: NOT driven by
              Admin Settings working hours, per admin instruction. Other
              places that use working hours remain dynamic. */}
          Available from 11:00 AM to 11:00 PM EST for your support.
        </p>
      </div>
    </DialogContent>
  )
}
