import type { FraminghamCvdInput } from "./schema";

// ============================================
// Framingham General CVD 10-Year Risk (2008)
// Lipid-based primary model
// ============================================

interface CvdResult {
  probability: number; // 0..1
  label: string; // low, borderline, intermediate, high
  details: {
    contributions: Array<{
      name: string;
      value: number;
      beta: number;
      term: number;
    }>;
    S0: number;
    MEAN: number;
    score: number;
    riskPercentage: number;
  };
}

// Sex-specific coefficients
const COEFFICIENTS = {
  female: {
    S0: 0.95012,
    MEAN: 26.1931,
    beta: {
      lnAge: 2.32888,
      lnTC: 1.20904,
      lnHDL: -0.70833,
      lnSBPUntreated: 2.76157,
      lnSBPTreated: 2.82263,
      smoker: 0.52873,
      diabetes: 0.69154,
    },
  },
  male: {
    S0: 0.88936,
    MEAN: 23.9802,
    beta: {
      lnAge: 3.06117,
      lnTC: 1.12370,
      lnHDL: -0.93263,
      lnSBPUntreated: 1.93303,
      lnSBPTreated: 1.99881,
      smoker: 0.65451,
      diabetes: 0.57367,
    },
  },
};

export function computeFraminghamCvd(input: FraminghamCvdInput): CvdResult {
  // Validate and clamp values to prevent invalid logarithms
  const age = Math.max(30, Math.min(74, input.age));
  const totalChol = Math.max(100, Math.min(405, input.totalChol));
  const hdl = Math.max(20, Math.min(100, input.hdl));
  const sbp = Math.max(90, Math.min(200, input.sbp));

  // Get sex-specific coefficients
  const coef = COEFFICIENTS[input.sex];

  // Calculate natural logarithms
  const lnAge = Math.log(age);
  const lnTC = Math.log(totalChol);
  const lnHDL = Math.log(hdl);
  const lnSBP = Math.log(sbp);

  // Build contributions array for transparency
  const contributions: CvdResult["details"]["contributions"] = [];

  // Calculate score: Σ β_i * X_i
  let score = 0;

  // ln(age)
  const ageContribution = coef.beta.lnAge * lnAge;
  score += ageContribution;
  contributions.push({
    name: "ln(Age)",
    value: lnAge,
    beta: coef.beta.lnAge,
    term: ageContribution,
  });

  // ln(Total Cholesterol)
  const tcContribution = coef.beta.lnTC * lnTC;
  score += tcContribution;
  contributions.push({
    name: "ln(Total Cholesterol)",
    value: lnTC,
    beta: coef.beta.lnTC,
    term: tcContribution,
  });

  // ln(HDL)
  const hdlContribution = coef.beta.lnHDL * lnHDL;
  score += hdlContribution;
  contributions.push({
    name: "ln(HDL)",
    value: lnHDL,
    beta: coef.beta.lnHDL,
    term: hdlContribution,
  });

  // ln(SBP) - use treated or untreated coefficient
  const sbpBeta = input.treated
    ? coef.beta.lnSBPTreated
    : coef.beta.lnSBPUntreated;
  const sbpContribution = sbpBeta * lnSBP;
  score += sbpContribution;
  contributions.push({
    name: input.treated ? "ln(SBP Treated)" : "ln(SBP Untreated)",
    value: lnSBP,
    beta: sbpBeta,
    term: sbpContribution,
  });

  // Smoker (binary)
  if (input.smoker) {
    const smokerContribution = coef.beta.smoker * 1;
    score += smokerContribution;
    contributions.push({
      name: "Current Smoker",
      value: 1,
      beta: coef.beta.smoker,
      term: smokerContribution,
    });
  }

  // Diabetes (binary)
  if (input.diabetes) {
    const diabetesContribution = coef.beta.diabetes * 1;
    score += diabetesContribution;
    contributions.push({
      name: "Diabetes",
      value: 1,
      beta: coef.beta.diabetes,
      term: diabetesContribution,
    });
  }

  // Calculate 10-year risk
  // risk = 1 - S0(10) ^ exp(score - MEAN)
  const exponent = Math.exp(score - coef.MEAN);
  const risk = 1 - Math.pow(coef.S0, exponent);

  // Clamp risk to valid range [0, 1]
  const probability = Math.max(0, Math.min(1, risk));
  const riskPercentage = probability * 100;

  // Determine label based on risk buckets
  let label: string;
  if (riskPercentage < 5) {
    label = "low";
  } else if (riskPercentage < 7.5) {
    label = "borderline";
  } else if (riskPercentage < 20) {
    label = "intermediate";
  } else {
    label = "high";
  }

  return {
    probability,
    label,
    details: {
      contributions,
      S0: coef.S0,
      MEAN: coef.MEAN,
      score,
      riskPercentage,
    },
  };
}
