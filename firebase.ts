import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { connectAuthEmulator } from "firebase/auth";
import { Platform } from "react-native";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { nativeAuth } from "./services/nativeAuth";

export const firebaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
  process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
);
export const app = getApps().length
  ? getApp()
  : initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "unconfigured",
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId:
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-weight-tracker",
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "unconfigured",
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    });
export const auth = Platform.OS === "web" ? getAuth(app) : nativeAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, "us-central1");
if (
  __DEV__ &&
  process.env.EXPO_PUBLIC_USE_EMULATORS === "true" &&
  !globalThis.__healthEmulators
) {
  const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || "127.0.0.1";
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
  connectFunctionsEmulator(functions, host, 5002);
  globalThis.__healthEmulators = true;
}
declare global {
  var __healthEmulators: boolean | undefined;
}

if (
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY &&
  !globalThis.__healthAppCheck
) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY,
    ),
    isTokenAutoRefreshEnabled: true,
  });
  globalThis.__healthAppCheck = true;
}
declare global {
  var __healthAppCheck: boolean | undefined;
}
