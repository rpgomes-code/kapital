import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import {
  DividendEvent,
  dividendService,
} from "../../src/services/dividend-service";
import { usePortfolioStore } from "../../src/stores/portfolio-store";
import { useWatchlistStore } from "../../src/stores/watchlist-store";

export default function DividendsScreen() {
  const [upcomingDividends, setUpcomingDividends] = useState<DividendEvent[]>(
    []
  );
  const [allDividends, setAllDividends] = useState<DividendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<"upcoming" | "all">("upcoming");

  const { portfolios } = usePortfolioStore();
  const { watchlists } = useWatchlistStore();
  const router = useRouter();

  useEffect(() => {
    loadDividends();
  }, []);

  const loadDividends = async () => {
    setIsLoading(true);
    try {
      // Load existing dividends
      const upcoming = await dividendService.getUpcomingDividends();
      const all = await dividendService.getDividends();

      setUpcomingDividends(upcoming);
      setAllDividends(all);

      // Get all tickers from portfolios and watchlists
      const tickers = new Set<string>();

      // Add portfolio holdings
      portfolios.forEach((portfolio) => {
        portfolio.holdings.forEach((holding) => {
          tickers.add(holding.ticker);
        });
      });

      // Add watchlist items
      watchlists.forEach((watchlist) => {
        watchlist.items.forEach((item) => {
          tickers.add(item.ticker);
        });
      });

      // Track dividends for all tickers
      if (tickers.size > 0) {
        await dividendService.trackAllDividends(Array.from(tickers));

        // Refresh lists after tracking
        const updatedUpcoming = await dividendService.getUpcomingDividends();
        const updatedAll = await dividendService.getDividends();

        setUpcomingDividends(updatedUpcoming);
        setAllDividends(updatedAll);
      }
    } catch (error) {
      console.error("Error loading dividends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDividends();
    setRefreshing(false);
  };

  const handleStockPress = (ticker: string) => {
    router.push(`/stock/${ticker}`);
  };

  const renderDividendItem = ({ item }: { item: DividendEvent }) => {
    const exDate = new Date(item.exDate);
    const paymentDate = new Date(item.paymentDate);

    // Determine if ex-date is in the past, today, or future
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const exDateObj = new Date(exDate);
    exDateObj.setHours(0, 0, 0, 0);

    const isPast = exDateObj < now;
    const isToday = exDateObj.getTime() === now.getTime();

    const statusColor = isPast
      ? colors.gray[500]
      : isToday
      ? colors.primary[600]
      : colors.green[500];
    const statusText = isPast ? "Past" : isToday ? "Today" : "Upcoming";

    return (
      <Card style={styles.dividendCard} variant="outlined">
        <Pressable
          style={styles.cardClickable}
          onPress={() => handleStockPress(item.ticker)}
        >
          <View style={styles.cardHeader}>
            <View>
              <Text variant="subheading">{item.ticker}</Text>
              <Text variant="body" style={styles.companyName}>
                {item.companyName}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}20` },
              ]}
            >
              <Text style={{ color: statusColor, fontWeight: "500" }}>
                {statusText}
              </Text>
            </View>
          </View>

          <View style={styles.dividendDetails}>
            <View style={styles.detailRow}>
              <Text variant="caption">Amount</Text>
              <Text variant="body" weight="semibold">
                ${item.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="caption">Ex-Dividend Date</Text>
              <Text>{format(exDate, "MMM d, yyyy")}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="caption">Payment Date</Text>
              <Text>{format(paymentDate, "MMM d, yyyy")}</Text>
            </View>
          </View>
        </Pressable>
      </Card>
    );
  };

  const getEmptyState = () => {
    if (view === "upcoming") {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={colors.gray[400]}
          />
          <Text variant="body" align="center" style={styles.emptyText}>
            No upcoming dividends in the next 30 days.
          </Text>
          <Text variant="body" align="center" style={styles.emptySubtext}>
            Add more stocks to your portfolio or watchlist to track their
            dividends.
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cash-outline" size={48} color={colors.gray[400]} />
          <Text variant="body" align="center" style={styles.emptyText}>
            No dividends found.
          </Text>
          <Text variant="body" align="center" style={styles.emptySubtext}>
            Add dividend-paying stocks to your portfolio or watchlist.
          </Text>
        </View>
      );
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">Dividends</Text>
      </View>

      <View style={styles.viewToggle}>
        <Pressable
          style={[
            styles.toggleButton,
            view === "upcoming" && styles.activeToggle,
          ]}
          onPress={() => setView("upcoming")}
        >
          <Text
            weight={view === "upcoming" ? "semibold" : "regular"}
            color={view === "upcoming" ? colors.primary[600] : colors.gray[600]}
          >
            Upcoming
          </Text>
        </Pressable>

        <Pressable
          style={[styles.toggleButton, view === "all" && styles.activeToggle]}
          onPress={() => setView("all")}
        >
          <Text
            weight={view === "all" ? "semibold" : "regular"}
            color={view === "all" ? colors.primary[600] : colors.gray[600]}
          >
            All
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={view === "upcoming" ? upcomingDividends : allDividends}
        renderItem={renderDividendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={getEmptyState()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  viewToggle: {
    flexDirection: "row",
    marginBottom: spacing.md,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dividendCard: {
    marginBottom: spacing.md,
  },
  cardClickable: {
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  companyName: {
    fontSize: 14,
    color: colors.gray[600],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 4,
  },
  dividendDetails: {
    marginTop: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  listContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    color: colors.gray[500],
    textAlign: "center",
  },
});
