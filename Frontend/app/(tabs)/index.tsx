import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import * as Location from "expo-location";
import { useAuth } from "@/components/auth/auth-context";


export default function EmergencyScreen() {
  const { token, user, sendSocket, addSocketListener } = useAuth();
  const [sessionActive, setSessionActive] = useState(false);
  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const pollingActiveRef = useRef(false);
  const sessionIdRef = useRef<number | null>(null);
  const listenerRemover = useRef<(() => void) | undefined>(undefined);


  const startSharing = async () => {
    console.log("[startSharing] Called. user:", !!user, "sendSocket:", !!sendSocket);
    if (!user || !sendSocket) {
      console.warn("[startSharing] Missing user or sendSocket, returning");
      return;
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Location permission is needed to share your position");
      return;
    }

    // Get initial location for emergency alert
    const initialLoc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });

    sendSocket({ type: "start_session" });

    // Send emergency alert to trigger WhatsApp notification to all trusted contacts
    sendSocket({
      type: "emergency_alert",
      lat: initialLoc.coords.latitude,
      lng: initialLoc.coords.longitude,
    });

    // listen for the server replying with session id
    listenerRemover.current = addSocketListener?.((msg) => {
      if (msg.type === "session_started") {
        sessionIdRef.current = msg.session_id;
      }
    });

    console.log("[Location] Starting location polling...");
    pollingActiveRef.current = true;
    const pollLocation = async () => {
      while (pollingActiveRef.current) {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          console.log("[Location] Update received at:", new Date().toISOString(), "lat:", Math.round(loc.coords.latitude * 100) / 100);
          sendSocket({
            type: "location_update",
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
          });
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error("[Location] Error getting position:", error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };
    locationSub.current = {
      remove: () => {
        pollingActiveRef.current = false;
      }
    } as any;
    pollLocation();
    console.log("[Location] Location polling started");
    setSessionActive(true);
  };

  const stopSharing = () => {
    listenerRemover.current?.();
    listenerRemover.current = undefined;
    if (sendSocket) {
      sendSocket({ type: "end_session", session_id: sessionIdRef.current });
    }
    pollingActiveRef.current = false;
    if (locationSub.current) {
      try {
        locationSub.current.remove?.();
      } catch (e) {
        console.warn("Error removing location subscription:", e);
      }
      locationSub.current = null;
    }
    sessionIdRef.current = null;
    setSessionActive(false);
  };


  const handlePress = async () => {
    if (sessionActive) {
      stopSharing();
    } else {
      startSharing();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>SafeSignal</Text>
      <TouchableOpacity
        style={[styles.sosButton, sessionActive && styles.sosButtonActive]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <Text style={styles.sosText}>SOS</Text>
        <Text style={styles.sosSubText}>
          {sessionActive ? "Tap to end" : "Tap for help"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("../../app/(tabs)/fake-call")}
      >
        <Text>📞 Fake Call</Text>
      </TouchableOpacity>
      <Text style={styles.statusText}>
        {sessionActive ? "Session active" : "Standby"}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0f",
    alignItems: "center",
    justifyContent: "center",
    gap: 40,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 1,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1e1e2e",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ef4444",
  },
  sosButtonActive: {
    backgroundColor: "#ef4444",
  },
  sosText: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 4,
  },
  sosSubText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 4,
  },
  statusText: {
    color: "#94a3b8",
    fontSize: 14,
  },
});
