/**
 * Form validation utilities for the app
 */

// Basic input validation
export function validateRequired(
  value: string,
  fieldName: string = "Field"
): string | null {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
  }
  return null;
}

// Number validation
export function validateNumber(
  value: string,
  fieldName: string = "Field"
): string | null {
  if (value === "") return null; // Allow empty if not required

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a number`;
  }
  return null;
}

export function validatePositiveNumber(
  value: string,
  fieldName: string = "Field"
): string | null {
  const requiredError = validateRequired(value, fieldName);
  if (requiredError) return requiredError;

  const numberError = validateNumber(value, fieldName);
  if (numberError) return numberError;

  const numValue = Number(value);
  if (numValue <= 0) {
    return `${fieldName} must be greater than zero`;
  }
  return null;
}

// Stock symbol validation
export function validateTickerSymbol(symbol: string): string | null {
  if (!symbol) return "Ticker symbol is required";

  // Basic pattern for most stock symbols (adjust as needed)
  const tickerRegex = /^[A-Z0-9.]{1,6}$/;

  if (!tickerRegex.test(symbol)) {
    return "Invalid ticker symbol format";
  }

  return null;
}

// Date validation
export function validateDate(
  dateString: string,
  fieldName: string = "Date"
): string | null {
  if (!dateString) return null; // Allow empty if not required

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format

  if (!dateRegex.test(dateString)) {
    return `${fieldName} must be in YYYY-MM-DD format`;
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} is invalid`;
  }

  return null;
}

// PIN validation
export function validatePIN(pin: string): string | null {
  if (!pin) return "PIN is required";

  if (pin.length < 4) {
    return "PIN must be at least 4 digits";
  }

  const pinRegex = /^\d+$/; // only digits

  if (!pinRegex.test(pin)) {
    return "PIN must contain only digits";
  }

  return null;
}

// Email validation
export function validateEmail(email: string): string | null {
  if (!email) return null; // Allow empty if not required

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return "Invalid email address";
  }

  return null;
}

// Password validation
export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";

  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }

  // Check for at least one number and one letter
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return "Password must contain at least one letter and one number";
  }

  return null;
}

// Confirm password validation
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string | null {
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  return null;
}

// Form validator utility for multiple fields
export interface ValidationRule {
  field: string;
  value: string;
  validator: (value: string, fieldName?: string) => string | null;
  fieldName?: string;
}

export function validateForm(rules: ValidationRule[]): {
  [key: string]: string | null;
} {
  const errors: { [key: string]: string | null } = {};

  rules.forEach((rule) => {
    const error = rule.validator(rule.value, rule.fieldName);
    if (error) {
      errors[rule.field] = error;
    }
  });

  return errors;
}

// Check if form has errors
export function hasErrors(errors: { [key: string]: string | null }): boolean {
  return Object.values(errors).some((error) => error !== null);
}
