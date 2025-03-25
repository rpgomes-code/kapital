import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import supabase from "../services/supabase";

interface AuthState {
  user: any | null;
  hasPin: boolean;
  biometricsEnabled: boolean;
  biometricsAvailable: boolean;
  isLoading: boolean;

  // Auth actions
  checkSession: () => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  authenticateWithBiometrics: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hasPin: false,
  biometricsEnabled: false,
  biometricsAvailable: false,
  isLoading: true,

  checkSession: async () => {
    set({ isLoading: true });
    try {
      // Check if user is signed in with Supabase
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user || null;

      // Check if PIN is set
      const pin = await SecureStore.getItemAsync("userPin");
      const isPinSet = !!pin;

      // Check if biometrics is enabled
      const biometricsEnabled =
        (await SecureStore.getItemAsync("biometricsEnabled")) === "true";

      // Check if device supports biometrics
      const biometricsSupported = await LocalAuthentication.hasHardwareAsync();
      const biometricsAvailable =
        biometricsSupported && (await LocalAuthentication.isEnrolledAsync());

      set({
        user,
        hasPin: isPinSet,
        biometricsEnabled,
        biometricsAvailable,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error checking session:", error);
      set({ isLoading: false });
    }
  },

  setupPin: async (pin: string) => {
    try {
      await SecureStore.setItemAsync("userPin", pin);
      set({ hasPin: true });
      return Promise.resolve();
    } catch (error) {
      console.error("Error setting pin:", error);
      return Promise.reject(error);
    }
  },

  verifyPin: async (pin: string) => {
    try {
      const storedPin = await SecureStore.getItemAsync("userPin");
      return pin === storedPin;
    } catch (error) {
      console.error("Error verifying pin:", error);
      return false;
    }
  },

  toggleBiometrics: async (enabled: boolean) => {
    try {
      await SecureStore.setItemAsync(
        "biometricsEnabled",
        enabled ? "true" : "false"
      );
      set({ biometricsEnabled: enabled });
    } catch (error) {
      console.error("Error toggling biometrics:", error);
    }
  },

  authenticateWithBiometrics: async () => {
    try {
      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your portfolio",
        fallbackLabel: "Use PIN",
      });

      return success;
    } catch (error) {
      console.error("Error with biometric authentication:", error);
      return false;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));
