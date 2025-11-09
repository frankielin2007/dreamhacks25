import { z } from "zod";

// ============================================
// Framingham CVD (General Cardiovascular Disease) Schema
// ============================================
export const framinghamCvdSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z
    .number()
    .min(30, "Age must be between 30-74 for this model")
    .max(74, "Age must be between 30-74 for this model"),
  totalChol: z
    .number()
    .min(100, "Total cholesterol seems too low")
    .max(405, "Total cholesterol seems too high"),
  hdl: z
    .number()
    .min(20, "HDL seems too low")
    .max(100, "HDL seems too high"),
  sbp: z
    .number()
    .min(90, "Systolic BP seems too low")
    .max(200, "Systolic BP seems too high"),
  treated: z.boolean(),
  smoker: z.boolean(),
  diabetes: z.boolean(),
});

export type FraminghamCvdInput = z.infer<typeof framinghamCvdSchema>;

// ============================================
// Framingham Diabetes (Offspring Study) Schema
// ============================================
export const framinghamDiabetesSchema = z.object({
  sex: z.enum(["male", "female"]),
  age: z
    .number()
    .min(20, "Age must be between 20-79 for this model")
    .max(79, "Age must be between 20-79 for this model"),
  bmi: z
    .number()
    .min(15, "BMI seems too low")
    .max(60, "BMI seems too high"),
  sbp: z
    .number()
    .min(90, "Systolic BP seems too low")
    .max(200, "Systolic BP seems too high"),
  onBpTherapy: z.boolean(),
  hdl: z
    .number()
    .min(20, "HDL seems too low")
    .max(100, "HDL seems too high"),
  tg: z
    .number()
    .min(30, "Triglycerides seem too low")
    .max(1000, "Triglycerides seem too high"),
  fastingGlucose: z
    .number()
    .min(60, "Fasting glucose seems too low")
    .max(200, "Fasting glucose seems too high"),
  parentalHistory: z.boolean(),
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
