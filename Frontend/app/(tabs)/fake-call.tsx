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

const ELEVEN_LABS_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_KEY;
const VOICE_ID = process.env.EXPO_PUBLIC_ELEVEN_LABS_VOICE_ID;

const SCRIPTS = [
  "Hey! Are you on your way? I'm already here, been waiting for like ten minutes. Everything okay?",
  "Oh good you picked up. Mom wants to know if you're coming to dinner tonight, she's been texting me all day asking.",
  "Dude you need to hear this. I just found out our plans got moved up, we need to leave way earlier than we thought.",
  "Hey it's me. Just calling to check in, you said you'd call when you got there. Where are you right now?",
  "Hey! I'm outside, just pulled up. Are you almost ready? I can wait a few minutes but not too long.",
];

type CallState = "ringing" | "active" | "ended";

export default function FakeCallScreen() {
  const [callState, setCallState] = useState<CallState>("ringing");
  const [elapsed, setElapsed] = useState(0);
  const [callerName] = useState("Mom");
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation for ringing
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulse2Anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startPulse();
    startVibration();
    return () => {
      stopAll();
    };
  }, []);

  const startPulse = () => {
    const loop = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.5,
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

  const startVibration = () => {
    // Vibrate in a ring pattern
    const pattern = [0, 400, 200, 400, 1000];
    Vibration.vibrate(pattern, true);
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
    pulseAnim.stopAnimation();
    pulse2Anim.stopAnimation();
    setCallState("active");

    // Start call timer
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

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
      const script = SCRIPTS[Math.floor(Math.random() * SCRIPTS.length)];

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVEN_LABS_KEY!,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          body: JSON.stringify({
            text: script,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        },
      );

      if (!response.ok) return;

      // Write audio to temp file and play
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        //const fileUri = cacheDirectory + "fakecall.mp3";
        //await writeAsStringAsync(fileUri, base64, {
        //  encoding: EncodingType.Base64,
        //});

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false, // play through speaker
        });

        //const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        //soundRef.current = sound;
        //await sound.playAsync();
      };
    } catch (e) {
      console.error("11Labs error:", e);
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
        {/* Caller info */}
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

          {/* Pulsing avatar */}
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
                { transform: [{ scale: pulse2Anim }], opacity: 0.15 },
              ]}
            />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {callerName[0].toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonSection}>
          {callState === "ringing" ? (
            <View style={styles.ringButtons}>
              {/* Decline */}
              <View style={styles.btnWrapper}>
                <TouchableOpacity
                  style={[styles.circleBtn, styles.declineBtn]}
                  onPress={handleDecline}
                >
                  <Text style={styles.btnIcon}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.btnLabel}>Decline</Text>
              </View>

              {/* Answer */}
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
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 60,
  },
  callerSection: {
    alignItems: "center",
    gap: 8,
  },
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
  callerSub: {
    color: "#475569",
    fontSize: 15,
    marginBottom: 40,
  },
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
  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  buttonSection: {
    alignItems: "center",
  },
  ringButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  activeButtons: {
    alignItems: "center",
    gap: 12,
  },
  btnWrapper: {
    alignItems: "center",
    gap: 10,
  },
  circleBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtn: {
    backgroundColor: "#ef4444",
  },
  answerBtn: {
    backgroundColor: "#22c55e",
  },
  btnIcon: {
    fontSize: 26,
  },
  btnLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },
});
