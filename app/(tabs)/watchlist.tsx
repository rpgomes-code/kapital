import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import { StockCard } from "../../src/components/stock/stock-card";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import { useWatchlistStore } from "../../src/stores/watchlist-store";

export default function WatchlistScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const {
    watchlists,
    activeWatchlist,
    watchlistStocks,
    isLoading,
    loadWatchlists,
    removeFromWatchlist,
  } = useWatchlistStore();

  useEffect(() => {
    loadWatchlists();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWatchlists();
    setRefreshing(false);
  };

  const handleRemoveStock = (itemId: string) => {
    removeFromWatchlist(itemId);
  };

  const navigateToStock = (symbol: string) => {
    router.push(`/stock/${symbol}`);
  };

  const navigateToAddStock = () => {
    router.push("/watchlist/add-stock");
  };

  const navigateToManageWatchlists = () => {
    router.push("/watchlist/manage");
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!activeWatchlist) {
    return (
      <View style={styles.container}>
        <Card style={styles.emptyCard}>
          <Text variant="body" align="center" style={styles.emptyText}>
            You don't have any watchlists yet.
          </Text>
          <Button
            style={styles.emptyButton}
            onPress={() => router.push("/watchlist/create")}
          >
            Create Watchlist
          </Button>
        </Card>
      </View>
    );
  }

  const renderStock = ({ item }: { item: any }) => {
    // Find the watchlist item ID for this stock
    const watchlistItem = activeWatchlist.items.find(
      (i) => i.ticker === item.symbol
    );

    return (
      <View style={styles.stockItem}>
        <StockCard stock={item} onPress={() => navigateToStock(item.symbol)} />
        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemoveStock(watchlistItem?.id || "")}
        >
          <Ionicons name="close-circle" size={24} color={colors.red[500]} />
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">{activeWatchlist.name}</Text>

        <Pressable
          style={styles.editButton}
          onPress={navigateToManageWatchlists}
        >
          <MaterialIcons name="edit" size={24} color={colors.primary[600]} />
        </Pressable>
      </View>

      {watchlistStocks && watchlistStocks.length > 0 ? (
        <FlatList
          data={watchlistStocks}
          renderItem={renderStock}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text variant="body" align="center">
            Your watchlist is empty. Add stocks to track them.
          </Text>
          <Button style={styles.addButton} onPress={navigateToAddStock}>
            Add Stock
          </Button>
        </View>
      )}

      {watchlistStocks && watchlistStocks.length > 0 && (
        <Button style={styles.floatingButton} onPress={navigateToAddStock}>
          Add Stock
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
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
    alignItems: "center",
    marginBottom: spacing.md,
  },
  editButton: {
    padding: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  stockItem: {
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  addButton: {
    marginTop: spacing.lg,
  },
  floatingButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.xl,
    borderRadius: 30,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  emptyCard: {
    flex: 1,
    margin: spacing.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginBottom: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
});
