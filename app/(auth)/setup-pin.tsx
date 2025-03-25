import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import { useAuthStore } from "../../src/stores/auth-store";

export default function SetupPinScreen() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const { setupPin, toggleBiometrics, biometricsAvailable } = useAuthStore();
  const router = useRouter();

  const handleSetupPin = async () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }

    try {
      await setupPin(pin);
      router.replace("/(tabs)");
    } catch (error) {
      setError("Failed to set up PIN");
    }
  };

  const handleBiometrics = async () => {
    try {
      await setupPin(pin);
      await toggleBiometrics(true);
      router.replace("/(tabs)");
    } catch (error) {
      setError("Failed to set up biometrics");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="heading" style={styles.title}>
          Set Up PIN
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Create a PIN to secure your app
        </Text>

        <Input
          style={styles.input}
          placeholder="Enter PIN"
          keyboardType="numeric"
          secureTextEntry
          value={pin}
          onChangeText={setPin}
          maxLength={6}
        />

        <Input
          style={styles.input}
          placeholder="Confirm PIN"
          keyboardType="numeric"
          secureTextEntry
          value={confirmPin}
          onChangeText={setConfirmPin}
          maxLength={6}
          error={error}
        />

        <Button style={styles.button} onPress={handleSetupPin}>
          Set PIN
        </Button>

        {biometricsAvailable && (
          <Button
            variant="outline"
            style={styles.biometricButton}
            onPress={handleBiometrics}
          >
            Enable Biometrics
          </Button>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.gray[600],
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  input: {
    width: "100%",
    marginBottom: spacing.lg,
  },
  button: {
    width: "100%",
    marginTop: spacing.md,
  },
  biometricButton: {
    width: "100%",
    marginTop: spacing.md,
  },
});
