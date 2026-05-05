import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8qP7Ejauyj3AMxoBLl65z4Gc7uvbuCyA",
  authDomain: "weight-tracker-2e360.firebaseapp.com",
  projectId: "weight-tracker-2e360",
  storageBucket: "weight-tracker-2e360.firebasestorage.app",
  messagingSenderId: "214944281934",
  appId: "1:214944281934:web:3b28978ba8d6ac45fc9a1f",
  measurementId: "G-2HGBWJZN43"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// ✅ SAFE AUTH INIT
let auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { auth };
