"use client";

import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { useAuth } from "@/components/auth/auth-context";

export default function SignIn() {
  const { login, error, loading, authenticating } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // clear errors when fields change
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (localError) {
      const id = setTimeout(() => setLocalError(null), 4000);
      return () => clearTimeout(id);
    }
  }, [localError]);

  const handleLogin = async () => {
    // login returns success flag now
    await login(email.trim(), password);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {(localError || error) && <Text style={styles.error}>{localError || error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={{ position: "relative" }}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.showHide}
          onPress={() => setShowPassword((v) => !v)}
        >
          <Text style={styles.showHideText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, (!email || !password) && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={!email || !password || authenticating}
      >
        {authenticating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/(auth)/sign-up">
          <Text style={styles.link}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  showHide: {
    position: "absolute",
    right: 16,
    top: 14,
  },
  showHideText: {
    color: "#666",
    fontSize: 14,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#111", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 32 },
  error: { color: "#e53e3e", marginBottom: 16, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
    color: "#111",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#666" },
  link: { color: "#111", fontWeight: "600" },
});