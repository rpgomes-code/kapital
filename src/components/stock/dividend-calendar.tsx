import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { dividendService } from "../../services/dividend-service";
import { Card, CardPressable } from "../ui/card";
import { Text } from "../ui/text";

interface DividendCalendarProps {
  portfolioId: string;
}

interface DividendItem {
  ticker: string;
  shares: number;
  amount: number;
  estimatedAmount: number;
  exDate: string;
  paymentDate: string;
}

export function DividendCalendar({ portfolioId }: DividendCalendarProps) {
  const [dividends, setDividends] = useState<DividendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadDividends();
  }, [portfolioId]);

  const loadDividends = async () => {
    setIsLoading(true);
    try {
      const data = await dividendService.getPortfolioDividends(portfolioId);
      setDividends(data);

      // Schedule notifications
      dividendService.scheduleDividendNotifications(portfolioId);

      // Save for offline access
      dividendService.saveWatchedDividends(portfolioId, data);
    } catch (error) {
      console.error("Error loading dividends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToStock = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <Text>Loading dividend calendar...</Text>
      </Card>
    );
  }

  if (dividends.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Ionicons name="calendar-outline" size={48} color={colors.gray[400]} />
        <Text style={styles.emptyTitle}>No upcoming dividends</Text>
        <Text variant="caption" style={styles.emptyText}>
          Add dividend-paying stocks to your portfolio to see upcoming payments
        </Text>
      </Card>
    );
  }

  const renderDividendItem = ({ item }: { item: DividendItem }) => (
    <CardPressable
      style={styles.dividendCard}
      onPress={() => navigateToStock(item.ticker)}
    >
      <View style={styles.dividendHeader}>
        <Text weight="semibold">{item.ticker}</Text>
        <Text variant="caption">
          {item.shares} {item.shares === 1 ? "share" : "shares"}
        </Text>
      </View>

      <View style={styles.dividendDetails}>
        <View style={styles.detailRow}>
          <Text variant="caption">Ex-Dividend Date:</Text>
          <Text>{formatDate(item.exDate)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="caption">Payment Date:</Text>
          <Text>{formatDate(item.paymentDate)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="caption">Dividend per Share:</Text>
          <Text>${item.amount.toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="caption">Estimated Total:</Text>
          <Text weight="semibold" color={colors.green[600]}>
            ${item.estimatedAmount.toFixed(2)}
          </Text>
        </View>
      </View>
    </CardPressable>
  );

  return (
    <FlatList
      data={dividends}
      renderItem={renderDividendItem}
      keyExtractor={(item, index) => `${item.ticker}-${index}`}
      contentContainerStyle={styles.list}
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
  emptyTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    color: colors.gray[500],
  },
  list: {
    padding: spacing.md,
  },
  dividendCard: {
    marginBottom: spacing.md,
  },
  dividendHeader: {
    marginBottom: spacing.md,
  },
  dividendDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
});
