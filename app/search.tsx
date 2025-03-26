import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AddTransactionModal } from "../src/components/portfolio/add-transaction-modal";
import { StockCard } from "../src/components/stock/stock-card";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Text } from "../src/components/ui/text";
import { colors, spacing } from "../src/constants/theme";
import { stockService } from "../src/services/stock-service";
import { usePortfolioStore } from "../src/stores/portfolio-store";
import { useWatchlistStore } from "../src/stores/watchlist-store";

export default function SearchScreen() {
  const { from } = useLocalSearchParams();
  const router = useRouter();
  const { activePortfolio } = usePortfolioStore();
  const { activeWatchlist, addToWatchlist } = useWatchlistStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const searchStocks = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await stockService.searchStocks(query);
      setResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error searching stocks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchStocks();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleStockPress = (stock: any) => {
    router.push(`/stock/${stock.symbol}`);
  };

  const handleAddToWatchlist = async (stock: any) => {
    if (!activeWatchlist) return;

    try {
      await addToWatchlist(activeWatchlist.id, stock.symbol);
      // Show feedback
      alert(`${stock.symbol} added to watchlist`);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  const handleAddToPortfolio = (stock: any) => {
    setSelectedStock(stock);
    setModalVisible(true);
  };

  const renderStockItem = ({ item }: { item: any }) => {
    // Format the item to match our StockInfo type
    const stockInfo = {
      symbol: item.symbol,
      shortName: item.shortName || item.name,
      regularMarketPrice: item.regularMarketPrice || 0,
      regularMarketChange: item.regularMarketChange || 0,
      regularMarketChangePercent: item.regularMarketChangePercent || 0,
    };

    return (
      <View style={styles.resultItem}>
        <StockCard stock={stockInfo} onPress={() => handleStockPress(item)} />

        <View style={styles.actionsContainer}>
          {activeWatchlist && (
            <Button
              variant="outline"
              size="sm"
              style={styles.actionButton}
              onPress={() => handleAddToWatchlist(item)}
            >
              Add to Watchlist
            </Button>
          )}

          {activePortfolio && (
            <Button
              size="sm"
              style={styles.actionButton}
              onPress={() => handleAddToPortfolio(item)}
            >
              Add to Portfolio
            </Button>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    if (query.trim() && !isLoading && results.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={colors.gray[400]} />
          <Text style={styles.emptyText}>No results found</Text>
          <Text variant="caption">Try a different search term</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={48} color={colors.gray[400]} />
        <Text style={styles.emptyText}>Search for stocks</Text>
        <Text variant="caption">Enter a company name or ticker symbol</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Search",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (from === "portfolio") {
                  router.push("/portfolio");
                } else if (from === "watchlist") {
                  router.push("/watchlist");
                } else {
                  router.back();
                }
              }}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Input
            placeholder="Search for stocks..."
            value={query}
            onChangeText={setQuery}
            leftIcon={
              <Ionicons name="search" size={20} color={colors.gray[500]} />
            }
            rightIcon={
              query ? (
                <Ionicons name="close" size={20} color={colors.gray[500]} />
              ) : undefined
            }
            onRightIconPress={() => setQuery("")}
          />
        </View>

        <FlatList
          data={results}
          renderItem={renderStockItem}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={renderEmptyState}
        />

        {selectedStock && (
          <AddTransactionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            ticker={selectedStock.symbol}
            tickerName={selectedStock.shortName || selectedStock.name}
            currentPrice={selectedStock.regularMarketPrice || 0}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  backButton: {
    padding: spacing.xs,
  },
  searchBar: {
    padding: spacing.md,
    backgroundColor: "white",
  },
  resultsList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  resultItem: {
    marginBottom: spacing.md,
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
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
    fontSize: 18,
    fontWeight: "600",
  },
});
