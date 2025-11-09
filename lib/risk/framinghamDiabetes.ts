import type { FraminghamDiabetesInput } from "./schema";

// ============================================
// Framingham Offspring Diabetes 8-Year Risk
// Logistic regression model (2007)
// ============================================

interface DiabetesResult {
  probability: number; // 0..1
  label: string; // low, intermediate, high
  details: {
    firedIndicators: Array<{
      name: string;
      beta: number;
      description: string;
    }>;
    intercept: number;
    z: number;
    riskPercentage: number;
  };
}

// Model intercept and coefficients
const INTERCEPT = -5.517;

const INDICATORS = {
  age50to64: { beta: -0.018, check: (age: number) => age >= 50 && age < 65 },
  age65plus: { beta: -0.081, check: (age: number) => age >= 65 },
  male: { beta: -0.010, check: (sex: string) => sex === "male" },
  parentalHistory: {
    beta: 0.565,
    check: (parentalHistory: boolean) => parentalHistory,
  },
  bmi25to29: { beta: 0.301, check: (bmi: number) => bmi >= 25 && bmi < 30 },
  bmi30plus: { beta: 0.920, check: (bmi: number) => bmi >= 30 },
  bpHighOrTherapy: {
    beta: 0.498,
    check: (sbp: number, onBpTherapy: boolean) => sbp > 130 || onBpTherapy,
  },
  lowHDL: {
    beta: 0.944,
    check: (sex: string, hdl: number) =>
      (sex === "male" && hdl < 40) || (sex === "female" && hdl < 50),
  },
  tg150plus: { beta: 0.575, check: (tg: number) => tg >= 150 },
  fg100to126: {
    beta: 1.980,
    check: (fastingGlucose: number) =>
      fastingGlucose >= 100 && fastingGlucose <= 126,
  },
};

export function computeFraminghamDiabetes(
  input: FraminghamDiabetesInput
): DiabetesResult {
  // Validate and clamp values
  const age = Math.max(20, Math.min(79, input.age));
  const bmi = Math.max(15, Math.min(60, input.bmi));
  const sbp = Math.max(90, Math.min(200, input.sbp));
  const hdl = Math.max(20, Math.min(100, input.hdl));
  const tg = Math.max(30, Math.min(1000, input.tg));
  const fastingGlucose = Math.max(60, Math.min(200, input.fastingGlucose));

  // Initialize z with intercept
  let z = INTERCEPT;
  const firedIndicators: DiabetesResult["details"]["firedIndicators"] = [];

  // Age 50-64
  if (INDICATORS.age50to64.check(age)) {
    z += INDICATORS.age50to64.beta;
    firedIndicators.push({
      name: "Age 50-64",
      beta: INDICATORS.age50to64.beta,
      description: "Age between 50 and 64 years",
    });
  }

  // Age 65+
  if (INDICATORS.age65plus.check(age)) {
    z += INDICATORS.age65plus.beta;
    firedIndicators.push({
      name: "Age 65+",
      beta: INDICATORS.age65plus.beta,
      description: "Age 65 or older",
    });
  }

  // Male
  if (INDICATORS.male.check(input.sex)) {
    z += INDICATORS.male.beta;
    firedIndicators.push({
      name: "Male",
      beta: INDICATORS.male.beta,
      description: "Biological sex is male",
    });
  }

  // Parental history of diabetes
  if (INDICATORS.parentalHistory.check(input.parentalHistory)) {
    z += INDICATORS.parentalHistory.beta;
    firedIndicators.push({
      name: "Parental History",
      beta: INDICATORS.parentalHistory.beta,
      description: "Parent had diabetes",
    });
  }

  // BMI 25.0-29.9 (overweight)
  if (INDICATORS.bmi25to29.check(bmi)) {
    z += INDICATORS.bmi25to29.beta;
    firedIndicators.push({
      name: "BMI 25-29.9",
      beta: INDICATORS.bmi25to29.beta,
      description: "Overweight (BMI 25-29.9)",
    });
  }

  // BMI ≥30 (obese)
  if (INDICATORS.bmi30plus.check(bmi)) {
    z += INDICATORS.bmi30plus.beta;
    firedIndicators.push({
      name: "BMI ≥30",
      beta: INDICATORS.bmi30plus.beta,
      description: "Obese (BMI 30 or higher)",
    });
  }

  // High BP or on therapy
  if (INDICATORS.bpHighOrTherapy.check(sbp, input.onBpTherapy)) {
    z += INDICATORS.bpHighOrTherapy.beta;
    firedIndicators.push({
      name: "High BP or Therapy",
      beta: INDICATORS.bpHighOrTherapy.beta,
      description: "BP >130 mmHg or on BP medication",
    });
  }

  // Low HDL (sex-specific)
  if (INDICATORS.lowHDL.check(input.sex, hdl)) {
    z += INDICATORS.lowHDL.beta;
    firedIndicators.push({
      name: "Low HDL",
      beta: INDICATORS.lowHDL.beta,
      description:
        input.sex === "male"
          ? "HDL <40 mg/dL (men)"
          : "HDL <50 mg/dL (women)",
    });
  }

  // Triglycerides ≥150
  if (INDICATORS.tg150plus.check(tg)) {
    z += INDICATORS.tg150plus.beta;
    firedIndicators.push({
      name: "High Triglycerides",
      beta: INDICATORS.tg150plus.beta,
      description: "Triglycerides ≥150 mg/dL",
    });
  }

  // Fasting glucose 100-126 (prediabetic range)
  if (INDICATORS.fg100to126.check(fastingGlucose)) {
    z += INDICATORS.fg100to126.beta;
    firedIndicators.push({
      name: "Prediabetic Glucose",
      beta: INDICATORS.fg100to126.beta,
      description: "Fasting glucose 100-126 mg/dL",
    });
  }

  // Calculate probability using logistic function
  // p = 1 / (1 + exp(-z))
  const probability = 1 / (1 + Math.exp(-z));

  // Clamp to valid range [0, 1]
  const clampedProbability = Math.max(0, Math.min(1, probability));
  const riskPercentage = clampedProbability * 100;

  // Determine label based on risk buckets
  let label: string;
  if (riskPercentage < 10) {
    label = "low";
  } else if (riskPercentage < 20) {
    label = "intermediate";
  } else {
    label = "high";
  }

  return {
    probability: clampedProbability,
    label,
    details: {
      firedIndicators,
      intercept: INTERCEPT,
      z,
      riskPercentage,
    },
  };
}
