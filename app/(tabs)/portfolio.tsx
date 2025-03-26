import { MaterialIcons } from "@expo/vector-icons";
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
import { PortfolioHoldingCard } from "../../src/components/portfolio/portfolio-holding-card";
import { PortfolioSummary } from "../../src/components/portfolio/portfolio-summary";
import { TransactionList } from "../../src/components/portfolio/transaction-list";
import { Button } from "../../src/components/ui/button";
import { Card } from "../../src/components/ui/card";
import { Text } from "../../src/components/ui/text";
import { colors, spacing } from "../../src/constants/theme";
import { usePortfolioStore } from "../../src/stores/portfolio-store";
import { Transaction } from "../../src/types/portfolio";

export default function PortfolioScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState<"holdings" | "transactions">("holdings");
  const router = useRouter();

  const {
    portfolios,
    activePortfolio,
    isLoading,
    loadPortfolios,
    getTransactions,
  } = usePortfolioStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (view === "transactions" && activePortfolio) {
      loadTransactions();
    }
  }, [view, activePortfolio]);

  const loadTransactions = async () => {
    if (!activePortfolio) return;

    setTransactionsLoading(true);
    try {
      const data = await getTransactions(activePortfolio.id);
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolios();
    if (view === "transactions" && activePortfolio) {
      await loadTransactions();
    }
    setRefreshing(false);
  };

  const navigateToAddHolding = () => {
    router.push("/portfolio/add-holding");
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!activePortfolio) {
    return (
      <View style={styles.container}>
        <Card style={styles.emptyCard}>
          <Text variant="body" align="center" style={styles.emptyText}>
            You don't have any portfolios yet.
          </Text>
          <Button
            style={styles.emptyButton}
            onPress={() => router.push("/portfolio/create")}
          >
            Create Portfolio
          </Button>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="heading">{activePortfolio.name}</Text>

        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/portfolio/edit")}
        >
          <MaterialIcons name="edit" size={24} color={colors.primary[600]} />
        </Pressable>
      </View>

      <PortfolioSummary portfolio={activePortfolio} />

      <View style={styles.viewToggle}>
        <Pressable
          style={[
            styles.toggleButton,
            view === "holdings" && styles.activeToggle,
          ]}
          onPress={() => setView("holdings")}
        >
          <Text
            weight={view === "holdings" ? "semibold" : "regular"}
            color={view === "holdings" ? colors.primary[600] : colors.gray[600]}
          >
            Holdings
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleButton,
            view === "transactions" && styles.activeToggle,
          ]}
          onPress={() => setView("transactions")}
        >
          <Text
            weight={view === "transactions" ? "semibold" : "regular"}
            color={
              view === "transactions" ? colors.primary[600] : colors.gray[600]
            }
          >
            Transactions
          </Text>
        </Pressable>
      </View>

      {view === "holdings" ? (
        <>
          {activePortfolio.holdings.length > 0 ? (
            <FlatList
              data={activePortfolio.holdings}
              renderItem={({ item }) => <PortfolioHoldingCard holding={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text variant="body" align="center">
                You don't have any holdings in this portfolio yet.
              </Text>
              <Button style={styles.addButton} onPress={navigateToAddHolding}>
                Add Holding
              </Button>
            </View>
          )}
        </>
      ) : (
        <>
          {transactionsLoading ? (
            <ActivityIndicator size="large" color={colors.primary[600]} />
          ) : transactions.length > 0 ? (
            <TransactionList
              transactions={transactions}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text variant="body" align="center">
                No transactions found for this portfolio.
              </Text>
              <Button style={styles.addButton} onPress={navigateToAddHolding}>
                Add New Transaction
              </Button>
            </View>
          )}
        </>
      )}

      {view === "holdings" && activePortfolio.holdings.length > 0 && (
        <Button style={styles.floatingButton} onPress={navigateToAddHolding}>
          Add Holding
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
  viewToggle: {
    flexDirection: "row",
    marginVertical: spacing.md,
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
  listContent: {
    paddingBottom: spacing.xxl,
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
