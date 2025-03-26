import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { StockCard } from "../../../src/components/stock/stock-card";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import { Text } from "../../../src/components/ui/text";
import { colors, spacing } from "../../../src/constants/theme";
import { stockService } from "../../../src/services/stock-service";
import { useWatchlistStore } from "../../../src/stores/watchlist-store";
import { StockInfo } from "../../../src/types/stock";

export default function AddStockScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { activeWatchlist, addToWatchlist } = useWatchlistStore();
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1) {
        searchStocks();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchStocks = async () => {
    if (searchQuery.length < 2) return;

    setIsSearching(true);
    setErrorMessage("");

    try {
      const results = await stockService.searchStocks(searchQuery);

      if (results && Array.isArray(results)) {
        setSearchResults(results);
      } else if (results && typeof results === "object") {
        // Handle case where API returns object instead of array
        setSearchResults(Object.values(results));
      } else {
        setSearchResults([]);
        setErrorMessage("No results found");
      }
    } catch (error) {
      console.error("Error searching stocks:", error);
      setErrorMessage("Error searching for stocks. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToWatchlist = async (stock: StockInfo) => {
    if (!activeWatchlist) {
      setErrorMessage("No active watchlist selected");
      return;
    }

    try {
      await addToWatchlist(activeWatchlist.id, stock.symbol);
      router.back();
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      setErrorMessage("Failed to add to watchlist");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text variant="heading">Add to Watchlist</Text>
      </View>

      <View style={styles.content}>
        <Input
          placeholder="Search for a stock symbol or company name"
          value={searchQuery}
          onChangeText={setSearchQuery}
          rightIcon={
            isSearching ? <ActivityIndicator size="small" /> : undefined
          }
          style={styles.searchInput}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : (
          <FlatList
            data={searchResults}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <StockCard stock={item} onPress={() => {}} />
                <Button
                  style={styles.addButton}
                  size="sm"
                  onPress={() => handleAddToWatchlist(item)}
                >
                  Add
                </Button>
              </View>
            )}
            keyExtractor={(item) => item.symbol}
            ListEmptyComponent={
              searchQuery.length > 1 ? (
                <View style={styles.emptyContainer}>
                  <Text>No results found for "{searchQuery}"</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultItem: {
    marginBottom: spacing.md,
    position: "relative",
  },
  addButton: {
    position: "absolute",
    bottom: spacing.md,
    right: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    color: colors.red[500],
    marginBottom: spacing.sm,
  },
});
