"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as LucideIcons from "lucide-react";
import { useDashboard } from "@/app/AllContext/DashboardContext";

export default function UserForm({ user, onClose }) {
  const { addUser, updateUser } = useDashboard();
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    gender: "",
    walletBalance: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        phone: user.phone,
        gender: user.gender,
        walletBalance: user.walletBalance,
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (user) {
      updateUser(user._id, formData);
    } else {
      addUser(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-slate-800/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-700">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcons.User className="h-5 w-5" />
            {user ? "Edit User" : "Add New User"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <LucideIcons.X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Username</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Enter username"
              className={`h-10 rounded-lg bg-slate-900/60 border-2 text-slate-100 placeholder:text-slate-500 ${errors.username ? "border-red-500" : "border-slate-700"}`}
            />
            {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter phone number"
              className={`h-10 rounded-lg bg-slate-900/60 border-2 text-slate-100 placeholder:text-slate-500 ${errors.phone ? "border-red-500" : "border-slate-700"}`}
            />
            {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger className={`h-10 rounded-lg bg-slate-900/60 border-2 text-slate-100 ${errors.gender ? "border-red-500" : "border-slate-700"}`}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="male" className="text-slate-100">Male</SelectItem>
                <SelectItem value="female" className="text-slate-100">Female</SelectItem>
                <SelectItem value="other" className="text-slate-100">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-red-400 text-sm">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Wallet Balance</Label>
            <Input
              type="number"
              value={formData.walletBalance}
              onChange={(e) => setFormData({ ...formData, walletBalance: Number(e.target.value) })}
              placeholder="Enter wallet balance"
              className="h-10 rounded-lg bg-slate-900/60 border-2 border-slate-700 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 text-slate-100 hover:bg-slate-600 rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold"
            >
              {user ? "Update" : "Add"} User
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
