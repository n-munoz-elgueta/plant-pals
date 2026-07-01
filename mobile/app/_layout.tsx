import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

import { AuthProvider } from "../src/auth/AuthContext";
import { colors } from "../src/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerTintColor: colors.primaryDark,
            headerStyle: { backgroundColor: colors.background },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Log in" }} />
          <Stack.Screen name="register" options={{ title: "Create account" }} />
          <Stack.Screen
            name="household-setup"
            options={{ title: "Your household" }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="plant/new" options={{ title: "Add plant" }} />
          <Stack.Screen name="plant/[id]/index" options={{ title: "Plant" }} />
          <Stack.Screen name="plant/[id]/edit" options={{ title: "Edit plant" }} />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
