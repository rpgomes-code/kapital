import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemeProvider, useTheme } from "../src/components/theme-provider";
import { offlineService } from "../src/services/offline-service";
import { useAuthStore } from "../src/stores/auth-store";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Create an auth hook
function useAuth() {
  const { user, hasPin, isLoading, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, []);

  return {
    user,
    hasPin,
    isLoading,
  };
}

// Network monitoring hook
function useNetworkMonitoring() {
  useEffect(() => {
    // Set up network change listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      // When coming back online, process the sync queue
      if (state.isConnected) {
        offlineService.processSyncQueue().catch(console.error);
      }
    });

    // Check for pending sync operations on app start
    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        offlineService.processSyncQueue().catch(console.error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayoutWithTheme />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppLayoutWithTheme() {
  const { isLoading } = useAuth();
  const { colors, isDark } = useTheme();

  // Set up network monitoring
  useNetworkMonitoring();

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
