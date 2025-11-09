"use client";

import Link from "next/link";
import Logo from "@/components/branding/Logo";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Integrations", href: "#integrations" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#changelog" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Careers", href: "#careers" },
    { label: "Press", href: "#press" },
  ],
  Resources: [
    { label: "Documentation", href: "#docs" },
    { label: "Help Center", href: "#help" },
    { label: "Community", href: "#community" },
    { label: "Contact", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Security", href: "#security" },
    { label: "HIPAA", href: "#hipaa" },
  ],
};

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 mb-12">
          <div className="col-span-2">
            <Logo size="sm" showGradient />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              AI-powered primary care that adapts to you. Intelligent diagnostics,
              personalized risk assessments, seamless scheduling.
            </p>
          </div>
          
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-display font-semibold text-sm mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} FluxCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
