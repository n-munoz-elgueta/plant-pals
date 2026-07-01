import React from "react";
import { Share, StyleSheet, Text, View } from "react-native";

import { useHousehold } from "../../src/api/hooks";
import { useAuth } from "../../src/auth/AuthContext";
import { Button, Screen } from "../../src/components/ui";
import { colors } from "../../src/theme";
import { router } from "expo-router";

export default function Household() {
  const { user, logout } = useAuth();
  const { data: household } = useHousehold(true);

  const shareCode = () => {
    if (!household) return;
    Share.share({
      message: `Join our plant household "${household.name}" on Plant Pals with invite code: ${household.invite_code}`,
    });
  };

  return (
    <Screen>
      {household ? (
        <>
          <Text style={styles.name}>{household.name}</Text>
          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Invite code</Text>
            <Text style={styles.code}>{household.invite_code}</Text>
            <Text style={styles.codeHint}>
              Share this with your partner so they can join.
            </Text>
          </View>
          <Button title="Share invite code" variant="secondary" onPress={shareCode} />

          <Text style={styles.membersHeading}>Members</Text>
          {household.members.map((member) => (
            <View key={member.id} style={styles.member}>
              <Text style={styles.memberName}>
                {member.display_name}
                {member.id === user?.id ? " (you)" : ""}
              </Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
            </View>
          ))}
        </>
      ) : null}

      <View style={{ flex: 1 }} />
      <Button
        title="Log out"
        variant="danger"
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  code: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 6,
    color: colors.primaryDark,
    marginVertical: 4,
  },
  codeHint: {
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  membersHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
  },
  member: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  memberEmail: {
    fontSize: 12,
    color: colors.muted,
  },
});
