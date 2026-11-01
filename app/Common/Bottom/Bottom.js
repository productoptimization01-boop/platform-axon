"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"

const BottomNav = () => {
  const bottomNavLinks = [
    { name: "Home", icon: LucideIcons.Home, href: "/" },
    { name: "Records", icon: LucideIcons.ClipboardList, href: "/records" },
  ]

  const pathname = usePathname()
  const isStartingActive = pathname === "/starting"

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Background bar */}
      <div className="bg-[#2d3e2f] border-t border-[#3d4f3f] shadow-sm">
        <div className="flex justify-between items-center max-w-md mx-auto px-8 py-3 relative">
          {/* Home & Records */}
          {bottomNavLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link key={link.name} href={link.href}>
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-300
                    ${isActive ? "text-[#a3d65c] bg-[#3d4f3f]" : "text-gray-400 hover:text-white hover:bg-[#3d4f3f]/50"}
                  `}
                >
                  <Icon className={`h-6 w-6 transition-all ${isActive ? "scale-110" : ""}`} />
                  <span className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}>{link.name}</span>

                  {isActive && <div className="w-1 h-1 bg-[#a3d65c] rounded-full mt-0.5" />}
                </Button>
              </Link>
            )
          })}

          {/* Middle Start Button */}
          <Link href="/starting" className="absolute left-1/2 -translate-x-1/2 -top-8">
            <Button
              className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-300 border-4 border-[#2d3e2f]
                ${isStartingActive ? "bg-[#a3d65c] scale-110" : "bg-[#8bc34a] hover:scale-105 hover:bg-[#a3d65c]"}
              `}
            >
              <div className="flex flex-col items-center justify-center">
                <LucideIcons.Zap className="h-7 w-7 text-[#2d3e2f]" fill="#2d3e2f" />
              </div>
            </Button>

            {/* Label */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <span
                className={`text-xs font-semibold transition-all
                  ${isStartingActive ? "text-[#a3d65c]" : "text-gray-400"}
                `}
              >
                Starting
              </span>
              {isStartingActive && <div className="w-1 h-1 bg-[#a3d65c] rounded-full mx-auto mt-0.5" />}
            </div>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default BottomNav
