import React, { useEffect } from "react";
import { DimensionValue, StyleSheet, View, ViewStyle } from "react-native";
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
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.6, { duration: 800 }), -1, true);

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

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="40%" height={24} style={styles.title} />
      <Skeleton width="100%" height={16} style={styles.line} />
      <Skeleton width="90%" height={16} style={styles.line} />
      <Skeleton width="80%" height={16} />
    </View>
  );
}

export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <View style={styles.listItemContent}>
        <Skeleton
          width={50}
          height={50}
          borderRadius={25}
          style={styles.avatar}
        />
        <View style={styles.listItemText}>
          <Skeleton width="60%" height={18} style={styles.itemTitle} />
          <Skeleton width="80%" height={14} />
        </View>
      </View>
      <Skeleton width={60} height={26} borderRadius={13} />
    </View>
  );
}

export function SkeletonChart({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.chart, style]}>
      <Skeleton width="40%" height={24} style={styles.title} />
      <View style={styles.chartContainer}>
        <Skeleton width="100%" height={200} borderRadius={8} />
      </View>
      <View style={styles.legendContainer}>
        <Skeleton width={80} height={16} borderRadius={4} />
        <Skeleton width={80} height={16} borderRadius={4} />
        <Skeleton width={80} height={16} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.gray[300],
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  line: {
    marginBottom: 8,
  },
  listItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
  },
  itemTitle: {
    marginBottom: 8,
  },
  chart: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  chartContainer: {
    marginVertical: 16,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
