import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:8000'; 

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (!res.ok) throw new Error(data.detail || 'Login failed');

  return data; // { user: {...}, token: "..." }
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

// Helper to get token
export async function getToken() {
  return await AsyncStorage.getItem('token');
}

// Helper to get saved user
export async function getUser() {
  const userString = await AsyncStorage.getItem('user');
  if (!userString) return null;
  return JSON.parse(userString);
}