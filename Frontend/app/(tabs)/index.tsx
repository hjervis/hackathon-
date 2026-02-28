import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Location from "expo-location";

const SERVER_URL = process.env.EXPO_PUBLIC_IP_ADDRESS?.replace("http", "ws");

export default function EmergencyScreen() {
  const [sessionActive, setSessionActive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const locationRef = useRef<Location.LocationSubscription | null>(null);

  // connect to websocket when component loads
  useEffect(() => {
    // TODO: replace "test-user" with the actual logged in user's name from your auth system
    const ws = new WebSocket(`${SERVER_URL}/ws/test-user`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket connected!");
    ws.onclose = () => console.log("WebSocket disconnected!");
    ws.onerror = (e) => console.log("WebSocket error:", e);

    // cleanup websocket when component unmounts
    return () => ws.close();
  }, []);

  const handlePress = async () => {
    if (sessionActive) {
      // stop the session — stop sending location updates
      setSessionActive(false);
      if (locationRef.current) {
        locationRef.current.remove();
        locationRef.current = null;
      }
    } else {
      // start the session
      setSessionActive(true);

      // request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      // get current location to send with the emergency alert
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // send emergency alert with current location
      // TODO: replace emergency_contact and user_name with real values from your auth/database
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "emergency_alert",
          lat: latitude,
          lng: longitude,
          user_name: "Test User",
          emergency_contact: "+19495620239"
        }));
      }

      // start sending live location updates every 5 seconds
      locationRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
        (loc) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: "location_update",
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            }));
          }
        }
      );
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
        <Text style={styles.sosText}>{sessionActive ? "STOP" : "SOS"}</Text>
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
