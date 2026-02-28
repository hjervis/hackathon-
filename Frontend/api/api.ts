import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000'; // change if using device/emulator

// Helper to get the token
export async function getToken() {
  return await AsyncStorage.getItem('token');
}

// Login function
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  return data; // { token, user }
}

// Register function
export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Registration failed');
  return data;
}

// Example: fetch contacts
export async function fetchContacts() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/contacts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch contacts');
  return data;
}