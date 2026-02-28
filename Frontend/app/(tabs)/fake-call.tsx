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
import { getToken } from "../../api/api";

const API_URL = process.env.EXPO_PUBLIC_IP_ADDRESS;

// Pause between segments to simulates user responding
const RESPONSE_PAUSE_MS = 3000;

type CallState = "ringing" | "active" | "ended";

export default function FakeCallScreen() {
  const [callState, setCallState] = useState<CallState>("ringing");
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const callerName = "Mom";

  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const segmentRef = useRef(0);
  const convIndexRef = useRef(-1);
  const totalSegmentsRef = useRef(0);
  const activeRef = useRef(false); // tracks if call is still active

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;

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
    loop(pulse2Anim, 400);
  };

  const stopAll = () => {
    Vibration.cancel();
    activeRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (soundRef.current) {
      soundRef.current.stopAsync();
      soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const resetCallState = () => {
    segmentRef.current = 0;
    convIndexRef.current = -1;
    totalSegmentsRef.current = 0;
    setElapsed(0);
    setIsPlaying(false);
  };

  const handleAnswer = async () => {
    console.log("handleAnswer called"); // add this
    Vibration.cancel();
    activeRef.current = true;
    setCallState("active");
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    await playSegment(0, -1);
  };

  const handleDecline = () => {
    stopAll();
    router.back();
  };

  const handleEndCall = () => {
    stopAll();
    setCallState("ended");
  };

  const handleCallAgain = () => {
    resetCallState();
    startPulse();
    Vibration.vibrate([0, 400, 200, 400, 1000], true);
    setCallState("ringing");
  };

  const playSegment = async (segment: number, convIndex: number) => {
    console.log("playSegment called", segment, convIndex);
    if (!activeRef.current) return;

    try {
      const token = await getToken();
      console.log("Got token:", !!token);
      setIsPlaying(true);

      const response = await fetch(
        `${API_URL}/fake-call/audio?segment=${segment}&conversation=${convIndex}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        response.headers.get("X-Conversation-Index"),
      );

      // 404 means no more segments — conversation is done
      if (response.status === 404) {
        setIsPlaying(false);
        return;
      }

      if (!response.ok) {
        console.error("Fake call error:", response.status);
        setIsPlaying(false);
        return;
      }

      // Read conversation metadata from response headers
      const returnedConvIndex = parseInt(
        response.headers.get("X-Conversation-Index") || String(convIndex),
      );
      const totalSegments = parseInt(
        response.headers.get("X-Total-Segments") || "0",
      );

      convIndexRef.current = returnedConvIndex;
      totalSegmentsRef.current = totalSegments;

      // Convert audio to base64 URI
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const chunkSize = 8192;
      let binary = "";
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      const base64 = btoa(binary);
      const uri = `data:audio/mpeg;base64,${base64}`;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;

      // When this segment finishes, wait then play next
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
          const nextSegment = segment + 1;
          if (nextSegment < totalSegments && activeRef.current) {
            // Pause to simulate the user responding
            pauseTimerRef.current = setTimeout(() => {
              playSegment(nextSegment, returnedConvIndex);
            }, RESPONSE_PAUSE_MS);
          }
        }
      });

      await sound.playAsync();
    } catch (e) {
      console.error("playSegment error:", e);
      setIsPlaying(false);
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
                { transform: [{ scale: pulse2Anim }], opacity: 0.12 },
              ]}
            />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{callerName[0]}</Text>
            </View>
          </View>

          {callState === "active" && (
            <Text style={styles.statusIndicator}>
              {isPlaying ? "● Speaking..." : "● Listening..."}
            </Text>
          )}
        </View>

        <View style={styles.buttonSection}>
          {callState === "ringing" && (
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
          )}

          {callState === "active" && (
            <View style={styles.activeButtons}>
              <TouchableOpacity
                style={[styles.circleBtn, styles.declineBtn]}
                onPress={handleEndCall}
              >
                <Text style={styles.btnIcon}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.btnLabel}>End Call</Text>
            </View>
          )}

          {callState === "ended" && (
            <View style={styles.endedButtons}>
              <TouchableOpacity
                style={[styles.circleBtn, styles.answerBtn]}
                onPress={handleCallAgain}
              >
                <Text style={styles.btnIcon}>📞</Text>
              </TouchableOpacity>
              <Text style={styles.btnLabel}>Call Again</Text>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
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
  statusIndicator: {
    color: "#22c55e",
    fontSize: 13,
    marginTop: 16,
    letterSpacing: 1,
  },
  buttonSection: { alignItems: "center" },
  ringButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  activeButtons: { alignItems: "center", gap: 12 },
  endedButtons: { alignItems: "center", gap: 16 },
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
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2d2d3e",
    marginTop: 4,
  },
  backButtonText: { color: "#94a3b8", fontSize: 14 },
});
