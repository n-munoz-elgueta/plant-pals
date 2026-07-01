import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Plant } from "../api/types";
import { colors } from "../theme";
import { StatusBadge } from "./StatusBadge";

function dueText(plant: Plant): string {
  if (plant.status === "due_today") return "Due today";
  if (plant.status === "overdue") return `Was due ${plant.next_due}`;
  return `Next due ${plant.next_due}`;
}

export function PlantCard({
  plant,
  onPress,
}: {
  plant: Plant;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      <View style={[styles.photo, styles.photoPlaceholder]}>
        <Text style={styles.photoEmoji}>🪴</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{plant.name}</Text>
        {plant.species ? (
          <Text style={styles.species}>{plant.species.common_name}</Text>
        ) : null}
        <Text style={styles.due}>{dueText(plant)}</Text>
        {plant.last_watered_by ? (
          <Text style={styles.lastWatered}>
            Last watered by {plant.last_watered_by}
          </Text>
        ) : (
          <Text style={styles.lastWatered}>Never watered yet</Text>
        )}
      </View>
      <StatusBadge status={plant.status} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  photoPlaceholder: {
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  photoEmoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  species: {
    fontSize: 13,
    color: colors.muted,
  },
  due: {
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  lastWatered: {
    fontSize: 12,
    color: colors.muted,
  },
});
