import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { colors } from "../../src/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: colors.gray[200],
        },
        headerStyle: {
          backgroundColor: "white",
        },
        headerTitleStyle: {
          color: colors.gray[900],
          fontWeight: "600",
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="pie-chart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="eye-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="dividends"
        options={{
          title: "Dividends",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden route screens */}
      <Tabs.Screen
        name="stock/[symbol]"
        options={{
          href: null, // Hide this tab
          headerShown: true,
          title: "Stock Details",
        }}
      />

      <Tabs.Screen
        name="portfolio/add-holding"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="portfolio/create"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="portfolio/edit"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="watchlist/add-stock"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="watchlist/manage"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
