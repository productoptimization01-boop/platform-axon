"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"
import { usePathname } from "next/navigation"

export default function CertificatePage() {
  const pathname = usePathname()

  const bottomNavLinks = [
    { name: "Home", icon: LucideIcons.Home, href: "/" },
    { name: "Starting", icon: LucideIcons.PlayCircle, href: "/starting" },
    { name: "Records", icon: LucideIcons.ClipboardList, href: "#" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#2d3e2f]">
      {/* Header for Certificate Page */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-[#3a4d3c]/70 backdrop-blur-sm border-b border-[#a3d65c]/20 shadow-lg">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-[#a3d65c] transition-colors">
          <div className="p-2 rounded-full bg-[#a3d65c] text-[#2d3e2f]">
            <LucideIcons.ChevronLeft className="h-5 w-5" />
          </div>
          <span className="sr-only">Back to Home</span>
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-wide">Company Certificate</h1>
        <div className="w-6" /> {/* Placeholder for alignment */}
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto">
          <Card className="p-8 bg-[#3a4d3c]/70 backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-white mb-6">Official Company Certificate</h2>
            <div className="relative w-full max-w-2xl h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl border-2 border-[#a3d65c] shadow-2xl bg-[#2d3e2f]/50 backdrop-blur-sm">
              <Image
                src="/certificate.webp"
                alt="Official Company Certificate"
                layout="fill"
                objectFit="contain"
                className="z-0 rounded-2xl"
              />
            </div>
            <p className="text-gray-300 text-center mt-6 text-lg">
              This certificate verifies the official registration and compliance of our company.
            </p>
          </Card>
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3a4d3c]/90 backdrop-blur-xl border-t border-[#a3d65c]/20 p-4 shadow-2xl z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {bottomNavLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.name} href={link.href} className="flex-1">
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center gap-2 w-full p-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-[#a3d65c] text-[#2d3e2f] shadow-lg transform scale-105"
                      : "text-white hover:text-[#a3d65c] hover:bg-[#2d3e2f]"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-semibold">{link.name}</span>
                  {isActive && <div className="w-1 h-1 bg-[#2d3e2f] rounded-full"></div>}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
