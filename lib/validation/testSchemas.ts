import { z } from "zod";

// ============================================
// Client-side validation schemas for test forms
// ============================================

/**
 * Framingham Offspring Diabetes Study inputs
 * Predicts 8-year Type 2 diabetes risk
 */
export const DiabetesFormSchema = z.object({
  sex: z.enum(["male", "female"], {
    message: "Sex is required",
  }),
  age: z
    .number({
      message: "Age is required",
    })
    .int("Age must be a whole number")
    .min(30, "Age must be at least 30")
    .max(80, "Age must be 80 or younger"),
  bmi: z
    .number({
      message: "BMI is required",
    })
    .min(18, "BMI must be at least 18")
    .max(40, "BMI must be 40 or lower"),
  sbp: z
    .number({
      message: "Systolic blood pressure is required",
    })
    .int("Blood pressure must be a whole number")
    .min(90, "Systolic BP must be at least 90 mmHg")
    .max(200, "Systolic BP must be 200 mmHg or lower"),
  onBpTherapy: z.boolean({
    message: "Please indicate if on blood pressure medication",
  }),
  hdl: z
    .number({
      message: "HDL cholesterol is required",
    })
    .int("HDL must be a whole number")
    .min(20, "HDL must be at least 20 mg/dL")
    .max(100, "HDL must be 100 mg/dL or lower"),
  tg: z
    .number({
      message: "Triglycerides are required",
    })
    .int("Triglycerides must be a whole number")
    .min(40, "Triglycerides must be at least 40 mg/dL")
    .max(500, "Triglycerides must be 500 mg/dL or lower"),
  fastingGlucose: z
    .number({
      message: "Fasting glucose is required",
    })
    .int("Fasting glucose must be a whole number")
    .min(70, "Fasting glucose must be at least 70 mg/dL")
    .max(200, "Fasting glucose must be 200 mg/dL or lower"),
  parentalHistory: z.boolean({
    message: "Please indicate parental diabetes history",
  }),
});

export type DiabetesForm = z.infer<typeof DiabetesFormSchema>;

/**
 * Framingham General CVD Model inputs
 * Predicts 10-year cardiovascular disease risk
 */
export const CvdFormSchema = z.object({
  sex: z.enum(["male", "female"], {
    message: "Sex is required",
  }),
  age: z
    .number({
      message: "Age is required",
    })
    .int("Age must be a whole number")
    .min(30, "Age must be at least 30")
    .max(79, "Age must be 79 or younger"),
  totalChol: z
    .number({
      message: "Total cholesterol is required",
    })
    .int("Total cholesterol must be a whole number")
    .min(100, "Total cholesterol must be at least 100 mg/dL")
    .max(405, "Total cholesterol must be 405 mg/dL or lower"),
  hdl: z
    .number({
      message: "HDL cholesterol is required",
    })
    .int("HDL must be a whole number")
    .min(20, "HDL must be at least 20 mg/dL")
    .max(100, "HDL must be 100 mg/dL or lower"),
  sbp: z
    .number({
      message: "Systolic blood pressure is required",
    })
    .int("Blood pressure must be a whole number")
    .min(90, "Systolic BP must be at least 90 mmHg")
    .max(200, "Systolic BP must be 200 mmHg or lower"),
  treated: z.boolean({
    message: "Please indicate if on blood pressure medication",
  }),
  smoker: z.boolean({
    message: "Please indicate smoking status",
  }),
  diabetes: z.boolean({
    message: "Please indicate diabetes status",
  }),
});

export type CvdForm = z.infer<typeof CvdFormSchema>;

/**
 * Helper function to safely parse string/number inputs
 * @param v - Input value (string or number)
 * @returns Parsed number or undefined if invalid
 */
export const parseNumber = (v: string | number): number | undefined => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed === "") return undefined;
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};
