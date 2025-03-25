import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/theme";
import { Portfolio } from "../../types/portfolio";
import { Card } from "../ui/card";
import { Text } from "../ui/text";

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  isLoading?: boolean;
}

export function PortfolioSummary({
  portfolio,
  isLoading = false,
}: PortfolioSummaryProps) {
  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.loadingContainer}>
          <Text>Loading portfolio summary...</Text>
        </View>
      </Card>
    );
  }

  const {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercentage,
    todayGain,
    todayGainPercentage,
  } = portfolio;

  const isPositiveTotal = totalGain >= 0;
  const isPositiveToday = todayGain >= 0;

  return (
    <Card style={styles.card}>
      <View style={styles.totalRow}>
        <Text variant="heading">${totalValue.toFixed(2)}</Text>

        <View style={styles.gainContainer}>
          <View
            style={[
              styles.gainBadge,
              {
                backgroundColor: isPositiveTotal
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              },
            ]}
          >
            <Text
              style={{
                color: isPositiveTotal ? colors.green[500] : colors.red[500],
                fontWeight: "500",
              }}
            >
              {isPositiveTotal ? "+" : ""}${totalGain.toFixed(2)} (
              {isPositiveTotal ? "+" : ""}
              {totalGainPercentage.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text variant="caption">Total Cost</Text>
          <Text>${totalCost.toFixed(2)}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text variant="caption">Today's Change</Text>
          <Text
            style={{
              color: isPositiveToday ? colors.green[500] : colors.red[500],
            }}
          >
            {isPositiveToday ? "+" : ""}${todayGain.toFixed(2)} (
            {isPositiveToday ? "+" : ""}
            {todayGainPercentage.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  gainContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  gainBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
  },
});
