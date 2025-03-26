import { Ionicons } from "@expo/vector-icons";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing } from "../constants/theme";
import { useTheme } from "./theme-provider";
import { Text } from "./ui/text";

const { width } = Dimensions.get("window");

export function NetworkStatusIndicator() {
  const [isConnected, setIsConnected] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [networkType, setNetworkType] = useState<string | null>(null);
  const slideAnim = useState(new Animated.Value(-60))[0];

  const { colors: themeColors } = useTheme();

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    // Check network state on mount
    NetInfo.fetch().then(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleNetworkChange = (state: NetInfoState) => {
    const connected = state.isConnected !== null ? state.isConnected : true;

    if (connected !== isConnected) {
      setIsConnected(connected);
      setNetworkType(state.type);
      setIsVisible(true);

      // Show the indicator
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 5 seconds if the network is connected
      if (connected) {
        setTimeout(() => {
          hideIndicator();
        }, 5000);
      }
    } else if (state.type !== networkType) {
      // Network type changed but still connected
      setNetworkType(state.type);
    }
  };

  const hideIndicator = () => {
    if (!showDetails) {
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  };

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  if (!isVisible) {
    return null;
  }

  const backgroundColor = isConnected ? colors.green[500] : colors.red[500];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={toggleDetails}
        activeOpacity={0.7}
      >
        <View style={styles.main}>
          <Ionicons
            name={isConnected ? "cloud-outline" : "cloud-offline-outline"}
            size={24}
            color="white"
          />
          <Text style={styles.text}>
            {isConnected ? "Connected" : "No Internet Connection"}
          </Text>
        </View>

        <Ionicons
          name={showDetails ? "chevron-up" : "chevron-down"}
          size={20}
          color="white"
        />
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.detailText}>
            Network Type: {networkType || "Unknown"}
          </Text>

          {isConnected ? (
            <Text style={styles.detailText}>
              Your data will sync automatically.
            </Text>
          ) : (
            <Text style={styles.detailText}>
              You're working in offline mode. Changes will be saved locally and
              synced when you're back online.
            </Text>
          )}

          {!isConnected && (
            <Text style={styles.detailText}>
              Some features may be limited while offline.
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: width,
    zIndex: 999,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  main: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
    marginLeft: spacing.sm,
  },
  details: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
  },
  detailText: {
    color: "white",
    marginBottom: spacing.xs,
  },
});
