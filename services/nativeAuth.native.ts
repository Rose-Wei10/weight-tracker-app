import AsyncStorage from "@react-native-async-storage/async-storage";
import type { FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth } from "firebase/auth";
// Metro selects Firebase's React Native export; its browser declarations omit this API.
// @ts-expect-error Native-only export, verified by native bundle checks.
import { getReactNativePersistence } from "firebase/auth";
export function nativeAuth(app: FirebaseApp) {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if ((error as { code?: string }).code === "auth/already-initialized")
      return getAuth(app);
    throw error;
  }
}
