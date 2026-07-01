import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useHousehold } from "../src/api/hooks";
import { useAuth } from "../src/auth/AuthContext";
import { colors } from "../src/theme";

export default function Index() {
  const { ready, user } = useAuth();
  const household = useHousehold(ready && user !== null);

  if (!ready || (user && household.isLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (!user) return <Redirect href="/login" />;
  if (!household.data) return <Redirect href="/household-setup" />;
  return <Redirect href="/(tabs)" />;
}
