import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button } from "../../../src/components/ui/button";
import { Input } from "../../../src/components/ui/input";
import { Text } from "../../../src/components/ui/text";
import { colors, spacing } from "../../../src/constants/theme";
import { usePortfolioStore } from "../../../src/stores/portfolio-store";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  ticker: string;
  tickerName?: string;
  currentPrice?: number;
}

export function AddTransactionModal({
  visible,
  onClose,
  ticker,
  tickerName = "",
  currentPrice = 0,
}: AddTransactionModalProps) {
  const { activePortfolio, addTransaction } = usePortfolioStore();
  const [shares, setShares] = useState("");
  const [price, setPrice] = useState(currentPrice.toString());
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setShares("");
    setPrice(currentPrice.toString());
    setType("BUY");
    setNotes("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!shares || isNaN(Number(shares)) || Number(shares) <= 0) {
      setError("Please enter a valid number of shares");
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!activePortfolio) {
      setError("No active portfolio selected");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await addTransaction({
        portfolioId: activePortfolio.id,
        ticker,
        shares: Number(shares),
        price: Number(price),
        type,
        date: new Date(),
        notes: notes.trim(),
      });

      // Close modal and reset form on success
      handleClose();
    } catch (error) {
      console.error("Error adding transaction:", error);
      setError("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate the transaction value
  const transactionValue = Number(shares) * Number(price) || 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text variant="subheading">
              {type === "BUY" ? "Buy" : "Sell"} {ticker}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.gray[500]} />
            </TouchableOpacity>
          </View>

          {tickerName && (
            <Text variant="body" style={styles.tickerName}>
              {tickerName}
            </Text>
          )}

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                type === "BUY" ? styles.activeTab : undefined,
              ]}
              onPress={() => setType("BUY")}
            >
              <Text
                weight="medium"
                style={type === "BUY" ? styles.activeTabText : undefined}
              >
                Buy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                type === "SELL" ? styles.activeTab : undefined,
              ]}
              onPress={() => setType("SELL")}
            >
              <Text
                weight="medium"
                style={type === "SELL" ? styles.activeTabText : undefined}
              >
                Sell
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Shares"
            placeholder="Number of shares"
            keyboardType="numeric"
            value={shares}
            onChangeText={setShares}
            leftIcon={
              <Ionicons
                name="documents-outline"
                size={20}
                color={colors.gray[500]}
              />
            }
          />

          <Input
            label="Price per share ($)"
            placeholder="Current price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            leftIcon={
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={colors.gray[500]}
              />
            }
          />

          <Input
            label="Notes (optional)"
            placeholder="Add notes about this transaction"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            leftIcon={
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.gray[500]}
              />
            }
          />

          <View style={styles.summaryContainer}>
            <Text variant="body" weight="semibold">
              Transaction Value:
            </Text>
            <Text variant="subheading" color={colors.primary[600]}>
              ${transactionValue.toFixed(2)}
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            onPress={handleSubmit}
            isLoading={isSubmitting}
            style={styles.submitButton}
          >
            {type === "BUY" ? "Buy" : "Sell"} {ticker}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  tickerName: {
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: colors.primary[600],
  },
  activeTabText: {
    color: "white",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  errorText: {
    color: colors.red[500],
    marginTop: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
