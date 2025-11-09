"use client";

import Link from "next/link";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Logo from "@/components/branding/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Product", href: "#product" },
  { label: "For Clinics", href: "#clinics" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

export default function SiteHeader() {
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (isSignedIn) {
      window.location.href = "/start";
    } else {
      window.location.href = "/sign-in?redirect_url=/start";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" showGradient />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {!isSignedIn && (
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden sm:inline-flex">
                Sign in
              </Button>
            </SignInButton>
          )}
          <Button 
            onClick={handleGetStarted}
            className="bg-brand-600 hover:bg-brand-700 text-white"
          >
            {isSignedIn ? "Dashboard" : "Get Started"}
          </Button>
        </div>
      </div>
    </header>
  );
}
