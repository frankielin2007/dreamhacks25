"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskPanelProps {
  label: string;
  probability: number; // 0-1 range
  drivers?: string[];
  onBookAppointment?: () => void;
  onDownloadFHIR?: () => void;
  className?: string;
}

// Mock reliability data for sparkline
const reliabilityBins = [0.72, 0.85, 0.91, 0.88, 0.93, 0.89, 0.95, 0.92];

export default function RiskPanel({
  label,
  probability,
  drivers = [],
  onBookAppointment,
  onDownloadFHIR,
  className,
}: RiskPanelProps) {
  const percentage = Math.round(probability * 100);
  const isHighRisk = probability > 0.2;
  
  // Determine risk level for styling
  const riskLevel = probability > 0.2 ? "high" : probability > 0.1 ? "moderate" : "low";
  
  const barColors = {
    high: "from-red-500 to-red-600",
    moderate: "from-amber-500 to-amber-600",
    low: "from-green-500 to-green-600",
  };

  const bgColors = {
    high: "from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30",
    moderate: "from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30",
    low: "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30",
  };

  return (
    <Card className={cn("glass border-border/50 overflow-hidden", className)}>
      {/* Header with gradient background */}
      <div className={cn(
        "bg-gradient-to-br p-6",
        bgColors[riskLevel]
      )}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {label}
          </p>
          <h2 className="text-5xl font-display font-black text-gradient">
            {percentage}%
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Risk probability
          </p>
        </motion.div>

        {/* Animated probability bar */}
        <motion.div
          className="mt-6 h-3 bg-background/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className={cn(
              "h-full bg-gradient-to-r rounded-full",
              barColors[riskLevel]
            )}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          />
        </motion.div>
      </div>

      {/* Content section */}
      <div className="p-6 space-y-6">
        {/* Top drivers */}
        {drivers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h3 className="font-display font-semibold text-sm">
                Top Risk Drivers
              </h3>
            </div>
            <ul className="space-y-2">
              {drivers.slice(0, 3).map((driver, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-medium mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    {driver}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Reliability sparkline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="border-t border-border/40 pt-4"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Model Reliability
            </p>
            <p className="text-xs font-bold text-brand-600 dark:text-brand-400">
              {Math.round(reliabilityBins.reduce((a, b) => a + b, 0) / reliabilityBins.length * 100)}%
            </p>
          </div>
          <div className="flex items-end gap-1 h-8">
            {reliabilityBins.map((value, index) => (
              <motion.div
                key={index}
                className="flex-1 bg-brand-500/70 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${value * 100}%` }}
                transition={{ delay: 0.9 + index * 0.05, duration: 0.3 }}
              />
            ))}
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          {isHighRisk && onBookAppointment && (
            <Button
              onClick={onBookAppointment}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          )}
          {onDownloadFHIR && (
            <Button
              onClick={onDownloadFHIR}
              variant="ghost"
              className={cn(
                "flex-1 border border-border/50",
                !isHighRisk && "flex-1"
              )}
            >
              <Download className="h-4 w-4 mr-2" />
              Download FHIR
            </Button>
          )}
        </motion.div>

        {/* High risk warning */}
        {isHighRisk && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
          >
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> This result indicates elevated risk. We recommend scheduling a follow-up appointment with a healthcare provider.
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
