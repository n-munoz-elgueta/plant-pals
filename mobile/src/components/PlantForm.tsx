import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { Plant, Species } from "../api/types";
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
}: {
  initial?: Plant;
  submitLabel: string;
  onSubmit: (values: PlantFormValues) => void;
  submitting: boolean;
  error: unknown;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [species, setSpecies] = useState<Species | null>(initial?.species ?? null);
  const [interval, setInterval] = useState(
    String(initial?.water_interval_days ?? 7)
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

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
