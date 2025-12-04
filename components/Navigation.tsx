"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, BarChart3, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-rimini-blue" />
            <span className="font-bold text-xl">CVE Explorer</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "secondary" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>CVE Search</span>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
