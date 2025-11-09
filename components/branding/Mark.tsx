/**
 * FluxCare Mark Component
 * 24x24 wave/ribbon icon mark using brand colors
 */
"use client";

import { cn } from "@/lib/utils";

interface MarkProps {
  className?: string;
  size?: number;
  variant?: "gradient" | "solid" | "outline";
}

export default function Mark({ 
  className, 
  size = 24,
  variant = "gradient" 
}: MarkProps) {
  const gradientId = `flux-gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      
      {/* Wave/Ribbon Mark */}
      {variant === "gradient" && (
        <>
          <path
            d="M3 8.5C3 8.5 5.5 5 9 5C12.5 5 13.5 8.5 17 8.5C20.5 8.5 21 5 21 5"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 15.5C3 15.5 5.5 12 9 12C12.5 12 13.5 15.5 17 15.5C20.5 15.5 21 12 21 12"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="2"
            fill={`url(#${gradientId})`}
          />
        </>
      )}
      
      {variant === "solid" && (
        <>
          <path
            d="M3 8.5C3 8.5 5.5 5 9 5C12.5 5 13.5 8.5 17 8.5C20.5 8.5 21 5 21 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 15.5C3 15.5 5.5 12 9 12C12.5 12 13.5 15.5 17 15.5C20.5 15.5 21 12 21 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="2"
            fill="currentColor"
          />
        </>
      )}
      
      {variant === "outline" && (
        <>
          <path
            d="M3 8.5C3 8.5 5.5 5 9 5C12.5 5 13.5 8.5 17 8.5C20.5 8.5 21 5 21 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M3 15.5C3 15.5 5.5 12 9 12C12.5 12 13.5 15.5 17 15.5C20.5 15.5 21 12 21 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle
            cx="12"
            cy="12"
            r="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

/**
 * Mark with Logo combination
 */
export function MarkWithLogo({ 
  className,
  size = "md"
}: { 
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const markSize = size === "sm" ? 20 : size === "md" ? 24 : 32;
  const textSize = size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl";
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Mark size={markSize} />
      <span className={cn(
        "font-display font-black tracking-tight text-gradient",
        textSize
      )}>
        FluxCare
      </span>
    </div>
  );
}
