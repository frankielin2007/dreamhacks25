"use client";

import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import DeviceMock from "@/components/marketing/DeviceMock";

export default function Hero() {
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    if (isSignedIn) {
      window.location.href = "/start";
    } else {
      window.location.href = "/sign-in?redirect_url=/start";
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Animated Aurora Background */}
      <motion.div
        className="absolute inset-0 bg-aurora opacity-40"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      <div className="container relative z-10 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-6">
              <span className="block text-gradient">Primary care,</span>
              <span className="block text-gradient">fewer clicks</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
              AI-powered diagnostics that adapt to your patients. Get intelligent
              risk assessments, automated care plans, and seamless scheduling—all
              in one platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-brand-600 hover:bg-brand-700 text-white text-base h-12 px-8"
              >
                Try the demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 px-8 border-brand-200 hover:bg-brand-50"
              >
                <Play className="mr-2 h-4 w-4" />
                See how it works
              </Button>
            </div>
          </motion.div>
          
          {/* Right: Device Mock */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <DeviceMock />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
