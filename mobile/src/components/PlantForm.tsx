import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Plant, Species } from "../api/types";
import { mediaUrl } from "../api/client";
import { colors } from "../theme";
import { SpeciesPicker } from "./SpeciesPicker";
import { Button, ErrorText, TextField } from "./ui";

export interface PlantFormValues {
  name: string;
  species_id: number | null;
  water_interval_days: number;
  notes: string;
}

export function PlantForm({
  initial,
  submitLabel,
  onSubmit,
  submitting,
  error,
  photoUri,
  onPickPhoto,
}: {
  initial?: Plant;
  submitLabel: string;
  onSubmit: (values: PlantFormValues) => void;
  submitting: boolean;
  error: unknown;
  photoUri: string | null;
  onPickPhoto: (uri: string) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [species, setSpecies] = useState<Species | null>(initial?.species ?? null);
  const [interval, setInterval] = useState(
    String(initial?.water_interval_days ?? 7)
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  const existingPhoto = mediaUrl(initial?.photo_url ?? null);
  const shownPhoto = photoUri ?? existingPhoto;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      onPickPhoto(result.assets[0].uri);
    }
  };

  const selectSpecies = (next: Species | null) => {
    setSpecies(next);
    if (next) setInterval(String(next.suggested_interval_days));
  };

  const submit = () => {
    const intervalDays = parseInt(interval, 10);
    if (!name.trim()) {
      setValidationError("Give the plant a name");
      return;
    }
    if (!Number.isFinite(intervalDays) || intervalDays < 1 || intervalDays > 365) {
      setValidationError("Watering interval must be between 1 and 365 days");
      return;
    }
    setValidationError(null);
    onSubmit({
      name: name.trim(),
      species_id: species?.id ?? null,
      water_interval_days: intervalDays,
      notes: notes.trim(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Pressable style={styles.photoPicker} onPress={pickPhoto}>
          {shownPhoto ? (
            <Image source={{ uri: shownPhoto }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Text style={styles.photoEmoji}>📷</Text>
              <Text style={styles.photoHint}>Add a photo</Text>
            </View>
          )}
        </Pressable>

        <TextField
          label="Name"
          placeholder="e.g. Monty the Monstera"
          value={name}
          onChangeText={setName}
        />
        <SpeciesPicker selected={species} onSelect={selectSpecies} />
        <TextField
          label="Water every (days)"
          value={interval}
          onChangeText={setInterval}
          keyboardType="number-pad"
        />
        <TextField
          label="Notes (optional)"
          placeholder="Likes the east window…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <ErrorText error={validationError ?? error} />
        <Button title={submitLabel} onPress={submit} loading={submitting} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  photoPicker: {
    alignSelf: "center",
    marginVertical: 8,
  },
  photo: {
    width: 128,
    height: 128,
    borderRadius: 16,
  },
  photoPlaceholder: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  photoEmoji: {
    fontSize: 32,
  },
  photoHint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
});
