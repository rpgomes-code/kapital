import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button } from "../../src/components/ui/button";
import { Input } from "../../src/components/ui/input";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import { useAuthStore } from "../../src/stores/auth-store";

export default function LoginScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const { verifyPin, authenticateWithBiometrics, biometricsEnabled } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (biometricsEnabled) {
      handleBiometricAuth();
    }
  }, [biometricsEnabled]);

  const handleBiometricAuth = async () => {
    const success = await authenticateWithBiometrics();
    if (success) {
      router.replace("/(tabs)");
    }
  };

  const handleLogin = async () => {
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }

    const isValid = await verifyPin(pin);
    if (isValid) {
      router.replace("/(tabs)");
    } else {
      setError("Invalid PIN");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="heading" style={styles.title}>
          Welcome Back
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Enter your PIN to continue
        </Text>

        <Input
          style={styles.input}
          placeholder="Enter PIN"
          keyboardType="numeric"
          secureTextEntry
          value={pin}
          onChangeText={setPin}
          maxLength={6}
          error={error}
        />

        <Button style={styles.button} onPress={handleLogin}>
          Login
        </Button>

        {biometricsEnabled && (
          <Button
            variant="outline"
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            Use Biometrics
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
