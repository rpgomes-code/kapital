import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, spacing } from "../../constants/theme";
import { Button } from "./button";
import { Text } from "./text";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonPress?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon = "search-outline",
  title,
  description,
  buttonText,
  onButtonPress,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={64} color={colors.gray[400]} />
      <Text variant="subheading" align="center" style={styles.title}>
        {title}
      </Text>
      {description && (
        <Text variant="body" align="center" style={styles.description}>
          {description}
        </Text>
      )}
      {buttonText && onButtonPress && (
        <Button style={styles.button} onPress={onButtonPress}>
          {buttonText}
        </Button>
      )}
    </View>
  );
}

export function PortfolioEmptyState({
  onCreatePress,
}: {
  onCreatePress?: () => void;
}) {
  return (
    <EmptyState
      icon="wallet-outline"
      title="No Portfolios"
      description="Create a portfolio to start tracking your investments."
      buttonText="Create Portfolio"
      onButtonPress={onCreatePress}
    />
  );
}

export function WatchlistEmptyState({
  onCreatePress,
}: {
  onCreatePress?: () => void;
}) {
  return (
    <EmptyState
      icon="eye-outline"
      title="Watchlist Empty"
      description="Add stocks to your watchlist to track them."
      buttonText="Add Stocks"
      onButtonPress={onCreatePress}
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon="search-outline"
      title="No Results Found"
      description={
        query
          ? `No results for "${query}"`
          : "Try searching for a stock symbol or company name"
      }
    />
  );
}

export function DividendsEmptyState() {
  return (
    <EmptyState
      icon="cash-outline"
      title="No Dividend Data"
      description="Add dividend-paying stocks to your portfolio or watchlist to track upcoming dividends."
    />
  );
}

export function NetworkErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection."
      buttonText="Try Again"
      onButtonPress={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.gray[500],
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  button: {
    minWidth: 200,
  },
});
