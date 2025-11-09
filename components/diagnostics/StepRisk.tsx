"use client";

import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";
import HighRiskCareScheduling from "./HighRiskCareScheduling";
import LowRiskReassurance from "./LowRiskReassurance";

interface TestRecord {
  id: string;
  diagnostic_id: string;
  test_name: string;
  status: string;
  result_file: string;
  test_id: string;
}

interface RiskResult {
  probability: number;
  label: string;
  riskCategory?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface StepRiskProps {
  tests: TestRecord[];
  diagnosticId: string;
  riskResults: {
    diabetes?: RiskResult;
    heart?: RiskResult;
  };
  appointments: Appointment[];
  onRefreshAppointments: () => void;
}

// High risk threshold: 20%
const HIGH_RISK_THRESHOLD = 0.20;

export default function StepRisk({ 
  tests, 
  diagnosticId, 
  riskResults, 
  appointments,
  onRefreshAppointments 
}: StepRiskProps) {
  // Check if we have risk results calculated
  const hasRiskResults = riskResults.diabetes || riskResults.heart;
  
  if (!hasRiskResults) {
    return (
      <Card className="p-12 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
              Risk Assessment Pending
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              Please complete the test results step to calculate your risk scores. 
              Once calculated, your personalized care plan will appear here.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Calculate maximum risk from all results
  const risks = [];
  if (riskResults.diabetes) risks.push(riskResults.diabetes.probability);
  if (riskResults.heart) risks.push(riskResults.heart.probability);
  const maxRisk = Math.max(...risks);

  console.log("StepRisk - Max Risk:", maxRisk, "Threshold:", HIGH_RISK_THRESHOLD);

  // Route to appropriate component based on risk level
  if (maxRisk >= HIGH_RISK_THRESHOLD) {
    return (
      <HighRiskCareScheduling
        diagnosticId={diagnosticId}
        riskResults={riskResults}
        maxRisk={maxRisk}
        existingAppointments={appointments}
        onRefreshAppointments={onRefreshAppointments}
      />
    );
  } else {
    return (
      <LowRiskReassurance
        riskResults={riskResults}
        maxRisk={maxRisk}
      />
    );
  }
}
