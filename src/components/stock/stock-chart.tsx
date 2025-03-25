import { format } from "date-fns";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import {
  VictoryAxis,
  VictoryChart,
  VictoryLine,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { colors } from "../../constants/theme";
import { HistoricalData, TimeRange } from "../../types/stock";
import { Text } from "../ui/text";

interface StockChartProps {
  data: HistoricalData[];
  timeRange: TimeRange;
  isLoading?: boolean;
}

const { width } = Dimensions.get("window");

export function StockChart({
  data,
  timeRange,
  isLoading = false,
}: StockChartProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chart...</Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No chart data available</Text>
      </View>
    );
  }

  // Determine the chart color based on price change
  const startPrice = data[0]?.close || 0;
  const endPrice = data[data.length - 1]?.close || 0;
  const priceChange = endPrice - startPrice;
  const chartColor = priceChange >= 0 ? colors.green[500] : colors.red[500];

  // Format the dates based on the time range
  const getDateFormat = () => {
    switch (timeRange) {
      case "1d":
        return "h:mm a";
      case "1w":
      case "1m":
        return "MMM d";
      default:
        return "MMM yyyy";
    }
  };

  return (
    <View style={styles.container}>
      <VictoryChart
        width={width - 40}
        height={200}
        padding={{ top: 10, bottom: 30, left: 40, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            voronoiDimension="x"
            labels={({ datum }: { datum: HistoricalData }) =>
              `$${datum.close.toFixed(2)}`
            }
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{ fill: "white", stroke: colors.gray[300] }}
                style={{ fontSize: 12, fill: colors.gray[800] }}
              />
            }
          />
        }
      >
        <VictoryAxis
          scale="time"
          tickFormat={(t: Date) => format(new Date(t), getDateFormat())}
          style={{
            tickLabels: { fontSize: 10, padding: 5, fill: colors.gray[500] },
            grid: { stroke: "transparent" },
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t: number) => `$${t}`}
          style={{
            tickLabels: { fontSize: 10, padding: 5, fill: colors.gray[500] },
            grid: { stroke: colors.gray[200], strokeDasharray: "5,5" },
          }}
        />
        <VictoryLine
          data={data}
          x="date"
          y="close"
          style={{
            data: { stroke: chartColor, strokeWidth: 2 },
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 10,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});
