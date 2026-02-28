// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/components/auth/auth-context";
import { useRouter } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { token, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Protect tabs: redirect to sign-in if user is not logged in
  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.replace("/(auth)/sign-in");
      } else {
        setReady(true);
      }
    }
  }, [loading, token]);

  if (!ready) {
    // Show a loading spinner while checking authentication
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Tabs navigator
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "SOS",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sos" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "Contacts",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}