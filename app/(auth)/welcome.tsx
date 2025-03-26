import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../../src/components/ui/button";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text variant="heading" style={styles.title}>
          Kapital
        </Text>

        <Text variant="body" style={styles.subtitle}>
          Your investment portfolio tracker
        </Text>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Track your investments, monitor your portfolio performance, and stay
            updated with market trends.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            style={styles.button}
            onPress={() => router.push("/(auth)/setup-pin")}
          >
            Get Started
          </Button>

          <Button
            variant="outline"
            style={styles.button}
            onPress={() => router.push("/(auth)/login")}
          >
            I Already Have a PIN
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: colors.gray[600],
    marginBottom: spacing.xl,
  },
  description: {
    marginBottom: spacing.xl,
  },
  descriptionText: {
    textAlign: "center",
    color: colors.gray[700],
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    marginBottom: spacing.md,
  },
});
