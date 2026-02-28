import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, register as registerApi } from "../../api/api";

type User = { id: number; email: string; username: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
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

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("token");
        const savedUser = await SecureStore.getItemAsync("user");
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/sign-in");
        }
      } catch {
        router.replace("/(auth)/sign-in");
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await loginApi(email, password);
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    setError(null);
    try {
      await registerApi(username, email, password);
      await login(email, password);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setToken(null);
    setUser(null);
    router.replace("/(auth)/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
