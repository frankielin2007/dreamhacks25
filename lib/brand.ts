/**
 * FluxCare Brand Tokens
 * Centralized export of brand colors and utilities
 */

export const brandColors = {
  50: "#EEF2FF",
  100: "#E0E7FF",
  200: "#C7D2FE",
  300: "#A5B4FC",
  400: "#818CF8",
  500: "#6366F1",
  600: "#4F46E5",
  700: "#4338CA",
  800: "#3730A3",
  900: "#312E81",
} as const;

export const accentColors = {
  500: "#22D3EE",
  600: "#06B6D4",
} as const;

export const brandGradients = {
  aurora: "radial-gradient(80% 60% at 20% 10%, rgba(124, 58, 237, 0.35), transparent), radial-gradient(60% 60% at 80% 0%, rgba(34, 211, 238, 0.25), transparent), linear-gradient(180deg, rgba(2, 6, 23, 0.04), transparent)",
  text: "linear-gradient(90deg, #7C3AED, #4F46E5, #06B6D4)",
  primary: "linear-gradient(135deg, #6366F1, #4F46E5)",
  accent: "linear-gradient(135deg, #22D3EE, #06B6D4)",
} as const;

export const brandShadows = {
  soft: "0 10px 30px rgba(2, 6, 23, 0.08)",
  glow: "0 0 20px rgba(99, 102, 241, 0.3)",
  glowAccent: "0 0 20px rgba(34, 211, 238, 0.3)",
} as const;

export const brandFonts = {
  display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
  body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
} as const;

/**
 * Utility function to get CSS variable value
 */
export function getCssVar(varName: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

/**
 * Brand theme configuration for programmatic use
 */
export const brandTheme = {
  colors: brandColors,
  accent: accentColors,
  gradients: brandGradients,
  shadows: brandShadows,
  fonts: brandFonts,
} as const;

export type BrandColor = keyof typeof brandColors;
export type AccentColor = keyof typeof accentColors;
export type BrandGradient = keyof typeof brandGradients;
export type BrandShadow = keyof typeof brandShadows;
