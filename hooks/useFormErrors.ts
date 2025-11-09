import { useState } from "react";
import { z } from "zod";

/**
 * Custom hook for managing form validation errors
 * Provides utilities for Zod validation and error focusing
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Extract error messages from Zod validation result
   * @param result - Zod SafeParseReturnType
   * @returns Record mapping field names to error messages
   */
  function fromZod<T>(
    result: ReturnType<z.ZodSchema<T>["safeParse"]>
  ): Record<string, string> {
    if (result.success) return {};

    const errorMap: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string;
      if (field) {
        errorMap[field] = issue.message;
      }
    });
    return errorMap;
  }

  /**
   * Focus and scroll to the first invalid field
   * @param fieldIdMap - Optional map of error keys to actual element IDs (for field name mapping)
   */
  function focusFirstInvalid(fieldIdMap?: Record<string, string>): void {
    const firstErrorKey = Object.keys(errors)[0];
    if (!firstErrorKey) return;

    // Use mapped ID if provided, otherwise use the error key directly
    const elementId = fieldIdMap?.[firstErrorKey] || firstErrorKey;
    const element = document.getElementById(elementId);
    
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  /**
   * Clear error for a specific field
   * @param field - Field name to clear error for
   */
  function clearError(field: string): void {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }

  /**
   * Clear all errors
   */
  function clearAll(): void {
    setErrors({});
  }

  return {
    errors,
    setErrors,
    fromZod,
    focusFirstInvalid,
    clearError,
    clearAll,
  };
}
