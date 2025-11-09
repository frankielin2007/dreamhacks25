"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

export type StepId = "chat" | "tests" | "results" | "risk" | "book";

interface Step {
  id: StepId;
  label: string;
  description: string;
}

const steps: Step[] = [
  { id: "chat", label: "Discussion", description: "Review symptoms" },
  { id: "tests", label: "Tests", description: "Run diagnostics" },
  { id: "results", label: "Results", description: "View findings" },
  { id: "risk", label: "Risk", description: "Assess risk level" },
  { id: "book", label: "Book", description: "Schedule visit" },
];

interface StepperProps {
  currentStep: StepId;
  completedSteps: StepId[];
}

export default function Stepper({ currentStep, completedSteps }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Mobile View - Compact */}
      <div className="block sm:hidden">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-lg">
          <div className="text-center mb-3">
            <div className="text-sm font-medium text-slate-900 dark:text-white">
              Step {currentIndex + 1} of {steps.length}
            </div>
            <div className="text-lg font-display font-bold text-slate-900 dark:text-white mt-1">
              {steps[currentIndex].label}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {steps[currentIndex].description}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Desktop View - Full Stepper */}
      <div className="hidden sm:block">
        <div className="backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                      }}
                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        isCompleted
                          ? "bg-gradient-to-r from-brand-500 to-cyan-500 border-transparent shadow-lg"
                          : isCurrent
                            ? "bg-white dark:bg-slate-900 border-brand-500 shadow-lg ring-4 ring-brand-100 dark:ring-brand-900"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      ) : (
                        <span
                          className={`text-sm font-bold ${
                            isCurrent
                              ? "text-brand-600 dark:text-brand-400"
                              : "text-slate-500 dark:text-slate-500"
                          }`}
                        >
                          {index + 1}
                        </span>
                      )}
                    </motion.div>

                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <div
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-brand-600 dark:text-brand-400"
                            : isCompleted
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-500"
                        }`}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-4 relative -mt-12">
                      <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-brand-500 to-cyan-500"
                        initial={{ scaleX: 0 }}
                        animate={{
                          scaleX: isCompleted ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        style={{ transformOrigin: "left" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export { steps };
