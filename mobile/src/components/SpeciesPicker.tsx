import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Species } from "../api/types";
import { useSpecies } from "../api/hooks";
import { colors } from "../theme";
import { TextField } from "./ui";

export function SpeciesPicker({
  selected,
  onSelect,
}: {
  selected: Species | null;
  onSelect: (species: Species | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: species = [] } = useSpecies();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return species;
    return species.filter(
      (s) =>
        s.common_name.toLowerCase().includes(q) ||
        s.scientific_name.toLowerCase().includes(q)
    );
  }, [species, search]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Species (optional)</Text>
      <Pressable style={styles.selector} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.selectedText : styles.placeholder}>
          {selected ? selected.common_name : "Pick a species…"}
        </Text>
        {selected ? (
          <Pressable hitSlop={8} onPress={() => onSelect(null)}>
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </Pressable>
      {selected ? (
        <Text style={styles.hint}>
          Suggested: every {selected.suggested_interval_days} days.{" "}
          {selected.care_notes}
        </Text>
      ) : null}

      <Modal visible={open} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a species</Text>
            <Pressable hitSlop={8} onPress={() => setOpen(false)}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>
          <TextField
            placeholder="Search species…"
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Text style={styles.rowName}>{item.common_name}</Text>
                <Text style={styles.rowDetail}>
                  {item.scientific_name} · every {item.suggested_interval_days}{" "}
                  days
                </Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 4,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedText: {
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    fontSize: 16,
    color: colors.muted,
  },
  clear: {
    color: colors.muted,
    fontSize: 16,
    paddingHorizontal: 4,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.muted,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  close: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginVertical: 4,
  },
  rowName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  rowDetail: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
});
