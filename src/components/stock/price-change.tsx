import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/theme";
import { Text } from "../ui/text";

interface PriceChangeProps {
  change: number;
  changePercent: number;
  size?: "sm" | "md" | "lg";
}

export function PriceChange({
  change,
  changePercent,
  size = "md",
}: PriceChangeProps) {
  const isPositive = change >= 0;
  const color = isPositive ? colors.green[500] : colors.red[500];
  const prefix = isPositive ? "+" : "";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isPositive
            ? "rgba(34, 197, 94, 0.1)"
            : "rgba(239, 68, 68, 0.1)",
        },
      ]}
    >
      <Text style={[styles.text, styles[size], { color }]}>
        {prefix}
        {change.toFixed(2)} ({prefix}
        {changePercent.toFixed(2)}%)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  text: {
    fontWeight: "500",
  },
  sm: {
    fontSize: 12,
  },
  md: {
    fontSize: 14,
  },
  lg: {
    fontSize: 16,
  },
});
