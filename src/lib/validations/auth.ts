import * as z from "zod";

// Reusable patterns
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const PASSWORD_MIN_LENGTH = 8;

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(5, { message: "Username must be at least 5 characters" })
      .max(20, { message: "Username must be less than 20 characters" })
      .regex(USERNAME_REGEX, {
        message:
          "Username can only contain letters, numbers, underscores and hyphens",
      }),
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name must be less than 50 characters" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(50, { message: "Last name must be less than 50 characters" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      })
      .refine(
        (password) => {
          // At least one uppercase letter
          const hasUppercase = /[A-Z]/.test(password);
          // At least one lowercase letter
          const hasLowercase = /[a-z]/.test(password);
          // At least one digit
          const hasDigit = /[0-9]/.test(password);
          // At least one special character
          const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

          return hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
        },
        {
          message:
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
        }
      ),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
