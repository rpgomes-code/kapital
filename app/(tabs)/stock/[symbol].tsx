import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { PriceChange } from "../../../src/components/stock/price-change";
import { StockChart } from "../../../src/components/stock/stock-chart";
import { Button } from "../../../src/components/ui/button";
import { Card } from "../../../src/components/ui/card";
import { Text } from "../../../src/components/ui/text";
import { colors, spacing } from "../../../src/constants/theme";
import { stockService } from "../../../src/services/stock-service";
import { usePortfolioStore } from "../../../src/stores/portfolio-store";
import { useWatchlistStore } from "../../../src/stores/watchlist-store";
import { HistoricalData, StockInfo, TimeRange } from "../../../src/types/stock";

export default function StockDetailsScreen() {
  const { symbol } = useLocalSearchParams();
  const [stock, setStock] = useState<StockInfo | null>(null);
  const [chartData, setChartData] = useState<HistoricalData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("1m");
  const [isLoading, setIsLoading] = useState(true);

  const { activeWatchlist, addToWatchlist } = useWatchlistStore();
  const { activePortfolio } = usePortfolioStore();

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  useEffect(() => {
    loadChartData();
  }, [symbol, timeRange]);

  const loadStockData = async () => {
    if (!symbol) return;

    setIsLoading(true);
    try {
      const stockInfo = await stockService.getStockInfo(symbol as string);
      setStock(stockInfo);
    } catch (error) {
      console.error("Error loading stock data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChartData = async () => {
    if (!symbol) return;

    try {
      const history = await stockService.getStockHistory(
        symbol as string,
        timeRange
      );
      setChartData(history);
    } catch (error) {
      console.error("Error loading chart data:", error);
    }
  };

  const handleAddToWatchlist = async () => {
    if (!activeWatchlist || !symbol) return;

    await addToWatchlist(activeWatchlist.id, symbol as string);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!stock) {
    return (
      <View style={styles.container}>
        <Text>Stock not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View>
          <Text variant="heading">{stock.symbol}</Text>
          <Text variant="body" style={styles.companyName}>
            {stock.shortName}
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text variant="heading">${stock.regularMarketPrice.toFixed(2)}</Text>
          <PriceChange
            change={stock.regularMarketChange}
            changePercent={stock.regularMarketChangePercent}
            size="md"
          />
        </View>
      </View>

      <Card style={styles.chartCard}>
        <View style={styles.timeRangeButtons}>
          {(["1d", "1w", "1m", "3m", "6m", "1y"] as TimeRange[]).map(
            (range) => (
              <Button
                key={range}
                size="sm"
                variant={timeRange === range ? "primary" : "outline"}
                style={styles.timeButton}
                onPress={() => setTimeRange(range)}
              >
                {range}
              </Button>
            )
          )}
        </View>

        <StockChart data={chartData} timeRange={timeRange} />
      </Card>

      <View style={styles.actionsContainer}>
        {activeWatchlist && (
          <Button style={styles.actionButton} onPress={handleAddToWatchlist}>
            Add to Watchlist
          </Button>
        )}

        {activePortfolio && (
          <Button style={styles.actionButton} variant="outline">
            Add to Portfolio
          </Button>
        )}
      </View>

      <Card style={styles.infoCard}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Key Statistics
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="caption">Open</Text>
            <Text variant="body">
              ${stock.regularMarketOpen?.toFixed(2) || "-"}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="caption">High</Text>
            <Text variant="body">
              ${stock.regularMarketDayHigh?.toFixed(2) || "-"}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="caption">Low</Text>
            <Text variant="body">
              ${stock.regularMarketDayLow?.toFixed(2) || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="caption">Volume</Text>
            <Text variant="body">
              {stock.regularMarketVolume?.toLocaleString() || "-"}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="caption">Market Cap</Text>
            <Text variant="body">{formatMarketCap(stock.marketCap)}</Text>
          </View>

          <View style={styles.statItem}>
            <Text variant="caption">Exchange</Text>
            <Text variant="body">{stock.exchange || "-"}</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

// Helper function to format market cap
function formatMarketCap(marketCap?: number): string {
  if (!marketCap) return "-";

  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  companyName: {
    color: colors.gray[600],
    marginTop: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  chartCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  timeRangeButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  timeButton: {
    marginHorizontal: 4,
    minWidth: 40,
  },
  actionsContainer: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  infoCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
  },
});
