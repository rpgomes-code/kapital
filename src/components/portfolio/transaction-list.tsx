import { format } from "date-fns";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { Transaction } from "../../types/portfolio";
import { Card } from "../ui/card";
import { Text } from "../ui/text";

interface TransactionListProps {
  transactions: Transaction[];
  refreshControl?: React.ReactElement;
}

export function TransactionList({
  transactions,
  refreshControl,
}: TransactionListProps) {
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const { ticker, shares, price, type, date, notes } = item;

    // Determine colors based on transaction type
    const typeColor =
      type === "BUY"
        ? colors.green[500]
        : type === "SELL"
        ? colors.red[500]
        : colors.primary[500];

    // Format date
    const formattedDate = format(new Date(date), "MMM d, yyyy");

    return (
      <Card style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.tickerContainer}>
            <Text variant="subheading" weight="semibold">
              {ticker}
            </Text>
            <Text variant="caption" style={styles.dateText}>
              {formattedDate}
            </Text>
          </View>

          <View style={styles.typeContainer}>
            <View
              style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}
            >
              <Text
                style={[styles.typeText, { color: typeColor }]}
                weight="semibold"
              >
                {type}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text variant="caption">Shares</Text>
            <Text>{shares.toFixed(shares % 1 === 0 ? 0 : 4)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="caption">Price per Share</Text>
            <Text>${price.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="caption">Total Value</Text>
            <Text>${(shares * price).toFixed(2)}</Text>
          </View>

          {notes && (
            <View style={styles.notes}>
              <Text variant="caption">Notes</Text>
              <Text variant="body">{notes}</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransaction}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      refreshControl={refreshControl}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xl,
  },
  transactionCard: {
    marginBottom: spacing.md,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  tickerContainer: {},
  dateText: {
    marginTop: 2,
  },
  typeContainer: {
    alignItems: "flex-end",
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  transactionDetails: {
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  notes: {
    marginTop: spacing.sm,
  },
});
