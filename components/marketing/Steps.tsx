"use client";

import { motion } from "framer-motion";
import { UserPlus, ClipboardList, Brain, Calendar } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Patient Check-In",
    description: "Quick onboarding with essential medical history and vitals. Takes under 60 seconds.",
  },
  {
    icon: ClipboardList,
    title: "Smart Assessment",
    description: "AI analyzes patient data against validated clinical models like Framingham risk scores.",
  },
  {
    icon: Brain,
    title: "Risk Prediction",
    description: "Instant results for diabetes and cardiovascular disease risk with personalized insights.",
  },
  {
    icon: Calendar,
    title: "Seamless Scheduling",
    description: "Book follow-ups automatically for high-risk patients. Email confirmations sent instantly.",
  },
];

export default function Steps() {
  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            How FluxCare works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From patient intake to risk assessment in minutes, not hours.
          </p>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={index < steps.length - 1 ? "mb-8" : ""}
            >
              <div className="flex gap-6 relative">
                {/* Timeline line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-14 w-px h-20 bg-gradient-to-b from-brand-300 to-brand-100" />
                )}
                
                {/* Icon */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-soft">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display font-semibold text-xl">
                      {step.title}
                    </h3>
                    <span className="text-sm font-medium text-brand-600 bg-brand-50 dark:bg-brand-950/30 dark:text-brand-400 px-2 py-1 rounded">
                      Step {index + 1}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
