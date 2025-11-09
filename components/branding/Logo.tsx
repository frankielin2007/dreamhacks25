/**
 * FluxCare Logo Component
 * Minimal text logotype with gradient fill
 */
"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showGradient?: boolean;
}

const sizeClasses = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

export default function Logo({ 
  className, 
  size = "md",
  showGradient = true 
}: LogoProps) {
  return (
    <div
      className={cn(
        "font-display font-black tracking-tight",
        sizeClasses[size],
        showGradient ? "text-gradient" : "text-foreground",
        className
      )}
    >
      FluxCare
    </div>
  );
}

/**
 * Logo with custom text component
 */
export function LogoWithText({ 
  text, 
  className,
  size = "md"
}: { 
  text: string; 
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Logo size={size} />
      <span className={cn(
        "font-body text-muted-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
        size === "xl" && "text-lg"
      )}>
        {text}
      </span>
    </div>
  );
}
