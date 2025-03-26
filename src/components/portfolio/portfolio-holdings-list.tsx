import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { Portfolio, PortfolioHolding } from "../../types/portfolio";
import { Card } from "../ui/card";
import { Text } from "../ui/text";

interface PortfolioHoldingsListProps {
  portfolio: Portfolio;
  onDeleteHolding?: (holdingId: string) => void;
}

export function PortfolioHoldingsList({
  portfolio,
  onDeleteHolding,
}: PortfolioHoldingsListProps) {
  const router = useRouter();

  if (!portfolio.holdings || portfolio.holdings.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text align="center">No holdings in this portfolio</Text>
        <Text align="center" variant="caption" style={styles.emptyText}>
          Add stocks to your portfolio to start tracking your investments
        </Text>
      </Card>
    );
  }

  const navigateToStock = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  const renderHolding = (holding: PortfolioHolding) => {
    const isPositiveValue =
      holding.gainPercentage && holding.gainPercentage >= 0;
    const isPositiveDay =
      holding.dayChangePercentage && holding.dayChangePercentage >= 0;

    return (
      <Card key={holding.id} style={styles.holdingCard}>
        <View style={styles.holdingHeader}>
          <TouchableOpacity
            style={styles.tickerContainer}
            onPress={() => navigateToStock(holding.ticker)}
          >
            <Text weight="semibold">{holding.ticker}</Text>
            <Text variant="caption">{holding.shares.toFixed(2)} shares</Text>
          </TouchableOpacity>

          {onDeleteHolding && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeleteHolding(holding.id)}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.red[500]}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.holdingDetails}>
          <View style={styles.detailItem}>
            <Text variant="caption">Current Value</Text>
            <Text weight="semibold">
              ${holding.value?.toFixed(2) || "0.00"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="caption">Cost Basis</Text>
            <Text>${(holding.averagePrice * holding.shares).toFixed(2)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="caption">Total Gain/Loss</Text>
            <Text
              color={isPositiveValue ? colors.green[600] : colors.red[600]}
              weight="semibold"
            >
              {isPositiveValue ? "+" : ""}${holding.gain?.toFixed(2) || "0.00"}{" "}
              ({isPositiveValue ? "+" : ""}
              {holding.gainPercentage?.toFixed(2) || "0.00"}%)
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text variant="caption">Today</Text>
            <Text color={isPositiveDay ? colors.green[600] : colors.red[600]}>
              {isPositiveDay ? "+" : ""}$
              {((holding.dayChange ?? 0) * holding.shares).toFixed(2) || "0.00"}{" "}
              ({isPositiveDay ? "+" : ""}
              {holding.dayChangePercentage?.toFixed(2) || "0.00"}%)
            </Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceItem}>
            <Text variant="caption">Current Price</Text>
            <Text>${holding.currentPrice?.toFixed(2) || "0.00"}</Text>
          </View>

          <View style={styles.priceItem}>
            <Text variant="caption">Avg Cost</Text>
            <Text>${holding.averagePrice.toFixed(2)}</Text>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {portfolio.holdings.map(renderHolding)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.gray[500],
  },
  holdingCard: {
    marginBottom: spacing.md,
  },
  holdingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  tickerContainer: {
    flex: 1,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  holdingDetails: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  priceContainer: {
    flexDirection: "row",
  },
  priceItem: {
    flex: 1,
  },
});
