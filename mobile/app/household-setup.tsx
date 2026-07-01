import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { useCreateHousehold, useJoinHousehold } from "../src/api/hooks";
import { Button, ErrorText, Screen, TextField } from "../src/components/ui";
import { colors } from "../src/theme";

export default function HouseholdSetup() {
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const create = useCreateHousehold();
  const join = useJoinHousehold();

  const onCreate = () =>
    create.mutate(householdName.trim() || "Our plants", {
      onSuccess: () => router.replace("/(tabs)"),
    });

  const onJoin = () =>
    join.mutate(inviteCode.trim(), {
      onSuccess: () => router.replace("/(tabs)"),
    });

  return (
    <Screen>
      <Text style={styles.heading}>Start a household</Text>
      <Text style={styles.hint}>
        Create a shared space for your plants, then send your partner the
        invite code so they can join.
      </Text>
      <TextField
        label="Household name"
        placeholder="e.g. Our jungle"
        value={householdName}
        onChangeText={setHouseholdName}
      />
      <Button title="Create household" onPress={onCreate} loading={create.isPending} />
      <ErrorText error={create.error} />

      <Text style={styles.divider}>— or —</Text>

      <Text style={styles.heading}>Join your partner</Text>
      <TextField
        label="Invite code"
        placeholder="6-letter code"
        autoCapitalize="characters"
        autoCorrect={false}
        value={inviteCode}
        onChangeText={setInviteCode}
      />
      <Button
        title="Join household"
        variant="secondary"
        onPress={onJoin}
        disabled={inviteCode.trim().length < 6}
        loading={join.isPending}
      />
      <ErrorText error={join.error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 8,
  },
  divider: {
    textAlign: "center",
    color: colors.muted,
    marginVertical: 16,
  },
});
