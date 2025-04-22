import { useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { ZodError } from "zod";

/**
 * A hook that handles displaying form errors in a consistent way
 *
 * @param form - The form instance from react-hook-form
 * @param errorMessage - Optional custom error message to display
 */
export function useFormError<T extends FieldValues>(
  form: UseFormReturn<T>,
  errorMessage: string = "Please check the form for errors"
): void {
  const { formState } = form;
  const { errors, isSubmitted } = formState;

  useEffect(() => {
    // Only show errors after the form has been submitted once
    if (isSubmitted && Object.keys(errors).length > 0) {
      // Get the first error message to display
      const firstError = Object.values(errors)[0];
      const errorMsg = firstError?.message
        ? String(firstError.message)
        : errorMessage;

      toast.error(errorMsg);
    }
  }, [errors, isSubmitted, errorMessage]);
}

/**
 * Handles Zod validation errors and returns them in a format suitable for use with forms
 *
 * @param error - The error object (typically caught in a try/catch)
 * @returns An object with error messages or null if not a Zod error
 */
export function handleZodError(error: unknown): Record<string, string> | null {
  if (error instanceof ZodError) {
    // Convert Zod errors to a record of field names and error messages
    return error.errors.reduce((acc, curr) => {
      const path = curr.path.join(".");
      acc[path] = curr.message;
      return acc;
    }, {} as Record<string, string>);
  }

  return null;
}
