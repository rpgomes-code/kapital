import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { PortfolioSummary } from "../../src/components/portfolio/portfolio-summary";
import { StockCard } from "../../src/components/stock/stock-card";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import { usePortfolioStore } from "../../src/stores/portfolio-store";
import { useWatchlistStore } from "../../src/stores/watchlist-store";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const {
    activePortfolio,
    isLoading: portfolioLoading,
    loadPortfolios,
  } = usePortfolioStore();
  const { activeWatchlist, watchlistStocks, loadWatchlists } =
    useWatchlistStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadPortfolios(), loadWatchlists()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToStock = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Portfolio Summary
        </Text>
        {activePortfolio ? (
          <PortfolioSummary
            portfolio={activePortfolio}
            isLoading={portfolioLoading}
          />
        ) : (
          <Card style={styles.emptyCard}>
            <Text align="center">
              No portfolios found. Create one to get started.
            </Text>
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Watchlist
        </Text>
        {watchlistStocks && watchlistStocks.length > 0 ? (
          watchlistStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onPress={() => navigateToStock(stock.symbol)}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text align="center">
              Your watchlist is empty. Add stocks to track them.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  emptyCard: {
    alignItems: "center",
    padding: spacing.xl,
  },
});
