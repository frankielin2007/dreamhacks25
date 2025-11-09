import { describe, it, expect } from "vitest";
import {
  DiabetesFormSchema,
  CvdFormSchema,
  parseNumber,
} from "../lib/validation/testSchemas";

describe("parseNumber utility", () => {
  it("should parse valid number strings", () => {
    expect(parseNumber("42")).toBe(42);
    expect(parseNumber("3.14")).toBe(3.14);
  });

  it("should handle number inputs", () => {
    expect(parseNumber(42)).toBe(42);
    expect(parseNumber(3.14)).toBe(3.14);
  });

  it("should return undefined for empty strings", () => {
    expect(parseNumber("")).toBeUndefined();
    expect(parseNumber("   ")).toBeUndefined();
  });

  it("should return undefined for invalid inputs", () => {
    expect(parseNumber("abc")).toBeUndefined();
  });
});

describe("DiabetesFormSchema", () => {
  it("should accept valid diabetes form data", () => {
    const validData = {
      sex: "female" as const,
      age: 45,
      bmi: 28.5,
      sbp: 130,
      onBpTherapy: true,
      hdl: 55,
      tg: 150,
      fastingGlucose: 105,
      parentalHistory: true,
    };

    const result = DiabetesFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject age below minimum (18)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 15, // Too young
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("age");
      expect(result.error.issues[0].message).toContain("18");
    }
  });

  it("should reject age above maximum (100)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 105, // Too old
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("age");
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("should reject BMI below minimum (18)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 40,
      bmi: 15, // Too low
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("bmi");
      expect(result.error.issues[0].message).toContain("18");
    }
  });

  it("should reject BMI above maximum (40)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 40,
      bmi: 45, // Too high
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("bmi");
      expect(result.error.issues[0].message).toContain("40");
    }
  });

  it("should reject SBP below minimum (90)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 40,
      bmi: 25,
      sbp: 80, // Too low
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("sbp");
      expect(result.error.issues[0].message).toContain("90");
    }
  });

  it("should reject SBP above maximum (200)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 40,
      bmi: 25,
      sbp: 210, // Too high
      onBpTherapy: true,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("sbp");
      expect(result.error.issues[0].message).toContain("200");
    }
  });

  it("should reject HDL below minimum (20)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 15, // Too low
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("hdl");
      expect(result.error.issues[0].message).toContain("20");
    }
  });

  it("should reject HDL above maximum (100)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 110, // Too high
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("hdl");
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("should reject triglycerides below minimum (40)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 30, // Too low
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("tg");
      expect(result.error.issues[0].message).toContain("40");
    }
  });

  it("should reject triglycerides above maximum (500)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 600, // Too high
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("tg");
      expect(result.error.issues[0].message).toContain("500");
    }
  });

  it("should reject fasting glucose below minimum (70)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 60, // Too low
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("fastingGlucose");
      expect(result.error.issues[0].message).toContain("70");
    }
  });

  it("should reject fasting glucose above maximum (200)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 250, // Too high
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("fastingGlucose");
      expect(result.error.issues[0].message).toContain("200");
    }
  });

  it("should reject invalid sex values", () => {
    const invalidData = {
      sex: "other",
      age: 40,
      bmi: 25,
      sbp: 120,
      onBpTherapy: false,
      hdl: 50,
      tg: 120,
      fastingGlucose: 90,
      parentalHistory: false,
    };

    const result = DiabetesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe("CvdFormSchema", () => {
  it("should accept valid CVD form data", () => {
    const validData = {
      sex: "male" as const,
      age: 55,
      totalChol: 220,
      hdl: 45,
      sbp: 140,
      treated: true,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject age below minimum (18)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 15, // Too young
      totalChol: 200,
      hdl: 55,
      sbp: 120,
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("age");
      expect(result.error.issues[0].message).toContain("18");
    }
  });

  it("should reject age above maximum (100)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 105, // Too old
      totalChol: 200,
      hdl: 50,
      sbp: 130,
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("age");
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("should reject total cholesterol below minimum (100)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 50,
      totalChol: 90, // Too low
      hdl: 55,
      sbp: 120,
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("totalChol");
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("should reject total cholesterol above maximum (405)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 50,
      totalChol: 450, // Too high
      hdl: 45,
      sbp: 130,
      treated: true,
      smoker: true,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("totalChol");
      expect(result.error.issues[0].message).toContain("405");
    }
  });

  it("should reject HDL below minimum (20)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 45,
      totalChol: 200,
      hdl: 15, // Too low
      sbp: 120,
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("hdl");
      expect(result.error.issues[0].message).toContain("20");
    }
  });

  it("should reject HDL above maximum (100)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 45,
      totalChol: 200,
      hdl: 110, // Too high
      sbp: 120,
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("hdl");
      expect(result.error.issues[0].message).toContain("100");
    }
  });

  it("should reject SBP below minimum (90)", () => {
    const invalidData = {
      sex: "female" as const,
      age: 50,
      totalChol: 200,
      hdl: 60,
      sbp: 80, // Too low
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("sbp");
      expect(result.error.issues[0].message).toContain("90");
    }
  });

  it("should reject SBP above maximum (200)", () => {
    const invalidData = {
      sex: "male" as const,
      age: 60,
      totalChol: 220,
      hdl: 40,
      sbp: 220, // Too high
      treated: true,
      smoker: true,
      diabetes: true,
    };

    const result = CvdFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("sbp");
      expect(result.error.issues[0].message).toContain("200");
    }
  });

  it("should accept boundary values", () => {
    const boundaryData = {
      sex: "female" as const,
      age: 18, // Min age
      totalChol: 100, // Min cholesterol
      hdl: 20, // Min HDL
      sbp: 90, // Min SBP
      treated: false,
      smoker: false,
      diabetes: false,
    };

    const result = CvdFormSchema.safeParse(boundaryData);
    expect(result.success).toBe(true);
  });

  it("should accept maximum boundary values", () => {
    const boundaryData = {
      sex: "male" as const,
      age: 100, // Max age
      totalChol: 405, // Max cholesterol
      hdl: 100, // Max HDL
      sbp: 200, // Max SBP
      treated: true,
      smoker: true,
      diabetes: true,
    };

    const result = CvdFormSchema.safeParse(boundaryData);
    expect(result.success).toBe(true);
  });
});
