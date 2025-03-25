import React from "react";
import { StyleSheet, View } from "react-native";
import { StockInfo } from "../../types/stock";
import { CardPressable } from "../ui/card";
import { Text } from "../ui/text";
import { PriceChange } from "./price-change";

interface StockCardProps {
  stock: StockInfo;
  onPress: () => void;
}

export function StockCard({ stock, onPress }: StockCardProps) {
  const {
    symbol,
    shortName,
    regularMarketPrice,
    regularMarketChange,
    regularMarketChangePercent,
  } = stock;

  return (
    <CardPressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.symbolContainer}>
          <Text variant="subheading" weight="semibold">
            {symbol}
          </Text>
          <Text variant="caption" numberOfLines={1} style={styles.name}>
            {shortName}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text variant="subheading" weight="semibold">
            ${regularMarketPrice.toFixed(2)}
          </Text>
          <PriceChange
            change={regularMarketChange}
            changePercent={regularMarketChangePercent}
          />
        </View>
      </View>
    </CardPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  symbolContainer: {
    flex: 1,
  },
  name: {
    marginTop: 2,
    maxWidth: "90%",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
});
