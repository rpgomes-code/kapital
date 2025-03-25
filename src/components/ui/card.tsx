import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from "react-native";
import { borderRadius, colors, shadows } from "../../constants/theme";

interface CardProps extends ViewProps {
  variant?: "elevated" | "outlined" | "filled";
}

export function Card({
  variant = "elevated",
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

interface CardPressableProps extends TouchableOpacityProps {
  variant?: "elevated" | "outlined" | "filled";
}

export function CardPressable({
  variant = "elevated",
  style,
  children,
  ...props
}: CardPressableProps) {
  return (
    <TouchableOpacity style={[styles.card, styles[variant], style]} {...props}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: 16,
    overflow: "hidden",
  },
  elevated: {
    backgroundColor: "white",
    ...shadows.md,
  },
  outlined: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  filled: {
    backgroundColor: colors.gray[100],
  },
});
