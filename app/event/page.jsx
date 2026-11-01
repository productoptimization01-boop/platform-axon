"use client"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import * as LucideIcons from "lucide-react"

export default function EventPage() {
  const pathname = usePathname()

  const events = [
    {
      id: 1,
      title: "Annual Tech Summit 2025",
      date: "October 26, 2025",
      time: "9:00 AM - 5:00 PM",
      location: "Convention Center, Cityville",
      description: "Join industry leaders and innovators for a day of insightful talks and networking opportunities.",
      image: "/tech-conference-networking.png",
      href: "#",
      category: "Conference",
      price: "Free",
      attendees: "500+",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#354a37]",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Digital Marketing Workshop",
      date: "November 10, 2025",
      time: "10:00 AM - 1:00 PM",
      location: "Online (Zoom)",
      description: "Learn the latest strategies in digital marketing from industry experts and boost your skills.",
      image: "/digital-marketing-workshop.png",
      href: "#",
      category: "Workshop",
      price: "$49",
      attendees: "150+",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#354a37]",
      status: "upcoming",
    },
    {
      id: 3,
      title: "Startup Pitch Competition",
      date: "December 5, 2025",
      time: "2:00 PM - 6:00 PM",
      location: "Innovation Hub, Downtown",
      description: "Witness groundbreaking ideas and support emerging startups in this exciting competition.",
      image: "/placeholder-xs19e.png",
      href: "#",
      category: "Competition",
      price: "Free",
      attendees: "300+",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#354a37]",
      status: "hot",
    },
    {
      id: 4,
      title: "Web Development Bootcamp",
      date: "January 15-17, 2026",
      time: "9:00 AM - 4:00 PM Daily",
      location: "Tech Campus, Northside",
      description: "Intensive 3-day bootcamp to kickstart your career in web development with hands-on projects.",
      image: "/coding-bootcamp-students.png",
      href: "#",
      category: "Bootcamp",
      price: "$299",
      attendees: "50+",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#354a37]",
      status: "upcoming",
    },
    {
      id: 5,
      title: "AI & Machine Learning Summit",
      date: "February 20, 2026",
      time: "10:00 AM - 6:00 PM",
      location: "Science Center, Midtown",
      description: "Explore the future of AI and machine learning with leading researchers and practitioners.",
      image: "/placeholder-jnkgq.png",
      href: "#",
      category: "Summit",
      price: "$99",
      attendees: "400+",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#354a37]",
      status: "new",
    },
    {
      id: 6,
      title: "UX/UI Design Masterclass",
      date: "March 8, 2026",
      time: "1:00 PM - 5:00 PM",
      location: "Design Studio, Creative District",
      description: "Master the art of user experience and interface design with practical exercises and feedback.",
      image: "/ux-ui-workshop-creative.png",
      href: "#",
      category: "Masterclass",
      price: "$79",
      attendees: "100+",
      color: "from-[#a3d65c] to-[#8bc34a]",
      bgColor: "from-[#3a4d3c] to-[#354a37]",
      status: "upcoming",
    },
  ]

  const bottomNavLinks = [
    { name: "Home", icon: LucideIcons.Home, href: "/" },
    { name: "Starting", icon: LucideIcons.PlayCircle, href: "/starting" },
    { name: "Records", icon: LucideIcons.ClipboardList, href: "#" },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case "hot":
        return (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] text-[#2d3e2f] text-xs font-bold rounded-full shadow-lg animate-pulse">
            🔥 HOT
          </div>
        )
      case "new":
        return (
          <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] text-[#2d3e2f] text-xs font-bold rounded-full shadow-lg">
            ✨ NEW
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#2d3e2f] via-[#354a37] to-[#3a4d3c]">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#2d3e2f]/90 border-b border-[#a3d65c]/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-gray-300 hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#3a4d3c] p-2"
          >
            <LucideIcons.ChevronLeft className="h-6 w-6" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] bg-clip-text text-transparent">
            Events
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 md:p-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-gradient-to-r from-[#3a4d3c] to-[#354a37] rounded-full border border-[#a3d65c]/30">
              <LucideIcons.Calendar className="h-6 w-6 text-[#a3d65c]" />
              <span className="text-[#a3d65c] font-semibold">Discover Amazing Events</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join our exclusive events and connect with like-minded professionals in your industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card
                key={event.id}
                className="group relative bg-[#3a4d3c]/70 backdrop-blur-sm shadow-xl border border-[#a3d65c]/20 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-[#a3d65c]/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
              >
                {/* Status Badge */}
                {getStatusBadge(event.status)}

                {/* Event Image */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d3e2f]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div
                      className={`px-3 py-1 bg-gradient-to-r ${event.color} text-[#2d3e2f] text-sm font-bold rounded-full shadow-lg`}
                    >
                      {event.category}
                    </div>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#a3d65c] transition-colors line-clamp-2">
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="p-1 rounded-lg bg-[#a3d65c]/20 mr-3">
                        <LucideIcons.CalendarDays className="h-4 w-4 text-[#a3d65c]" />
                      </div>
                      <span className="font-medium">{event.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="p-1 rounded-lg bg-[#a3d65c]/20 mr-3">
                        <LucideIcons.Clock className="h-4 w-4 text-[#a3d65c]" />
                      </div>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <div className="p-1 rounded-lg bg-[#a3d65c]/20 mr-3">
                        <LucideIcons.MapPin className="h-4 w-4 text-[#a3d65c]" />
                      </div>
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                  {/* Event Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <LucideIcons.Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-300 font-medium">{event.attendees}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <LucideIcons.DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-bold text-[#a3d65c]">{event.price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      className={`flex-1 bg-gradient-to-r ${event.color} hover:opacity-90 text-[#2d3e2f] font-bold py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      <LucideIcons.Calendar className="h-4 w-4 mr-2" />
                      Register
                    </Button>
                    <Button
                      variant="outline"
                      className="px-4 py-3 rounded-xl border-2 border-[#a3d65c]/30 hover:bg-[#a3d65c]/10 hover:border-[#a3d65c] transition-colors bg-transparent text-white"
                    >
                      <LucideIcons.Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12 mb-20">
            <Button className="bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] hover:opacity-90 text-[#2d3e2f] font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <LucideIcons.Plus className="h-5 w-5 mr-2" />
              Load More Events
            </Button>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2d3e2f]/95 backdrop-blur-xl border-t border-[#a3d65c]/20 p-4 shadow-2xl z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {bottomNavLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link key={link.name} href={link.href} className="flex-1">
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center gap-2 w-full p-3 rounded-2xl transition-all duration-300 ${isActive
                      ? "bg-gradient-to-r from-[#a3d65c] to-[#8bc34a] text-[#2d3e2f] shadow-lg transform scale-105"
                      : "text-gray-300 hover:text-[#a3d65c] hover:bg-[#3a4d3c]"
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
