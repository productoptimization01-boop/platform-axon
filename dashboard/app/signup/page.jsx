"use client"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import * as LucideIcons from "lucide-react"
import { useUsersContext } from "../AllContext/UsersContext"

export default function SignupPage() {
  const { submitNewUser } = useUsersContext()
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    transactionPassword: "",
    loginPassword: "",
    confirmLoginPassword: "",
    gender: "",
    inviteCode: "",
    agreeToTerms: false,
  })

  const [showPasswords, setShowPasswords] = useState({
    transaction: false,
    login: false,
    confirm: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
    if (serverError) {
      setServerError("")
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      agreeToTerms: checked,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.includes(" ")) {
      newErrors.username = "Username cannot contain spaces"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    if (!formData.transactionPassword) {
      newErrors.transactionPassword = "Transaction password is required"
    } else if (formData.transactionPassword.length < 6) {
      newErrors.transactionPassword = "Must be at least 6 characters"
    }

    if (!formData.loginPassword) {
      newErrors.loginPassword = "Login password is required"
    } else if (formData.loginPassword.length < 6) {
      newErrors.loginPassword = "Must be at least 6 characters"
    }

    if (!formData.confirmLoginPassword) {
      newErrors.confirmLoginPassword = "Please confirm your password"
    } else if (formData.loginPassword !== formData.confirmLoginPassword) {
      newErrors.confirmLoginPassword = "Passwords do not match"
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setServerError("")

    const result = await submitNewUser(formData)
    if (result.error) {
      setIsLoading(false)
      setServerError(result.error)
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-3 text-slate-600 hover:text-blue-600">
            <LucideIcons.ChevronLeft className="h-6 w-6" />
            <span className="font-medium">Back</span>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sign Up
          </h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 pb-8">
        <div className="w-full max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <LucideIcons.Zap className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Axon
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-green-100 rounded-full">
              <LucideIcons.UserPlus className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-semibold">Create Account</span>
            </div>
            <p className="text-slate-600 text-lg">Join our platform today</p>
          </div>

          <Card className="p-6 sm:p-8 bg-white/70 backdrop-blur-sm shadow-2xl border border-white/20 rounded-3xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Username</Label>
                <div className="relative">
                  <LucideIcons.User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`pl-12 h-12 bg-white/80 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 ${
                      errors.username ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Phone Number</Label>
                <div className="relative">
                  <LucideIcons.Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pl-12 h-12 bg-white/80 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 ${
                      errors.phone ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Transaction Password</Label>
                <div className="relative">
                  <LucideIcons.CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    name="transactionPassword"
                    type={showPasswords.transaction ? "text" : "password"}
                    placeholder="Create transaction password"
                    value={formData.transactionPassword}
                    onChange={handleInputChange}
                    className={`pl-12 pr-12 h-12 bg-white/80 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 ${
                      errors.transactionPassword ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("transaction")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.transaction ? (
                      <LucideIcons.EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <LucideIcons.Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.transactionPassword && <p className="text-red-500 text-sm">{errors.transactionPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Login Password</Label>
                <div className="relative">
                  <LucideIcons.Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    name="loginPassword"
                    type={showPasswords.login ? "text" : "password"}
                    placeholder="Create login password"
                    value={formData.loginPassword}
                    onChange={handleInputChange}
                    className={`pl-12 pr-12 h-12 bg-white/80 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 ${
                      errors.loginPassword ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("login")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.login ? (
                      <LucideIcons.EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <LucideIcons.Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.loginPassword && <p className="text-red-500 text-sm">{errors.loginPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Confirm Login Password</Label>
                <div className="relative">
                  <LucideIcons.Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    name="confirmLoginPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm your login password"
                    value={formData.confirmLoginPassword}
                    onChange={handleInputChange}
                    className={`pl-12 pr-12 h-12 bg-white/80 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 ${
                      errors.confirmLoginPassword ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPasswords.confirm ? (
                      <LucideIcons.EyeOff className="h-5 w-5 text-slate-400" />
                    ) : (
                      <LucideIcons.Eye className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmLoginPassword && <p className="text-red-500 text-sm">{errors.confirmLoginPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                  <SelectTrigger className={`h-12 bg-white border-2 rounded-xl ${errors.gender ? "border-red-500" : "border-slate-200"}`}>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">Invite Code *</Label>
                <div className="relative">
                  <LucideIcons.Gift className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    name="inviteCode"
                    type="text"
                    placeholder="Enter invite code if you have one"
                    value={formData.inviteCode}
                    onChange={handleInputChange}
                    className="pl-12 h-12 bg-white/80 border-2 border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <Checkbox
                  checked={formData.agreeToTerms}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-1"
                />
                <Label className="text-sm text-slate-700 cursor-pointer">
                  I agree to the Terms and Conditions and Privacy Policy
                </Label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}

              {serverError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <LucideIcons.AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{serverError}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LucideIcons.UserPlus className="h-5 w-5" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>
          </Card>

          <div className="text-center">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
