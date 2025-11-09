import type {
  FraminghamCvdInput,
  FraminghamDiabetesInput,
} from "./schema";

// ============================================
// Mapper for CVD/Heart Disease Payload
// ============================================
export function mapIncomingCvdPayload(payload: Record<string, unknown>): {
  mapped: Partial<FraminghamCvdInput>;
  isOldFormat: boolean;
  missingFields: string[];
} {
  const isOldFormat =
    "sysBP" in payload ||
    "diaBP" in payload ||
    "is_smoking" in payload ||
    "BPMeds" in payload;

  const mapped: Partial<FraminghamCvdInput> = {};
  const missingFields: string[] = [];

  if (isOldFormat) {
    // Map old format fields
    if (payload.sex) {
      mapped.sex =
        payload.sex === "M" || payload.sex === "male"
          ? "male"
          : payload.sex === "F" || payload.sex === "female"
            ? "female"
            : undefined;
    }
    if (payload.age) mapped.age = Number(payload.age);
    if (payload.totChol) mapped.totalChol = Number(payload.totChol);
    if (payload.sysBP) mapped.sbp = Number(payload.sysBP);

    // Map smoking status - handle YES/NO strings or boolean
    if (payload.is_smoking !== undefined) {
      if (typeof payload.is_smoking === "string") {
        mapped.smoker =
          payload.is_smoking.toUpperCase() === "YES" ||
          payload.is_smoking === "1";
      } else {
        mapped.smoker = Boolean(payload.is_smoking);
      }
    }

    // Map BP medication status
    if (payload.BPMeds !== undefined) {
      mapped.treated = Boolean(Number(payload.BPMeds));
    }

    // Map diabetes status
    if (payload.diabetes !== undefined) {
      mapped.diabetes = Boolean(Number(payload.diabetes));
    }

    // HDL is REQUIRED but often missing in old format
    if (payload.hdl) {
      mapped.hdl = Number(payload.hdl);
    } else {
      missingFields.push("hdl");
    }
  } else {
    // New format - pass through with validation
    if (payload.sex) mapped.sex = payload.sex;
    if (payload.age !== undefined) mapped.age = Number(payload.age);
    if (payload.totalChol !== undefined)
      mapped.totalChol = Number(payload.totalChol);
    if (payload.hdl !== undefined) mapped.hdl = Number(payload.hdl);
    if (payload.sbp !== undefined) mapped.sbp = Number(payload.sbp);
    if (payload.treated !== undefined) mapped.treated = Boolean(payload.treated);
    if (payload.smoker !== undefined) mapped.smoker = Boolean(payload.smoker);
    if (payload.diabetes !== undefined)
      mapped.diabetes = Boolean(payload.diabetes);
  }

  // Check for required fields that are still missing
  const requiredFields: (keyof FraminghamCvdInput)[] = [
    "sex",
    "age",
    "totalChol",
    "hdl",
    "sbp",
    "treated",
    "smoker",
    "diabetes",
  ];

  for (const field of requiredFields) {
    if (mapped[field] === undefined && !missingFields.includes(field)) {
      missingFields.push(field);
    }
  }

  return {
    mapped,
    isOldFormat,
    missingFields,
  };
}

// ============================================
// Mapper for Diabetes Payload
// ============================================
export function mapIncomingDiabetesPayload(payload: Record<string, unknown>): {
  mapped: Partial<FraminghamDiabetesInput>;
  isOldFormat: boolean;
  missingFields: string[];
} {
  const isOldFormat =
    "pregnancies" in payload ||
    "insulin" in payload ||
    "skin_thickness" in payload ||
    "diabetes_pedigree" in payload ||
    "blood_pressure" in payload;

  const mapped: Partial<FraminghamDiabetesInput> = {};
  const missingFields: string[] = [];

  if (isOldFormat) {
    // Map old format fields (PIMA Indians Diabetes Dataset)
    if (payload.age) mapped.age = Number(payload.age);
    if (payload.bmi) mapped.bmi = Number(payload.bmi);
    if (payload.blood_pressure) mapped.sbp = Number(payload.blood_pressure);

    // Guess sex if not provided (PIMA dataset is all females, use that as default)
    if (payload.sex) {
      mapped.sex =
        payload.sex === "M" || payload.sex === "male" ? "male" : "female";
    } else {
      // Default to female for PIMA compatibility
      mapped.sex = "female";
    }

    // Try to infer fasting glucose from "glucose" field if present
    if (payload.glucose && !payload.fastingGlucose) {
      mapped.fastingGlucose = Number(payload.glucose);
    }

    // Use reasonable clinical defaults for missing fields
    // These allow the model to run, but are conservative estimates
    mapped.onBpTherapy = payload.blood_pressure > 140 ? true : false; // Assume therapy if BP high
    mapped.parentalHistory = false; // Conservative default

    // For HDL and triglycerides, use population averages if not provided
    // These are suboptimal but better than failing
    if (!payload.hdl) {
      // Average HDL: women ~55, men ~45 mg/dL
      mapped.hdl = 50; // Middle ground
      console.warn(
        "⚠️ HDL not provided, using population average (50 mg/dL). Results may be less accurate."
      );
    } else {
      mapped.hdl = Number(payload.hdl);
    }

    if (!payload.tg) {
      // Average triglycerides: ~100-150 mg/dL in healthy adults
      mapped.tg = 120;
      console.warn(
        "⚠️ Triglycerides not provided, using population average (120 mg/dL). Results may be less accurate."
      );
    } else {
      mapped.tg = Number(payload.tg);
    }
  } else {
    // New format - pass through with validation
    if (payload.sex) mapped.sex = payload.sex;
    if (payload.age !== undefined) mapped.age = Number(payload.age);
    if (payload.bmi !== undefined) mapped.bmi = Number(payload.bmi);
    if (payload.sbp !== undefined) mapped.sbp = Number(payload.sbp);
    if (payload.onBpTherapy !== undefined)
      mapped.onBpTherapy = Boolean(payload.onBpTherapy);
    if (payload.hdl !== undefined) mapped.hdl = Number(payload.hdl);
    if (payload.tg !== undefined) mapped.tg = Number(payload.tg);
    if (payload.fastingGlucose !== undefined)
      mapped.fastingGlucose = Number(payload.fastingGlucose);
    if (payload.parentalHistory !== undefined)
      mapped.parentalHistory = Boolean(payload.parentalHistory);
  }

  // Check for required fields that are still missing
  const requiredFields: (keyof FraminghamDiabetesInput)[] = [
    "sex",
    "age",
    "bmi",
    "sbp",
    "onBpTherapy",
    "hdl",
    "tg",
    "fastingGlucose",
    "parentalHistory",
  ];

  for (const field of requiredFields) {
    if (mapped[field] === undefined && !missingFields.includes(field)) {
      missingFields.push(field);
    }
  }

  return {
    mapped,
    isOldFormat,
    missingFields,
  };
}
