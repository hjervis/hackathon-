import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/components/auth/auth-context";

export default function Settings() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  button: { backgroundColor: "#111", padding: 14, borderRadius: 10 },
  buttonText: { color: "#fff", fontWeight: "600" },
});