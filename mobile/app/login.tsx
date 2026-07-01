import { router } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { useAuth } from "../src/auth/AuthContext";
import { Button, ErrorText, Screen, TextField } from "../src/components/ui";
import { colors } from "../src/theme";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={styles.logo}>🪴</Text>
      <Text style={styles.title}>Plant Pals</Text>
      <Text style={styles.subtitle}>Co-parent your plants, together.</Text>
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <ErrorText error={error} />
      <Button title="Log in" onPress={submit} loading={busy} />
      <Button
        title="New here? Create an account"
        variant="secondary"
        onPress={() => router.push("/register")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontSize: 56,
    textAlign: "center",
    marginTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: colors.primaryDark,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: colors.muted,
    marginBottom: 24,
  },
});
