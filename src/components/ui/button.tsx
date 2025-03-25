import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import { borderRadius, colors, spacing } from "../../constants/theme";
import { Text } from "./text";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const buttonStyles: (ViewStyle | undefined)[] = [
    styles.base,
    styles[variant],
    styles[`${size}Size`],
    fullWidth ? styles.fullWidth : undefined,
    disabled || isLoading ? styles.disabled : undefined,
    style as ViewStyle,
  ];

  const textVariant =
    variant === "primary" || variant === "destructive"
      ? { color: "white" }
      : variant === "secondary"
      ? { color: colors.gray[800] }
      : { color: colors.primary[600] };

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "ghost"
              ? colors.primary[600]
              : "white"
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[styles.text, styles[`${size}Text`], textVariant]}
            weight="medium"
          >
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  fullWidth: {
    width: "100%",
  },
  primary: {
    backgroundColor: colors.primary[600],
  },
  secondary: {
    backgroundColor: colors.gray[200],
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary[600],
  },
  ghost: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: colors.red[600],
  },
  disabled: {
    opacity: 0.5,
  },
  smSize: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  mdSize: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  lgSize: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  text: {
    textAlign: "center",
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
});
