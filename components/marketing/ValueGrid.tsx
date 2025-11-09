"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Brain, Zap, Shield } from "lucide-react";

const values = [
  {
    icon: Brain,
    title: "AI-Powered Diagnostics",
    description: "Advanced machine learning models provide accurate risk assessments for diabetes and cardiovascular disease in seconds.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Complete patient assessments in under 2 minutes. Reduce administrative burden and focus on what matters—care.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security with end-to-end encryption. Your patient data is always protected and compliant.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function ValueGrid() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Built for modern healthcare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            FluxCare combines cutting-edge AI with intuitive design to streamline
            primary care workflows.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {values.map((value) => (
            <motion.div key={value.title} variants={itemVariants}>
              <Card className="p-8 h-full border-border/50 hover:border-brand-300 transition-all duration-300 hover:shadow-soft">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 mb-4">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">
                  {value.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  {value.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
