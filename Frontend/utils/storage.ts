import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isWeb = Platform.OS === "web";

/**
 * A small wrapper that provides a unified async storage API.
 *
 * On native platforms we delegate to `expo-secure-store` (the original
 * implementation) and on web we fall back to `@react-native-async-storage`
 * because `expo-secure-store` is a no-op stub there.
 *
 * The original app only ever needs get/set/delete operations for a
 * couple of keys, so the interface here stays very small.
 */

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return AsyncStorage.getItem(key);
  } else {
    return SecureStore.getItemAsync(key);
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    // AsyncStorage always returns a promise that resolves to `null` on
    // success, but we don't care about the result.
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function isAvailable(): Promise<boolean> {
  if (isWeb) return false;
  return await SecureStore.isAvailableAsync();
}
