import React, { useEffect } from "react";
import {
  DimensionValue,
  Platform,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../../constants/theme";

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);

    return () => {
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function StockCardSkeleton() {
  return (
    <View style={styles.stockCard}>
      <View style={styles.stockCardTop}>
        <View>
          <Skeleton width={80} height={18} style={styles.mb8} />
          <Skeleton width={120} height={14} />
        </View>
        <View style={styles.alignRight}>
          <Skeleton width={70} height={18} style={styles.mb8} />
          <Skeleton width={100} height={14} />
        </View>
      </View>
    </View>
  );
}

export function PortfolioSummarySkeleton() {
  return (
    <View style={styles.portfolioSummary}>
      <View style={styles.portfolioSummaryTop}>
        <Skeleton width={140} height={28} />
        <Skeleton width={120} height={20} />
      </View>
      <View style={styles.portfolioSummaryBottom}>
        <View style={{ flex: 1 }}>
          <Skeleton width={80} height={14} style={styles.mb8} />
          <Skeleton width={100} height={16} />
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Skeleton width={80} height={14} style={styles.mb8} />
          <Skeleton width={100} height={16} />
        </View>
      </View>
    </View>
  );
}

export function TransactionSkeleton() {
  return (
    <View style={styles.transaction}>
      <View style={{ flex: 1 }}>
        <Skeleton width={50} height={18} style={styles.mb8} />
        <Skeleton width={120} height={14} />
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Skeleton width={80} height={18} style={styles.mb8} />
        <Skeleton width={70} height={14} />
      </View>
    </View>
  );
}

export function StockDetailSkeleton() {
  return (
    <View style={styles.stockDetail}>
      <View style={styles.stockDetailHeader}>
        <View>
          <Skeleton width={80} height={24} style={styles.mb8} />
          <Skeleton width={150} height={16} />
        </View>
        <View style={styles.alignRight}>
          <Skeleton width={100} height={24} style={styles.mb8} />
          <Skeleton width={120} height={16} />
        </View>
      </View>

      <View style={styles.stockDetailCard}>
        <Skeleton
          width={200}
          height={16}
          style={{ alignSelf: "center", marginBottom: 20 }}
        />
        <Skeleton width="100%" height={180} />
      </View>

      <View style={styles.stockDetailStats}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Skeleton width={60} height={14} style={styles.mb8} />
            <Skeleton width={70} height={16} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={60} height={14} style={styles.mb8} />
            <Skeleton width={70} height={16} />
          </View>
          <View style={styles.statItem}>
            <Skeleton width={60} height={14} style={styles.mb8} />
            <Skeleton width={70} height={16} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[300],
  },
  mb8: {
    marginBottom: 8,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  stockCard: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stockCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  portfolioSummary: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  portfolioSummaryTop: {
    marginBottom: 16,
  },
  portfolioSummaryBottom: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: 16,
  },
  transaction: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  stockDetail: {
    padding: 16,
  },
  stockDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  stockDetailCard: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  stockDetailStats: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
});
