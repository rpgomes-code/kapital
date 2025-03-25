import React from "react";
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
} from "react-native";
import { colors, fontSizes, fontWeights } from "../../constants/theme";

interface TextProps extends RNTextProps {
  variant?: "default" | "heading" | "subheading" | "body" | "caption" | "label";
  weight?: "regular" | "medium" | "semibold" | "bold";
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
}

export function Text({
  variant = "default",
  weight = "regular",
  color,
  align,
  style,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        styles[weight],
        align && { textAlign: align },
        color && { color },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.gray[900],
  },
  default: {
    fontSize: fontSizes.md,
  },
  heading: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold as "700",
  },
  subheading: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold as "600",
  },
  body: {
    fontSize: fontSizes.md,
  },
  caption: {
    fontSize: fontSizes.xs,
    color: colors.gray[500],
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as "500",
  },
  regular: {
    fontWeight: fontWeights.regular as "400",
  },
  medium: {
    fontWeight: fontWeights.medium as "500",
  },
  semibold: {
    fontWeight: fontWeights.semibold as "600",
  },
  bold: {
    fontWeight: fontWeights.bold as "700",
  },
});
