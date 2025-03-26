import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { usePortfolioStore } from "../../stores/portfolio-store";
import { Transaction } from "../../types/portfolio";
import { Card } from "../ui/card";
import { Text } from "../ui/text";

interface TransactionHistoryProps {
  portfolioId: string;
}

export function TransactionHistory({ portfolioId }: TransactionHistoryProps) {
  const { getTransactions } = usePortfolioStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [portfolioId]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions(portfolioId);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <Text>Loading transactions...</Text>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text align="center">No transactions found for this portfolio.</Text>
        <Text align="center" variant="caption" style={styles.emptySubtext}>
          Add a transaction to get started tracking your investments.
        </Text>
      </Card>
    );
  }

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isPositive = item.type === "BUY" || item.type === "DIVIDEND";
    const date = new Date(item.date);

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <Text weight="semibold">{item.ticker}</Text>
          <Text variant="caption">
            {format(date, "MMM d, yyyy")} · {item.type}
          </Text>
          {item.notes && (
            <Text variant="caption" style={styles.notes}>
              {item.notes}
            </Text>
          )}
        </View>
        <View style={styles.transactionRight}>
          <Text
            weight="semibold"
            color={isPositive ? colors.green[600] : colors.red[600]}
          >
            {isPositive ? "+" : "-"}
            {item.shares.toFixed(2)} shares
          </Text>
          <Text variant="caption">${item.price.toFixed(2)} per share</Text>
          <Text variant="caption" weight="medium">
            ${(item.shares * item.price).toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransactionItem}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptySubtext: {
    marginTop: spacing.sm,
    color: colors.gray[500],
  },
  list: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  transactionLeft: {
    flex: 1,
    paddingRight: spacing.md,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  notes: {
    marginTop: spacing.xs,
    color: colors.gray[600],
  },
  separator: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
});
