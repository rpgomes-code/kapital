import { z } from "zod";
import { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth";

/**
 * Auth API response types
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Seconds
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

/**
 * API Request payloads
 */

// Login request payload
export type LoginRequest = LoginFormValues;

// Registration request payload - omit confirmPassword as it's only used for client-side validation
export type RegisterRequest = Omit<RegisterFormValues, "confirmPassword">;

/**
 * Password reset flow
 */

// Schema for requesting a password reset
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

// Schema for resetting a password with token
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .refine(
        (password) => {
          const hasUppercase = /[A-Z]/.test(password);
          const hasLowercase = /[a-z]/.test(password);
          const hasDigit = /[0-9]/.test(password);
          const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

          return hasUppercase && hasLowercase && hasDigit && hasSpecialChar;
        },
        {
          message:
            "Password must include uppercase, lowercase, number and special character",
        }
      ),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
    token: z.string().min(1, { message: "Reset token is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
