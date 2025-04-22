import {
  AuthResponse,
  AuthError,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordValues,
  ResetPasswordValues,
} from "@/types/auth";

// Base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com";

/**
 * Service for handling authentication-related API calls
 */
export const AuthService = {
  /**
   * Log in a user with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to login");
      }

      return await response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register");
      }

      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },

  /**
   * Request a password reset email
   */
  async forgotPassword(data: ForgotPasswordValues): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    data: Omit<ResetPasswordValues, "confirmPassword">
  ): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
          token: data.token,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse["user"]> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error("Failed to get current user");
      }

      return await response.json();
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  },

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<AuthResponse["tokens"]> {
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      return await response.json();
    } catch (error) {
      console.error("Refresh token error:", error);
      throw error;
    }
  },
};
