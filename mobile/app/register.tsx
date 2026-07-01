import { router } from "expo-router";
import React, { useState } from "react";

import { useAuth } from "../src/auth/AuthContext";
import { Button, ErrorText, Screen, TextField } from "../src/components/ui";

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password.length < 8) {
      setError(new Error("Password must be at least 8 characters"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(email.trim(), password, name.trim());
      router.replace("/");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <TextField
        label="Your name"
        placeholder="How your partner sees you"
        value={name}
        onChangeText={setName}
      />
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
        placeholder="At least 8 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <ErrorText error={error} />
      <Button title="Create account" onPress={submit} loading={busy} />
    </Screen>
  );
}
