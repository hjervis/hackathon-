import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/components/auth/auth-context';

export default function SignUp() {
  const { register, error, authenticating } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    const success = await register(username.trim(), email.trim(), password, phone.trim());
    if (!success) {
      // Error is already set in context, but you can add more UI feedback here if desired
      console.log('Registration failed:', error);
    }
  };

  // propagate errors to local state so we can auto‑clear them
  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  useEffect(() => {
    if (localError) {
      const id = setTimeout(() => setLocalError(null), 4000);
      return () => clearTimeout(id);
    }
  }, [localError]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Start staying safe today</Text>

      {(localError || error) && <Text style={styles.error}>{localError || error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (Optional - required for SMS alerts)"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity
        style={[styles.button, (!username || !email || !password) && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={!username || !email || !password || authenticating}
      >
        {authenticating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/(auth)/sign-in">
          <Text style={styles.link}>Sign in</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  error: { color: '#e53e3e', marginBottom: 16, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 16, marginBottom: 14, color: '#111',
  },
  button: {
    backgroundColor: '#111', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#666' },
  link: { color: '#111', fontWeight: '600' },
});