import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// A small wrapper around secure storage that falls back to web-friendly
// APIs when running in a browser.  `expo-secure-store` does not ship a
// web implementation, so calling its methods on the web results in the
// "...setValueWithKeyAsync is not a function" error you were seeing.

const isWeb = Platform.OS === "web";

export async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    // localStorage is synchronous, but we mimic the async API for callers
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// expose the underlying platform flag for callers that need to branch
export const storageIsWeb = isWeb;
