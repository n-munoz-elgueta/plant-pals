import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PlantStatus } from "../api/types";
import { statusColor, statusLabel } from "../theme";

export function StatusBadge({ status }: { status: PlantStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: statusColor[status] }]}>
      <Text style={styles.text}>{statusLabel[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
