import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { PortfolioHoldingsList } from "../../../src/components/portfolio/portfolio-holdings-list";
import { PortfolioSummary } from "../../../src/components/portfolio/portfolio-summary";
import { TransactionHistory } from "../../../src/components/portfolio/transaction-history";
import { Button } from "../../../src/components/ui/button";
import { Text } from "../../../src/components/ui/text";
import { colors, spacing } from "../../../src/constants/theme";
import { usePortfolioStore } from "../../../src/stores/portfolio-store";

export default function PortfolioDetailScreen() {
  const { activePortfolio, removeHolding } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<"holdings" | "transactions">(
    "holdings"
  );
  const router = useRouter();

  if (!activePortfolio) {
    router.replace("/portfolio");
    return null;
  }

  const confirmDeleteHolding = (holdingId: string) => {
    Alert.alert(
      "Remove Holding",
      "Are you sure you want to remove this holding from your portfolio?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeHolding(holdingId),
        },
      ]
    );
  };

  const navigateToAddStock = () => {
    router.push("/search?from=portfolio");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: activePortfolio.name,
          headerRight: () => (
            <TouchableOpacity onPress={navigateToAddStock}>
              <Ionicons name="add" size={24} color={colors.primary[600]} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <PortfolioSummary portfolio={activePortfolio} />

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "holdings" && styles.activeTab]}
            onPress={() => setActiveTab("holdings")}
          >
            <Text
              weight={activeTab === "holdings" ? "semibold" : "regular"}
              color={
                activeTab === "holdings"
                  ? colors.primary[600]
                  : colors.gray[700]
              }
            >
              Holdings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "transactions" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("transactions")}
          >
            <Text
              weight={activeTab === "transactions" ? "semibold" : "regular"}
              color={
                activeTab === "transactions"
                  ? colors.primary[600]
                  : colors.gray[700]
              }
            >
              Transactions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === "holdings" ? (
            <>
              <PortfolioHoldingsList
                portfolio={activePortfolio}
                onDeleteHolding={confirmDeleteHolding}
              />
              <Button onPress={navigateToAddStock}>+ Add Stock</Button>
            </>
          ) : (
            <TransactionHistory portfolioId={activePortfolio.id} />
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.md,
  },
  tabs: {
    flexDirection: "row",
    marginVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: "white",
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[600],
  },
  tabContent: {
    flex: 1,
  },
});
