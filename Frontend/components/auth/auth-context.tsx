import { router } from "expo-router";
// replace direct secure-store usage with our wrapper that handles web fallbacks
// We no longer call expo-secure-store directly; use the storage wrapper so
// web builds fall back to localStorage.  The import below is only kept for
// reference; TypeScript will cropp it during transpilation.
import { setItem, getItem, deleteItem } from "../../utils/storage";
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

  // Load saved auth info on app start
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = await getItem("token");
        const savedUser = await getItem("user");

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
    loadAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await loginApi(email, password);

      // Save token and user
      await setItem("token", data.token);
      await setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "Login failed");
    }
  };

  // Register function
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
      setError(e.message || "Registration failed");
    }
  };

  // Logout function
  const logout = async () => {
    await deleteItem("token");
    await deleteItem("user");
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
