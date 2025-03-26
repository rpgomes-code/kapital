import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import { Text } from "../../../src/components/ui/text";
import { colors, spacing } from "../../../src/constants/theme";
import { stockService } from "../../../src/services/stock-service";
import { usePortfolioStore } from "../../../src/stores/portfolio-store";
import { StockInfo } from "../../../src/types/stock";

export default function AddHoldingScreen() {
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const { activePortfolio, addHolding, addTransaction } = usePortfolioStore();
  const router = useRouter();

  useEffect(() => {
    // Reset form when active portfolio changes
    setTicker("");
    setShares("");
    setPrice("");
    setNotes("");
    setStockInfo(null);
    setErrorMessage("");
  }, [activePortfolio]);

  // Look up stock info when ticker changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (ticker.length >= 1) {
        fetchStockInfo();
      } else {
        setStockInfo(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [ticker]);

  const fetchStockInfo = async () => {
    if (!ticker || ticker.length < 1) return;

    setIsSearching(true);
    setErrorMessage("");

    try {
      const info = await stockService.getStockInfo(ticker.toUpperCase());
      setStockInfo(info);

      // Auto-fill current price if price isn't already set
      if (!price && info.regularMarketPrice) {
        setPrice(info.regularMarketPrice.toString());
      }
    } catch (error) {
      console.error("Error fetching stock info:", error);
      setStockInfo(null);
      setErrorMessage("Could not find stock information for this ticker");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddHolding = async () => {
    if (!activePortfolio) {
      Alert.alert("Error", "No active portfolio selected");
      return;
    }

    if (!ticker) {
      setErrorMessage("Please enter a ticker symbol");
      return;
    }

    if (!shares || isNaN(Number(shares)) || Number(shares) <= 0) {
      setErrorMessage("Please enter a valid number of shares");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage("Please enter a valid price");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // First add the new transaction
      await addTransaction({
        portfolioId: activePortfolio.id,
        ticker: ticker.toUpperCase(),
        shares: Number(shares),
        price: Number(price),
        type: "BUY",
        date: new Date(date),
        notes: notes,
      });

      router.back();
    } catch (error) {
      console.error("Error adding holding:", error);
      setErrorMessage("Failed to add holding. Please try again.");
    } finally {
      setIsLoading(false);
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
        <Text variant="heading">Add Holding</Text>
      </View>

      <ScrollView style={styles.content}>
        <Input
          label="Ticker Symbol"
          placeholder="e.g., AAPL"
          value={ticker}
          onChangeText={(text: string) => setTicker(text.toUpperCase())}
          autoCapitalize="characters"
          rightIcon={
            isSearching ? <ActivityIndicator size="small" /> : undefined
          }
        />

        {stockInfo && (
          <View style={styles.stockInfo}>
            <Text variant="subheading">{stockInfo.shortName}</Text>
            <Text variant="body">
              ${stockInfo.regularMarketPrice.toFixed(2)}
            </Text>
          </View>
        )}

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Input
          label="Number of Shares"
          placeholder="e.g., 10"
          value={shares}
          onChangeText={setShares}
          keyboardType="decimal-pad"
        />

        <Input
          label="Price per Share"
          placeholder="e.g., 150.00"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <Input
          label="Purchase Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        <Input
          label="Notes (Optional)"
          placeholder="Add any notes about this purchase"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />

        <Button
          style={styles.addButton}
          onPress={handleAddHolding}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Add to Portfolio
        </Button>
      </ScrollView>
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
  stockInfo: {
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    color: colors.red[500],
    marginBottom: spacing.md,
  },
  notesInput: {
    height: 100,
  },
  addButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
});
