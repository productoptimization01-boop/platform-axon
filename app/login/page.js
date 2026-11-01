"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import * as LucideIcons from "lucide-react"
import { useUsersContext } from "../AllContext/UsersContext"
import { useRouter } from "next/navigation"
import SupportChat from "@/app/Common/SupportChat/SupportChat"
import CS from "@/app/Common/CustomerService/CS"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const router = useRouter()
  const [storedUser, setStoredUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
    } else {
      setStoredUser(JSON.parse(userData))
    }
  }, [])

  const { loginUser } = useUsersContext()
  const [error, setError] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const result = await loginUser(formData)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    }
  }

  // Function to generate a random 10-digit number as string
  const generateUserId = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString()
  }

  return (
    <>
    <SupportChat userId={generateUserId()} username="Anonymous User" />
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#2d3e2f] via-[#3a4d3c] to-[#354a37]">
        {/* Enhanced Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#2d3e2f]/80 border-b border-[#a3d65c]/20 shadow-lg">
          <div className="flex items-center justify-between p-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-gray-300 hover:text-[#a3d65c] transition-colors rounded-xl hover:bg-[#3a4d3c] p-2"
            >
              <LucideIcons.ChevronLeft className="h-6 w-6" />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-2xl font-bold text-[#a3d65c]">Login</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-[#3a4d3c] hover:bg-[#a3d65c] border-[#a3d65c] hover:border-[#a3d65c] text-[#a3d65c] hover:text-[#2d3e2f] transition-all"
                >
                  <LucideIcons.Headphones className="h-4 w-4" />
                  <span className="hidden sm:inline">Support</span>
                </Button>
              </DialogTrigger>
              <CS userId={generateUserId()} username="Anonymous User" />
            </Dialog>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-md space-y-8">
            {/* Logo Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#a3d65c] flex items-center justify-center">
                  <LucideIcons.Zap className="h-7 w-7 text-[#2d3e2f]" />
                </div>
                <h2 className="text-3xl font-bold text-[#a3d65c] tracking-wide">Axon</h2>
              </div>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-[#3a4d3c] rounded-full">
                <LucideIcons.LogIn className="h-5 w-5 text-[#a3d65c]" />
                <span className="text-white font-semibold">Welcome</span>
              </div>
              <p className="text-gray-300 text-lg">Sign in to your account</p>
            </div>

            {/* Login Form */}
            <Card className="p-8 bg-[#3a4d3c]/70 backdrop-blur-sm shadow-2xl border border-[#a3d65c]/20 rounded-3xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username Field */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white font-semibold flex items-center gap-2">
                    <LucideIcons.User className="h-4 w-4" />
                    Username
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <LucideIcons.User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-12 h-14 text-lg bg-[#2d3e2f] text-white border-2 border-[#4a5d4c] rounded-2xl focus:border-[#a3d65c] focus:ring-4 focus:ring-[#a3d65c]/20 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
                    <LucideIcons.Lock className="h-4 w-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <LucideIcons.Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-14 text-lg bg-[#2d3e2f] text-white border-2 border-[#4a5d4c] rounded-2xl focus:border-[#a3d65c] focus:ring-4 focus:ring-[#a3d65c]/20 transition-all"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#a3d65c]"
                    >
                      {showPassword ? (
                        <LucideIcons.EyeOff className="h-5 w-5" />
                      ) : (
                        <LucideIcons.Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Forgot Password Link (Req 4) */}
                {/* Clicking this opens support: the user is told to contact
                    support, share their account number, and support will
                    reset their account password. */}
                <div className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="text-[#a3d65c] hover:text-[#b5e77d] font-medium text-sm transition-colors">
                        Forgot Password?
                      </button>
                    </DialogTrigger>
                    <CS
                      userId={generateUserId()}
                      username="Anonymous User"
                      message="To reset your password, please contact support, tell support your account number, and support will reset your account password."
                    />
                  </Dialog>
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-bold bg-[#a3d65c] hover:bg-[#b5e77d] text-[#2d3e2f] shadow-2xl rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LucideIcons.LogIn className="h-5 w-5" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            </Card>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link href="/signup" className="text-[#a3d65c] hover:text-[#b5e77d] font-bold transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-4 bg-[#3a4d3c]/50 rounded-2xl border border-[#a3d65c]/20">
                <div className="w-10 h-10 bg-[#a3d65c] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <LucideIcons.Shield className="h-5 w-5 text-[#2d3e2f]" />
                </div>
                <p className="text-xs font-medium text-white">Secure</p>
              </div>
              <div className="text-center p-4 bg-[#3a4d3c]/50 rounded-2xl border border-[#a3d65c]/20">
                <div className="w-10 h-10 bg-[#a3d65c] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <LucideIcons.Zap className="h-5 w-5 text-[#2d3e2f]" />
                </div>
                <p className="text-xs font-medium text-white">Fast</p>
              </div>
              <div className="text-center p-4 bg-[#3a4d3c]/50 rounded-2xl border border-[#a3d65c]/20">
                <div className="w-10 h-10 bg-[#a3d65c] rounded-xl flex items-center justify-center mx-auto mb-2">
                  <LucideIcons.Users className="h-5 w-5 text-[#2d3e2f]" />
                </div>
                <p className="text-xs font-medium text-white">Trusted</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
