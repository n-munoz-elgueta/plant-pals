import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { mediaUrl } from "../../../src/api/client";
import {
  useDeletePlant,
  usePlant,
  useWaterings,
  useWaterPlant,
} from "../../../src/api/hooks";
import { StatusBadge } from "../../../src/components/StatusBadge";
import { Button, ErrorText, Screen } from "../../../src/components/ui";
import { colors } from "../../../src/theme";

function formatWhen(iso: string): string {
  const date = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PlantDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const plantId = Number(params.id);
  const { data: plant, error } = usePlant(plantId);
  const { data: waterings } = useWaterings(plantId);
  const water = useWaterPlant();
  const deletePlant = useDeletePlant();

  const confirmDelete = () => {
    if (!plant) return;
    Alert.alert(
      `Remove ${plant.name}?`,
      "This deletes the plant and its watering history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () =>
            deletePlant.mutate(plantId, { onSuccess: () => router.back() }),
        },
      ]
    );
  };

  if (!plant) {
    return (
      <Screen>
        <ErrorText error={error} />
      </Screen>
    );
  }

  const photo = mediaUrl(plant.photo_url);

  return (
    <Screen style={{ padding: 0 }}>
      <Stack.Screen
        options={{
          title: plant.name,
          headerRight: () => (
            <Pressable hitSlop={8} onPress={() => router.push(`/plant/${plantId}/edit`)}>
              <Text style={styles.editLink}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      <FlatList
        contentContainerStyle={styles.list}
        data={waterings ?? []}
        keyExtractor={(w) => String(w.id)}
        ListHeaderComponent={
          <View>
            {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : null}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{plant.name}</Text>
                {plant.species ? (
                  <Text style={styles.species}>
                    {plant.species.common_name} · {plant.species.scientific_name}
                  </Text>
                ) : null}
              </View>
              <StatusBadge status={plant.status} />
            </View>
            <Text style={styles.meta}>
              Waters every {plant.water_interval_days} days · next due{" "}
              {plant.next_due}
            </Text>
            {plant.notes ? <Text style={styles.notes}>{plant.notes}</Text> : null}
            <Button
              title="💧 I watered it"
              onPress={() => water.mutate({ plantId })}
              loading={water.isPending}
            />
            <ErrorText error={water.error} />
            <Text style={styles.historyHeading}>Watering history</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.event}>
            <Text style={styles.eventWho}>💧 {item.user.display_name}</Text>
            <Text style={styles.eventWhen}>{formatWhen(item.watered_at)}</Text>
            {item.note ? <Text style={styles.eventNote}>{item.note}</Text> : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noHistory}>
            No waterings yet — be the first! 💧
          </Text>
        }
        ListFooterComponent={
          <View style={{ marginTop: 24 }}>
            <Button
              title="Remove plant"
              variant="danger"
              onPress={confirmDelete}
              loading={deletePlant.isPending}
            />
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 48,
  },
  photo: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },
  species: {
    fontSize: 14,
    color: colors.muted,
  },
  meta: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },
  notes: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    fontStyle: "italic",
  },
  historyHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  event: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  eventWho: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  eventWhen: {
    fontSize: 12,
    color: colors.muted,
  },
  eventNote: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
  },
  noHistory: {
    color: colors.muted,
    textAlign: "center",
    marginVertical: 16,
  },
  editLink: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
