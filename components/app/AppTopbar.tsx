"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@clerk/nextjs";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

// Map routes to page titles
const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/diagnostics": "Diagnostics",
  "/tests": "Tests",
  "/appointments": "Appointments",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/onboarding": "Welcome to FluxCare",
  "/doctor": "Doctor Dashboard",
};

export default function AppTopbar() {
  const pathname = usePathname();
  
  // Get page title from route or use a default
  const getPageTitle = () => {
    if (!pathname) return "FluxCare";
    
    // Check exact matches first
    if (routeTitles[pathname]) {
      return routeTitles[pathname];
    }
    
    // Check if it's a diagnostic detail page
    if (pathname.startsWith("/diagnostics/")) {
      return "Diagnostic Details";
    }
    
    // Default to Dashboard
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Page Title */}
        <div>
          <h1 className="text-xl font-display font-semibold">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right Section: Search, New Diagnostic, User Menu */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients, tests..."
              className="w-64 pl-9 h-9 bg-background/50"
            />
          </div>

          {/* New Diagnostic Button */}
          <Button
            asChild
            size="sm"
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            <Link href="/diagnostics/new">
              <Plus className="h-4 w-4 mr-2" />
              New diagnostic
            </Link>
          </Button>

          {/* User Menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
