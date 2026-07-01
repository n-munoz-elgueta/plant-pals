import { Tabs } from "expo-router";
import React from "react";
import { Text } from "react-native";

import { colors } from "../../src/theme";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTintColor: colors.primaryDark,
        headerStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Plants",
          tabBarIcon: () => <TabIcon emoji="🪴" />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: () => <TabIcon emoji="📅" />,
        }}
      />
      <Tabs.Screen
        name="household"
        options={{
          title: "Household",
          tabBarIcon: () => <TabIcon emoji="🏡" />,
        }}
      />
    </Tabs>
  );
}
