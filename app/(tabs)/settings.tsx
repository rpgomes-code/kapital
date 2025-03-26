import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, View } from "react-native";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import { dividendService } from "../../src/services/dividend-service";
import { notificationService } from "../../src/services/notification-service";
import { offlineService } from "../../src/services/offline-service";
import { useAuthStore } from "../../src/stores/auth-store";

export default function SettingsScreen() {
  const [dividendNotifications, setDividendNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const { biometricsEnabled, toggleBiometrics, signOut } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkBiometrics();
    loadSettings();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometrics(biometricsEnabled);
    setBiometricsAvailable(compatible && enrolled);
  };

  const loadSettings = async () => {
    // This would typically load from some settings store or secure storage
    // For now, we'll just use default values
    setDividendNotifications(true);
    setOfflineMode(false);
  };

  const handleToggleBiometrics = async (value: boolean) => {
    try {
      await toggleBiometrics(value);
      setBiometrics(value);
    } catch (error) {
      console.error("Error toggling biometrics:", error);
      Alert.alert("Error", "Failed to update biometrics settings");
    }
  };

  const handleToggleDividendNotifications = async (value: boolean) => {
    setDividendNotifications(value);

    if (value) {
      // Request notification permissions
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Notification Permission Required",
          "Please enable notifications in your device settings to receive dividend alerts."
        );
        setDividendNotifications(false);
        return;
      }

      // Schedule notifications for upcoming dividends
      const upcomingDividends = await dividendService.getUpcomingDividends();
      for (const dividend of upcomingDividends) {
        if (!dividend.notified) {
          await notificationService.scheduleDividendNotification(
            { symbol: dividend.ticker, shortName: dividend.companyName },
            new Date(dividend.exDate),
            new Date(dividend.paymentDate)
          );
          await dividendService.markAsNotified(dividend.id);
        }
      }
    } else {
      // Cancel all notifications
      await notificationService.cancelAllNotifications();
    }
  };

  const handleToggleOfflineMode = (value: boolean) => {
    setOfflineMode(value);
    // This would typically update some app-wide setting
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const renderSettingRow = (
    icon: string,
    title: string,
    description: string,
    rightElement: React.ReactNode
  ) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon as any} size={24} color={colors.primary[600]} />
      </View>
      <View style={styles.settingContent}>
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" style={styles.settingDescription}>
          {description}
        </Text>
      </View>
      <View style={styles.settingControl}>{rightElement}</View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">Settings</Text>
      </View>

      <Card style={styles.section}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Security
        </Text>

        {biometricsAvailable &&
          renderSettingRow(
            "finger-print-outline",
            "Biometric Authentication",
            "Use biometrics (Face ID/Touch ID) to unlock the app",
            <Switch
              value={biometrics}
              onValueChange={handleToggleBiometrics}
              trackColor={{
                false: colors.gray[300],
                true: colors.primary[400],
              }}
              thumbColor={biometrics ? colors.primary[600] : colors.gray[100]}
            />
          )}

        <View style={styles.buttonRow}>
          <Button
            variant="outline"
            style={styles.securityButton}
            onPress={() => router.push("/(auth)/setup-pin")}
          >
            Change PIN
          </Button>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Notifications
        </Text>

        {renderSettingRow(
          "calendar-outline",
          "Dividend Alerts",
          "Receive notifications about upcoming dividend dates",
          <Switch
            value={dividendNotifications}
            onValueChange={handleToggleDividendNotifications}
            trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
            thumbColor={
              dividendNotifications ? colors.primary[600] : colors.gray[100]
            }
          />
        )}
      </Card>

      <Card style={styles.section}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Data & Storage
        </Text>

        {renderSettingRow(
          "cloud-offline-outline",
          "Offline Mode",
          "Only use locally stored data when offline",
          <Switch
            value={offlineMode}
            onValueChange={handleToggleOfflineMode}
            trackColor={{ false: colors.gray[300], true: colors.primary[400] }}
            thumbColor={offlineMode ? colors.primary[600] : colors.gray[100]}
          />
        )}

        <View style={styles.syncButton}>
          <Button
            variant="outline"
            onPress={() => offlineService.processSyncQueue()}
          >
            Sync Now
          </Button>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Account
        </Text>

        <Button
          variant="destructive"
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </Card>

      <View style={styles.appInfo}>
        <Text variant="caption" align="center">
          Kapital
        </Text>
        <Text variant="caption" align="center" style={styles.version}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  settingIconContainer: {
    marginRight: spacing.sm,
  },
  settingContent: {
    flex: 1,
  },
  settingDescription: {
    color: colors.gray[600],
    marginTop: 2,
  },
  settingControl: {
    marginLeft: spacing.sm,
  },
  securityButton: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: spacing.md,
  },
  syncButton: {
    marginTop: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.sm,
  },
  appInfo: {
    padding: spacing.xl,
    alignItems: "center",
  },
  version: {
    color: colors.gray[500],
    marginTop: 4,
  },
});
