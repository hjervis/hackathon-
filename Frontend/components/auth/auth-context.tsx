import { router } from "expo-router";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { login as loginApi, register as registerApi } from "../../api/api";
// shared storage helper abstracts secure store vs web fallback
import * as storage from "../../utils/storage";

type User = { id: number; email: string; username: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  /** whether we're checking stored credentials on app start */
  loading: boolean;
  /** whether a login/register request is in progress */
  authenticating: boolean;
  /** last error message from any auth operation */
  error: string | null;

  /** send a JSON message over the authenticated websocket */
  sendSocket?: (msg: any) => void;
  /** register a listener for incoming websocket messages */
  addSocketListener?: (cb: (msg: any) => void) => () => void;

  login: (email: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Array<(msg: any) => void>>([]);

  // open websocket when user/token become available
  useEffect(() => {
    if (token && user) {
      const base = process.env.EXPO_PUBLIC_IP_ADDRESS || "http://localhost:8000";
      const WS_URL = base.replace(/^http/, "ws");
      const wsUrl = `${WS_URL}/ws/${user.id}?token=${token}`;
      console.log("[WebSocket] Connecting to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;
      
      ws.onopen = () => {
        console.log("[WebSocket] Connected");
      };
      
      ws.onerror = (err) => {
        console.error("[WebSocket] Error:", err);
      };
      
      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          console.log("[WebSocket] Received:", msg);
          listenersRef.current.forEach((cb) => cb(msg));
        } catch {}
      };
      
      ws.onclose = () => {
        console.log("[WebSocket] Closed");
        socketRef.current = null;
      };
    }
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
      listenersRef.current = [];
    };
  }, [token, user]);

  // Load saved auth info on app start
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedToken = await storage.getItem("token");
        const savedUser = await storage.getItem("user");

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
  // rudimentary email validation
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const login = async (email: string, password: string) => {
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setAuthenticating(true);
    try {
      const data = await loginApi(email, password);

      // Save token and user
      await storage.setItem("token", data.token);
      await storage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);

      router.replace("/(tabs)");
      return true;
    } catch (e: any) {
      setError(e.message || "Login failed");
      return false;
    } finally {
      setAuthenticating(false);
    }
  };

  // Register function
  const register = async (
    username: string,
    email: string,
    password: string,
    phone?: string,
  ) => {
    setError(null);

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    setAuthenticating(true);
    try {
      await registerApi(username, email, password, phone);
      await login(email, password);
      return true;
    } catch (e: any) {
      setError(e.message || "Registration failed");
      return false;
    } finally {
      setAuthenticating(false);
    }
  };

  // Logout function
  const logout = async () => {
    await storage.deleteItem("token");
    await storage.deleteItem("user");
    setToken(null);
    setUser(null);
    socketRef.current?.close();
    socketRef.current = null;
    listenersRef.current = [];
    router.replace("/(auth)/sign-in");
  };

  const sendSocket = (msg: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("[WebSocket] Sending:", msg);
      socketRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("[WebSocket] Socket not ready. State:", socketRef.current?.readyState, "Message:", msg);
    }
  };
  const addSocketListener = (cb: (msg: any) => void) => {
    listenersRef.current.push(cb);
    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== cb);
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        authenticating,
        error,
        sendSocket,
        addSocketListener,
      }}
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
