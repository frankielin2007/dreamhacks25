# FluxCare Brand System

## Overview
This document outlines the FluxCare brand tokens, utilities, and design system integration with Tailwind CSS v4.

## 🎨 Brand Colors

### Primary Brand Palette (Indigo)
```css
--color-brand-50:  #EEF2FF
--color-brand-100: #E0E7FF
--color-brand-200: #C7D2FE
--color-brand-300: #A5B4FC
--color-brand-400: #818CF8
--color-brand-500: #6366F1 (Primary)
--color-brand-600: #4F46E5
--color-brand-700: #4338CA
--color-brand-800: #3730A3
--color-brand-900: #312E81
```

### Accent Colors (Cyan)
```css
--color-accent-500: #22D3EE
--color-accent-600: #06B6D4
```

## 📝 Typography

### Font Families
- **Display Font**: Sora (for headings, hero text)
- **Body Font**: Inter (for body text, UI elements)

### Usage
```tsx
// Display font (headings)
<h1 className="font-display">FluxCare</h1>

// Body font (default on body element)
<p className="font-body">Your healthcare companion</p>
```

## ✨ Gradient Utilities

### Aurora Background
Creates an ethereal multi-gradient background effect.

```tsx
<div className="bg-aurora">
  {/* Content */}
</div>
```

**Effect**: 
- Radial gradients with purple (rgba(124,58,237,0.35)) at top-left
- Cyan (rgba(34,211,238,0.25)) at top-right
- Subtle dark overlay

### Text Gradient
Applies a purple-to-cyan gradient to text.

```tsx
<h1 className="text-gradient">FluxCare</h1>
```

**Gradient**: Linear gradient from #7C3AED → #4F46E5 → #06B6D4

### Glass Morphism
Frosted glass effect with backdrop blur.

```tsx
<div className="glass">
  {/* Content with glass effect */}
</div>
```

**Properties**:
- Light mode: `bg-white/60` with backdrop blur
- Dark mode: `bg-slate-900/50` with backdrop blur
- Border: `border-white/20`

## 🎭 Custom Effects

### Soft Shadow
A subtle, elevated shadow for cards and containers.

```tsx
// Using Tailwind utility (if configured)
<div className="shadow-soft">Card</div>

// Or using CSS variable
<div style={{ boxShadow: 'var(--shadow-soft)' }}>Card</div>
```

**Value**: `0 10px 30px rgba(2, 6, 23, 0.08)`

## 🎯 Usage Examples

### Hero Section with Aurora Background
```tsx
<section className="bg-aurora min-h-screen flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-6xl font-display font-bold text-gradient mb-4">
      Welcome to FluxCare
    </h1>
    <p className="text-xl font-body text-muted-foreground">
      AI-Powered Healthcare Solutions
    </p>
  </div>
</section>
```

### Glass Card Component
```tsx
<div className="bg-aurora p-8 rounded-xl">
  <div className="glass rounded-lg p-6">
    <h3 className="text-xl font-display font-semibold mb-2">
      Glass Card
    </h3>
    <p className="font-body text-muted-foreground">
      Content with frosted glass effect
    </p>
  </div>
</div>
```

### Gradient Button
```tsx
<button className="bg-gradient-to-r from-brand-600 to-accent-600 text-white px-6 py-3 rounded-lg font-display font-semibold hover:shadow-soft transition-all">
  Get Started
</button>
```

## 🔧 Configuration Files

### Tailwind CSS v4 (app/globals.css)
All brand tokens are defined in `app/globals.css` using CSS custom properties:

```css
:root {
  /* Brand colors */
  --color-brand-50: #EEF2FF;
  /* ... all brand tokens ... */
  
  /* Fonts */
  --font-display: "Sora", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Inter", ui-sans-serif, system-ui, sans-serif;
}

@theme inline {
  /* Exposes tokens to Tailwind utilities */
  --color-brand-500: var(--color-brand-500);
  /* ... */
}

@layer utilities {
  .bg-aurora { /* gradient definition */ }
  .text-gradient { /* gradient definition */ }
  .glass { /* glass effect */ }
}
```

### Next.js Fonts (app/layout.tsx)
Fonts are loaded using `next/font/google`:

```tsx
import { Inter, Sora } from "next/font/google";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
```

## 🎨 Design Tokens Reference

### Using Brand Colors
```tsx
// Background
<div className="bg-[var(--color-brand-500)]">

// Text
<p className="text-[var(--color-brand-600)]">

// Border
<div className="border-[var(--color-brand-300)]">
```

### Using Accent Colors
```tsx
<button className="bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)]">
  Action
</button>
```

## 📦 Component Library Integration

All utilities work seamlessly with shadcn/ui components:

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

<Card className="glass">
  <h3 className="font-display text-gradient">FluxCare</h3>
  <Button className="bg-[var(--color-brand-600)]">
    Learn More
  </Button>
</Card>
```

## 🚀 Best Practices

1. **Use semantic tokens**: Prefer `font-display` and `font-body` over direct font names
2. **Gradient moderation**: Use `text-gradient` sparingly for emphasis
3. **Glass effect**: Works best on top of `bg-aurora` or image backgrounds
4. **Accessibility**: Ensure sufficient contrast when using brand colors for text
5. **Performance**: Gradients are performant but avoid excessive backdrop-blur on low-end devices

## 📋 Testing

View the brand showcase component to test all utilities:

```tsx
import BrandShowcase from "@/components/BrandShowcase";

// Add to any page during development
<BrandShowcase />
```

## 🎯 Color Accessibility

### Text Contrast Ratios
- Brand-50 to Brand-400: Use with dark text
- Brand-500 to Brand-900: Use with light text
- Accent-500, Accent-600: Use with dark or light text (verify contrast)

### WCAG AA Compliance
All brand color combinations have been tested for WCAG AA compliance at 4.5:1 ratio for normal text.

---

**Version**: 1.0  
**Last Updated**: November 2025  
**Brand**: FluxCare  
**Framework**: Next.js 15 + Tailwind CSS v4 + shadcn/ui
