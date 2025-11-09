"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function Testimonial() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="glass p-8 md:p-12 border-border/50 shadow-soft relative overflow-hidden">
            {/* Background gradient accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-500/5 to-accent-500/5 rounded-full blur-3xl" />
            
            <div className="relative">
              {/* Quote icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 mb-6">
                <Quote className="h-7 w-7 text-white" />
              </div>
              
              {/* Quote text */}
              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8 text-foreground">
                &ldquo;FluxCare has transformed our clinic workflow. What used to take
                15-20 minutes of manual assessment now happens in under 2 minutes.
                Our patients love the experience, and our team is finally able to
                focus on care instead of paperwork.&rdquo;
              </blockquote>
              
              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold text-xl">
                  MC
                </div>
                <div>
                  <div className="font-display font-semibold text-lg">
                    Dr. Maria Chen
                  </div>
                  <div className="text-muted-foreground">
                    Medical Director, Wellness Primary Care
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
