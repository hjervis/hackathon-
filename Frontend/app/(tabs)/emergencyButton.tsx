import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function EmergencyScreen() {
  const [sessionActive, setSessionActive] = useState(false);

  const handlePress = () => {
    if (sessionActive) {
      setSessionActive(false);
    } else {
      setSessionActive(true);
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
