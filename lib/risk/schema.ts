import { z } from "zod";

// ============================================
// Framingham CVD (General Cardiovascular Disease) Schema
// ============================================
export const framinghamCvdSchema = z.object({
  sex: z.enum(["male", "female"], {
    required_error: "Sex is required",
  }),
  age: z
    .number({
      required_error: "Age is required",
    })
    .min(30, "Age must be between 30-74 for this model")
    .max(74, "Age must be between 30-74 for this model"),
  totalChol: z
    .number({
      required_error: "Total cholesterol is required",
    })
    .min(100, "Total cholesterol seems too low")
    .max(405, "Total cholesterol seems too high"),
  hdl: z
    .number({
      required_error: "HDL cholesterol is required for accurate risk calculation",
    })
    .min(20, "HDL seems too low")
    .max(100, "HDL seems too high"),
  sbp: z
    .number({
      required_error: "Systolic blood pressure is required",
    })
    .min(90, "Systolic BP seems too low")
    .max(200, "Systolic BP seems too high"),
  treated: z.boolean({
    required_error: "Please indicate if patient is on BP medication",
  }),
  smoker: z.boolean({
    required_error: "Please indicate smoking status",
  }),
  diabetes: z.boolean({
    required_error: "Please indicate diabetes status",
  }),
});

export type FraminghamCvdInput = z.infer<typeof framinghamCvdSchema>;

// ============================================
// Framingham Diabetes (Offspring Study) Schema
// ============================================
export const framinghamDiabetesSchema = z.object({
  sex: z.enum(["male", "female"], {
    required_error: "Sex is required",
  }),
  age: z
    .number({
      required_error: "Age is required",
    })
    .min(20, "Age must be between 20-79 for this model")
    .max(79, "Age must be between 20-79 for this model"),
  bmi: z
    .number({
      required_error: "BMI is required",
    })
    .min(15, "BMI seems too low")
    .max(60, "BMI seems too high"),
  sbp: z
    .number({
      required_error: "Systolic blood pressure is required",
    })
    .min(90, "Systolic BP seems too low")
    .max(200, "Systolic BP seems too high"),
  onBpTherapy: z.boolean({
    required_error: "Please indicate if patient is on BP medication",
  }),
  hdl: z
    .number({
      required_error: "HDL cholesterol is required",
    })
    .min(20, "HDL seems too low")
    .max(100, "HDL seems too high"),
  tg: z
    .number({
      required_error: "Triglycerides are required",
    })
    .min(30, "Triglycerides seem too low")
    .max(1000, "Triglycerides seem too high"),
  fastingGlucose: z
    .number({
      required_error: "Fasting glucose is required",
    })
    .min(60, "Fasting glucose seems too low")
    .max(200, "Fasting glucose seems too high"),
  parentalHistory: z.boolean({
    required_error: "Please indicate if there is parental history of diabetes",
  }),
});

export type FraminghamDiabetesInput = z.infer<typeof framinghamDiabetesSchema>;

// ============================================
// Old Payload Schemas (for backward compatibility detection)
// ============================================
export const oldDiabetesPayloadSchema = z.object({
  testId: z.string().optional(),
  pregnancies: z.number(),
  glucose: z.number(),
  blood_pressure: z.number(),
  skin_thickness: z.number(),
  insulin: z.number(),
  bmi: z.number(),
  diabetes_pedigree: z.number(),
  age: z.number(),
});

export const oldCvdPayloadSchema = z.object({
  testId: z.string().optional(),
  age: z.number(),
  sex: z.string(),
  is_smoking: z.string(),
  cigsPerDay: z.number(),
  BPMeds: z.number(),
  prevalentStroke: z.number(),
  prevalentHyp: z.number(),
  diabetes: z.number(),
  totChol: z.number(),
  sysBP: z.number(),
  diaBP: z.number(),
  BMI: z.number(),
  heartRate: z.number(),
});
