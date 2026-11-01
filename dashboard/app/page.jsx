"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as LucideIcons from "lucide-react";
import { DashboardProvider } from "./AllContext/DashboardContext";
import DashboardPage from "./dashboard/page";

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardPage />
    </DashboardProvider>
  );
}
