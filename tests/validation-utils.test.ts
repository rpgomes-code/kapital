import {
  hasErrors,
  validateDate,
  validateEmail,
  validateForm,
  validateNumber,
  validatePassword,
  validatePasswordMatch,
  validatePIN,
  validatePositiveNumber,
  validateRequired,
  validateTickerSymbol,
} from "../src/utils/validation-utils";

describe("Validation Utils", () => {
  // Test validateRequired
  describe("validateRequired", () => {
    it("should return error for empty string", () => {
      expect(validateRequired("")).toBe("Field is required");
      expect(validateRequired("  ")).toBe("Field is required");
    });

    it("should return null for non-empty string", () => {
      expect(validateRequired("test")).toBeNull();
    });

    it("should use custom field name in error message", () => {
      expect(validateRequired("", "Username")).toBe("Username is required");
    });
  });

  // Test validateNumber
  describe("validateNumber", () => {
    it("should return null for valid numbers", () => {
      expect(validateNumber("123")).toBeNull();
      expect(validateNumber("-123")).toBeNull();
      expect(validateNumber("0")).toBeNull();
      expect(validateNumber("123.45")).toBeNull();
    });

    it("should return error for non-numeric input", () => {
      expect(validateNumber("abc")).toBe("Field must be a number");
      expect(validateNumber("123abc")).toBe("Field must be a number");
    });

    it("should use custom field name in error message", () => {
      expect(validateNumber("abc", "Price")).toBe("Price must be a number");
    });

    it("should allow empty string if not required", () => {
      expect(validateNumber("")).toBeNull();
    });
  });

  // Test validatePositiveNumber
  describe("validatePositiveNumber", () => {
    it("should return error for empty string", () => {
      expect(validatePositiveNumber("")).toBe("Field is required");
    });

    it("should return error for non-numeric input", () => {
      expect(validatePositiveNumber("abc")).toBe("Field must be a number");
    });

    it("should return error for zero or negative numbers", () => {
      expect(validatePositiveNumber("0")).toBe(
        "Field must be greater than zero"
      );
      expect(validatePositiveNumber("-5")).toBe(
        "Field must be greater than zero"
      );
    });

    it("should return null for positive numbers", () => {
      expect(validatePositiveNumber("5")).toBeNull();
      expect(validatePositiveNumber("0.1")).toBeNull();
    });
  });

  // Test validateTickerSymbol
  describe("validateTickerSymbol", () => {
    it("should return null for valid ticker symbols", () => {
      expect(validateTickerSymbol("AAPL")).toBeNull();
      expect(validateTickerSymbol("MSFT")).toBeNull();
      expect(validateTickerSymbol("AMZN")).toBeNull();
      expect(validateTickerSymbol("BRK.A")).toBeNull();
      expect(validateTickerSymbol("BRK.B")).toBeNull();
    });

    it("should return error for empty ticker", () => {
      expect(validateTickerSymbol("")).toBe("Ticker symbol is required");
    });

    it("should return error for invalid ticker format", () => {
      expect(validateTickerSymbol("too-long-symbol")).toBe(
        "Invalid ticker symbol format"
      );
      expect(validateTickerSymbol("AB CD")).toBe(
        "Invalid ticker symbol format"
      );
      expect(validateTickerSymbol("##")).toBe("Invalid ticker symbol format");
    });
  });

  // Test validateDate
  describe("validateDate", () => {
    it("should return null for valid date format", () => {
      expect(validateDate("2023-01-01")).toBeNull();
      expect(validateDate("2023-12-31")).toBeNull();
    });

    it("should return error for invalid date format", () => {
      expect(validateDate("01/01/2023")).toBe(
        "Date must be in YYYY-MM-DD format"
      );
      expect(validateDate("2023-1-1")).toBe(
        "Date must be in YYYY-MM-DD format"
      );
      expect(validateDate("23-01-01")).toBe(
        "Date must be in YYYY-MM-DD format"
      );
    });

    it("should return error for invalid dates", () => {
      expect(validateDate("2023-13-01")).toBe("Date is invalid");
      expect(validateDate("2023-02-30")).toBe("Date is invalid");
    });

    it("should allow empty string if not required", () => {
      expect(validateDate("")).toBeNull();
    });
  });

  // Test validatePIN
  describe("validatePIN", () => {
    it("should return null for valid PIN", () => {
      expect(validatePIN("1234")).toBeNull();
      expect(validatePIN("123456")).toBeNull();
    });

    it("should return error for empty PIN", () => {
      expect(validatePIN("")).toBe("PIN is required");
    });

    it("should return error for PIN too short", () => {
      expect(validatePIN("123")).toBe("PIN must be at least 4 digits");
    });

    it("should return error for non-digit PIN", () => {
      expect(validatePIN("123a")).toBe("PIN must contain only digits");
      expect(validatePIN("abc1")).toBe("PIN must contain only digits");
    });
  });

  // Test validateEmail
  describe("validateEmail", () => {
    it("should return null for valid email", () => {
      expect(validateEmail("test@example.com")).toBeNull();
      expect(validateEmail("user.name+tag@example.co.uk")).toBeNull();
    });

    it("should return error for invalid email", () => {
      expect(validateEmail("test")).toBe("Invalid email address");
      expect(validateEmail("test@")).toBe("Invalid email address");
      expect(validateEmail("test@domain")).toBe("Invalid email address");
      expect(validateEmail("@domain.com")).toBe("Invalid email address");
    });

    it("should allow empty string if not required", () => {
      expect(validateEmail("")).toBeNull();
    });
  });

  // Test validatePassword
  describe("validatePassword", () => {
    it("should return null for valid password", () => {
      expect(validatePassword("password123")).toBeNull();
      expect(validatePassword("P@ssw0rd")).toBeNull();
    });

    it("should return error for empty password", () => {
      expect(validatePassword("")).toBe("Password is required");
    });

    it("should return error for password too short", () => {
      expect(validatePassword("pass1")).toBe(
        "Password must be at least 8 characters"
      );
    });

    it("should return error for password without letter", () => {
      expect(validatePassword("12345678")).toBe(
        "Password must contain at least one letter and one number"
      );
    });

    it("should return error for password without number", () => {
      expect(validatePassword("password")).toBe(
        "Password must contain at least one letter and one number"
      );
    });
  });

  // Test validatePasswordMatch
  describe("validatePasswordMatch", () => {
    it("should return null when passwords match", () => {
      expect(validatePasswordMatch("password123", "password123")).toBeNull();
    });

    it("should return error when passwords do not match", () => {
      expect(validatePasswordMatch("password123", "password124")).toBe(
        "Passwords do not match"
      );
    });
  });

  // Test validateForm
  describe("validateForm", () => {
    it("should validate multiple fields at once", () => {
      const rules = [
        {
          field: "name",
          value: "",
          validator: validateRequired,
          fieldName: "Name",
        },
        { field: "email", value: "invalid", validator: validateEmail },
        {
          field: "price",
          value: "-5",
          validator: validatePositiveNumber,
          fieldName: "Price",
        },
      ];

      const errors = validateForm(rules);
      expect(errors).toEqual({
        name: "Name is required",
        email: "Invalid email address",
        price: "Price must be greater than zero",
      });
    });

    it("should return empty object if no errors", () => {
      const rules = [
        { field: "name", value: "John", validator: validateRequired },
        { field: "email", value: "john@example.com", validator: validateEmail },
      ];

      const errors = validateForm(rules);
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  // Test hasErrors
  describe("hasErrors", () => {
    it("should return true if any field has an error", () => {
      const errors = {
        name: null,
        email: "Invalid email",
        password: null,
      };
      expect(hasErrors(errors)).toBe(true);
    });

    it("should return false if no fields have errors", () => {
      const errors = {
        name: null,
        email: null,
        password: null,
      };
      expect(hasErrors(errors)).toBe(false);
    });

    it("should return false for empty error object", () => {
      expect(hasErrors({})).toBe(false);
    });
  });
});
