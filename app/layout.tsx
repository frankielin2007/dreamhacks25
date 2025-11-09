// Next
import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";

// Clerk
import { ClerkProvider } from "@clerk/nextjs";

// Components
import OnboardingGuard from "@/components/OnboardingGuard";
import { ThemeProvider } from "@/context/ThemeProvider";

// FluxCare brand fonts
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

export const metadata: Metadata = {
  title: "FluxCare — Primary care, fewer clicks",
  description:
    "AI-powered primary care that adapts to you. Get intelligent diagnostics, personalized risk assessments, and seamless appointment scheduling—all in one place.",
  openGraph: {
    title: "FluxCare — Primary care, fewer clicks",
    description:
      "AI-powered primary care that adapts to you. Get intelligent diagnostics, personalized risk assessments, and seamless appointment scheduling.",
    type: "website",
  },
  themeColor: "#4F46E5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
        <body className="font-body antialiased">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <OnboardingGuard>{children}</OnboardingGuard>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
