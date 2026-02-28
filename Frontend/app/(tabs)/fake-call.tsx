import { getToken } from "@/api/api";
import { Audio } from "expo-av";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_IP_ADDRESS;

type CallState = "ringing" | "active" | "ended";

export default function FakeCallScreen() {
  const [callState, setCallState] = useState<CallState>("ringing");
  const [elapsed, setElapsed] = useState(0);
  const callerName = "Josh";
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startPulse();
    Vibration.vibrate([0, 400, 200, 400, 1000], true);
    return () => stopAll();
  }, []);

  const startPulse = () => {
    const loop = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.6,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    loop(pulseAnim, 0);
    loop(pulseAnim2, 400);
  };

  const stopAll = () => {
    Vibration.cancel();
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundRef.current) {
      soundRef.current.stopAsync();
      soundRef.current.unloadAsync();
    }
  };

  const handleAnswer = async () => {
    Vibration.cancel();
    setCallState("active");
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    await playAI();
  };

  const handleDecline = () => {
    stopAll();
    router.back();
  };

  const handleEndCall = () => {
    stopAll();
    setCallState("ended");
    setTimeout(() => router.back(), 800);
  };

  const playAI = async () => {
    try {
      const token = await getToken();
      console.log("Calling backend for audio..."); // test

      const response = await fetch(`${API_URL}/fake-call/audio`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status); // test

      if (!response.ok) {
        const err = await response.json();
        console.error("Fake call error:", err.detail);
        return;
      }

      console.log("Got audio response, converting..."); //test
      const arrayBuffer = await response.arrayBuffer();
      console.log("ArrayBuffer size:", arrayBuffer.byteLength);

      // Use Uint8Array and chunk the base64 conversion to avoid btoa limits
      const uint8Array = new Uint8Array(arrayBuffer);
      const chunkSize = 8192;
      let binary = "";
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);
      const uri = `data:audio/mpeg;base64,${base64}`;

      console.log("Base64 length:", base64.length);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      console.log("Loading sound...");
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      console.log("Playing sound...");
      await sound.playAsync();
      console.log("Sound playing!");
    } catch (err) {
      console.error("Error playing audio:", err);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.callerSection}>
          <Text style={styles.callStatus}>
            {callState === "ringing"
              ? "Incoming Call..."
              : callState === "active"
                ? formatTime(elapsed)
                : "Call Ended"}
          </Text>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callerSub}>mobile</Text>

          <View style={styles.avatarContainer}>
            <Animated.View
              style={[
                styles.pulse,
                { transform: [{ scale: pulseAnim }], opacity: 0.2 },
              ]}
            />
            <Animated.View
              style={[
                styles.pulse,
                { transform: [{ scale: pulseAnim2 }], opacity: 0.12 },
              ]}
            />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{callerName[0]}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonSection}>
          {callState === "ringing" ? (
            <View style={styles.ringButtons}>
              <View style={styles.btnWrapper}>
                <TouchableOpacity
                  style={[styles.circleBtn, styles.declineBtn]}
                  onPress={handleDecline}
                >
                  <Text style={styles.btnIcon}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.btnLabel}>Decline</Text>
              </View>
              <View style={styles.btnWrapper}>
                <TouchableOpacity
                  style={[styles.circleBtn, styles.answerBtn]}
                  onPress={handleAnswer}
                >
                  <Text style={styles.btnIcon}>📞</Text>
                </TouchableOpacity>
                <Text style={styles.btnLabel}>Answer</Text>
              </View>
            </View>
          ) : callState === "active" ? (
            <View style={styles.activeButtons}>
              <TouchableOpacity
                style={[styles.circleBtn, styles.declineBtn]}
                onPress={handleEndCall}
              >
                <Text style={styles.btnIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.btnLabel}>End Call</Text>
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 60,
  },
  callerSection: { alignItems: "center", gap: 8 },
  callStatus: {
    color: "#64748b",
    fontSize: 14,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  callerName: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: -1,
  },
  callerSub: { color: "#475569", fontSize: 15, marginBottom: 40 },
  avatarContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#22c55e",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "700" },
  buttonSection: { alignItems: "center" },
  ringButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  activeButtons: { alignItems: "center", gap: 12 },
  btnWrapper: { alignItems: "center", gap: 10 },
  circleBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtn: { backgroundColor: "#ef4444" },
  answerBtn: { backgroundColor: "#22c55e" },
  btnIcon: { fontSize: 26 },
  btnLabel: { color: "#94a3b8", fontSize: 13 },
});
