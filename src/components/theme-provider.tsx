import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { colors as baseColors } from "../constants/theme";

// Define theme types
export type ThemeMode = "light" | "dark" | "system";

interface ThemeColors {
  primary: typeof baseColors.primary;
  gray: typeof baseColors.gray;
  green: typeof baseColors.green;
  red: typeof baseColors.red;
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to determine the actual theme based on mode and system preference
function resolveTheme(
  mode: ThemeMode,
  systemPreference: "light" | "dark" | null | undefined
): "light" | "dark" {
  if (mode === "system") {
    return systemPreference || "light";
  }
  return mode;
}

// Define the light and dark theme colors
const lightThemeColors: ThemeColors = {
  primary: baseColors.primary,
  gray: baseColors.gray,
  green: baseColors.green,
  red: baseColors.red,
  background: "#FFFFFF",
  card: "#FFFFFF",
  text: baseColors.gray[900],
  subText: baseColors.gray[600],
  border: baseColors.gray[200],
  shadow: "rgba(0, 0, 0, 0.1)",
};

const darkThemeColors: ThemeColors = {
  primary: baseColors.primary,
  gray: baseColors.gray,
  green: baseColors.green,
  red: baseColors.red,
  background: "#121212", // Dark theme background
  card: "#1E1E1E", // Slightly lighter than background
  text: "#FFFFFF",
  subText: baseColors.gray[400],
  border: baseColors.gray[800],
  shadow: "rgba(0, 0, 0, 0.5)",
};

// Get all theme colors based on current theme
function getThemeColors(theme: "light" | "dark"): ThemeColors {
  return theme === "light" ? lightThemeColors : darkThemeColors;
}

// Theme provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const systemColorScheme = useColorScheme();

  // Determine the actual theme (light or dark)
  const actualTheme = resolveTheme(themeMode, systemColorScheme);
  const isDark = actualTheme === "dark";
  const colors = getThemeColors(actualTheme);

  // Load saved theme preference on mount
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedTheme = await SecureStore.getItemAsync("themeMode");
        if (savedTheme) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error("Error loading theme preference:", error);
      }
    }

    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  const handleSetThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await SecureStore.setItemAsync("themeMode", mode);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Create the context value
  const contextValue: ThemeContextType = {
    mode: themeMode,
    colors,
    isDark,
    setThemeMode: handleSetThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook for using the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
