import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi, register as registerApi } from '../../api/api';

type User = { id: number; email: string; username: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load saved auth info on app start
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        const savedUser = await AsyncStorage.getItem('user');

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/sign-in');
        }
      } catch {
        router.replace('/(auth)/sign-in');
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await loginApi(email, password);

      // Save token and user
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      router.replace('/(tabs)'); // redirect after login
    } catch (e: any) {
      setError(e.message || 'Login failed');
    }
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    setError(null);
    try {
      await registerApi(username, email, password);
      await login(email, password); // auto-login after registration
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    }
  };

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.replace('/(auth)/sign-in');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}