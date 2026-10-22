import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "../context/AppContext";
import { LanguageProvider } from "../context/LanguageContext";
import { firebaseConfigured } from "../firebase";
import { Card, Copy, Screen } from "../components/Wellness";
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <LanguageProvider>
          <StatusBar style="auto" />
          {firebaseConfigured ? (
            <Stack screenOptions={{ headerShown: false }} />
          ) : (
            <Screen title="Welcome to Forma" eyebrow="SETUP REQUIRED">
              <Card>
                <Copy>
                  Add your Firebase web configuration to .env using
                  .env.example, then restart Expo. No provider secret belongs in
                  the mobile app.
                </Copy>
                <Copy kind="muted">
                  See docs/DEPLOYMENT.md for local emulators and secure AI
                  setup.
                </Copy>
              </Card>
            </Screen>
          )}
        </LanguageProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
