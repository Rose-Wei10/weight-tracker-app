import { CustomProvider, initializeAppCheck } from "firebase/app-check";
import { jwtDecode } from "jwt-decode";
import { app } from "../firebase";
let pending: Promise<void> | undefined;
export async function ensureNativeAppCheck(): Promise<void> {
  if (__DEV__ && process.env.EXPO_PUBLIC_USE_EMULATORS === "true") return;
  if (process.env.EXPO_PUBLIC_NATIVE_APP_CHECK_ENABLED !== "true")
    throw Object.assign(
      new Error("Configure native App Check in a development build"),
      { code: "functions/failed-precondition" },
    );
  if (!pending)
    pending = (async () => {
      // Load native modules only in configured development/production builds.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nativeApp: typeof import("@react-native-firebase/app") = require("@react-native-firebase/app");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nativeCheck: typeof import("@react-native-firebase/app-check") = require("@react-native-firebase/app-check");
      const provider = new nativeCheck.ReactNativeFirebaseAppCheckProvider();
      provider.configure({
        android: { provider: "playIntegrity" },
        apple: { provider: "appAttestWithDeviceCheckFallback" },
      });
      const check = await nativeCheck.initializeAppCheck(nativeApp.getApp(), {
        provider,
        isTokenAutoRefreshEnabled: false,
      });
      initializeAppCheck(app, {
        isTokenAutoRefreshEnabled: false,
        provider: new CustomProvider({
          getToken: async () => {
            const { token } = await nativeCheck.getToken(check, false);
            const { exp } = jwtDecode<{ exp: number }>(token);
            if (!exp || exp * 1000 <= Date.now())
              throw new Error("Attestation expired");
            return { token, expireTimeMillis: exp * 1000 };
          },
        }),
      });
    })().catch((error) => {
      pending = undefined;
      throw error;
    });
  return pending;
}
