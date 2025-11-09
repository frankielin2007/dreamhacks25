/**
 * FluxCare Brand Showcase Component
 * Demonstrates the brand tokens and gradient utilities
 * This is for development/testing purposes
 */
"use client";

export default function BrandShowcase() {
  return (
    <div className="p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-display font-bold text-gradient">
          FluxCare Brand System
        </h1>
        <p className="text-lg text-muted-foreground font-body">
          Brand tokens and gradient utilities showcase
        </p>
      </div>

      {/* Brand Color Palette */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Brand Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#EEF2FF] border"></div>
            <p className="text-xs">brand-50</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#E0E7FF] border"></div>
            <p className="text-xs">brand-100</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#C7D2FE] border"></div>
            <p className="text-xs">brand-200</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#A5B4FC] border"></div>
            <p className="text-xs">brand-300</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#818CF8] border"></div>
            <p className="text-xs">brand-400</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#6366F1] border"></div>
            <p className="text-xs text-white">brand-500</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#4F46E5] border"></div>
            <p className="text-xs text-white">brand-600</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#4338CA] border"></div>
            <p className="text-xs text-white">brand-700</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#3730A3] border"></div>
            <p className="text-xs text-white">brand-800</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#312E81] border"></div>
            <p className="text-xs text-white">brand-900</p>
          </div>
        </div>
      </section>

      {/* Accent Colors */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Accent Colors</h2>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#22D3EE] border"></div>
            <p className="text-xs">accent-500</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-lg bg-[#06B6D4] border"></div>
            <p className="text-xs text-white">accent-600</p>
          </div>
        </div>
      </section>

      {/* Gradient Utilities */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Gradient Utilities</h2>
        
        {/* Aurora Background */}
        <div className="bg-aurora rounded-xl p-8 border">
          <h3 className="text-xl font-display font-semibold mb-2">Aurora Background</h3>
          <p className="text-muted-foreground">
            Use <code className="px-2 py-1 bg-black/5 rounded">bg-aurora</code> for ethereal gradient backgrounds
          </p>
        </div>

        {/* Text Gradient */}
        <div className="p-8 border rounded-xl">
          <h3 className="text-5xl font-display font-bold text-gradient mb-4">
            Text Gradient
          </h3>
          <p className="text-muted-foreground">
            Use <code className="px-2 py-1 bg-black/5 rounded">text-gradient</code> for gradient text effects
          </p>
        </div>

        {/* Glass Effect */}
        <div className="bg-aurora rounded-xl p-1">
          <div className="glass rounded-lg p-8">
            <h3 className="text-xl font-display font-semibold mb-2">Glass Morphism</h3>
            <p className="text-muted-foreground">
              Use <code className="px-2 py-1 bg-black/5 rounded">glass</code> for frosted glass effects
            </p>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Typography</h2>
        <div className="space-y-4 p-6 border rounded-xl">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Display Font (Sora)</p>
            <h1 className="text-4xl font-display font-bold">The quick brown fox</h1>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Body Font (Inter)</p>
            <p className="text-lg font-body">
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>
        </div>
      </section>

      {/* Shadow Soft */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display font-semibold">Soft Shadow</h2>
        <div className="p-8 bg-white rounded-xl" style={{ boxShadow: 'var(--shadow-soft)' }}>
          <p className="text-muted-foreground">
            Custom soft shadow: <code className="px-2 py-1 bg-black/5 rounded">shadow-soft</code>
          </p>
        </div>
      </section>
    </div>
  );
}
