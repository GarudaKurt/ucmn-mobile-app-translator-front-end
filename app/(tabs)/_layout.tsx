import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { HapticTab } from "@/components/haptic-tab";

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{icon}</Text>
      {focused && <View style={styles.tabDot} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🎙" label="Record" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="phraseslist"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Phrases" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0D1120",
    borderTopColor: "#1E2440",
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 80 : 90,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    elevation: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 52,
    borderRadius: 12,
    gap: 4,
  },
  tabIconFocused: {
    backgroundColor: "#1A1F35",
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#6C63FF",
  },
});
