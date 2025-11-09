"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Stethoscope,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  UserCog,
} from "lucide-react";
import Logo from "@/components/branding/Logo";

const doctorNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Doctor",
    href: "/doctor",
    icon: UserCog,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const patientNavItems = [
  {
    label: "Diagnostics",
    href: "/diagnostics",
    icon: Stethoscope,
  },
  {
    label: "Tests",
    href: "/tests",
    icon: FileText,
  },
  {
    label: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  // Determine user role from Clerk publicMetadata
  const userRole = (user?.publicMetadata?.role as string) || "patient";
  const navItems = userRole === "doctor" ? doctorNavItems : patientNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border/40 glass">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border/40">
          <Logo size="sm" showGradient />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  "hover:bg-brand-50 dark:hover:bg-brand-950/30",
                  isActive
                    ? "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500/20"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/40">
          <div className="text-xs text-muted-foreground">
            FluxCare v1.0.0
          </div>
        </div>
      </div>
    </aside>
  );
}
