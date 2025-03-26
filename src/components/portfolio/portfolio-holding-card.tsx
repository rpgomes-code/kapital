import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { PortfolioHolding } from "../../types/portfolio";
import { PriceChange } from "../stock/price-change";
import { CardPressable } from "../ui/card";
import { Text } from "../ui/text";

interface PortfolioHoldingCardProps {
  holding: PortfolioHolding;
}

export function PortfolioHoldingCard({ holding }: PortfolioHoldingCardProps) {
  const router = useRouter();

  const {
    ticker,
    shares,
    averagePrice,
    currentPrice = 0,
    value = 0,
    gain = 0,
    gainPercentage = 0,
    dayChange = 0,
    dayChangePercentage = 0,
  } = holding;

  const handlePress = () => {
    router.push(`/stock/${ticker}`);
  };

  return (
    <CardPressable style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text variant="subheading" weight="semibold">
            {ticker}
          </Text>
          <Text variant="body" style={styles.sharesText}>
            {shares.toFixed(shares % 1 === 0 ? 0 : 2)} shares
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text variant="subheading" weight="semibold">
            ${value.toFixed(2)}
          </Text>
          <PriceChange change={gain} changePercent={gainPercentage} size="sm" />
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text variant="caption">Current Price</Text>
          <Text>${currentPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="caption">Average Price</Text>
          <Text>${averagePrice.toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="caption">Day Change</Text>
          <Text
            style={{
              color: dayChange >= 0 ? colors.green[500] : colors.red[500],
            }}
          >
            {dayChange >= 0 ? "+" : ""}${(dayChange * shares).toFixed(2)} (
            {dayChange >= 0 ? "+" : ""}
            {dayChangePercentage.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </CardPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  symbolContainer: {
    flex: 1,
  },
  sharesText: {
    color: colors.gray[600],
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  details: {
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
});
