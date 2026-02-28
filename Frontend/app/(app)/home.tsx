// app/(app)/home.tsx
import { View, Text, StyleSheet } from 'react-native';
export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You&apos;re logged in! 🎉</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: '600' },
});