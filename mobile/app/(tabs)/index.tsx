import { router, Stack } from "expo-router";
import React from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usePlants } from "../../src/api/hooks";
import { PlantCard } from "../../src/components/PlantCard";
import { EmptyState, ErrorText, Screen } from "../../src/components/ui";
import { colors } from "../../src/theme";

export default function PlantList() {
  const { data: plants, isLoading, error, refetch, isRefetching } = usePlants();

  return (
    <Screen style={{ padding: 0 }}>
      <Stack.Screen options={{ title: "Plants" }} />
      <FlatList
        data={plants ?? []}
        keyExtractor={(plant) => String(plant.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <PlantCard plant={item} onPress={() => router.push(`/plant/${item.id}`)} />
        )}
        ListEmptyComponent={
          isLoading ? null : error ? (
            <ErrorText error={error} />
          ) : (
            <EmptyState
              title="No plants yet"
              hint="Add your first plant with the + button and start tracking waterings together."
            />
          )
        }
      />
      <Pressable style={styles.fab} onPress={() => router.push("/plant/new")}>
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
});
