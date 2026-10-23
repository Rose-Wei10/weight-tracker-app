import type { ConfigContext, ExpoConfig } from "expo/config";
export default ({ config }: ConfigContext): ExpoConfig => {
  if (process.env.EXPO_PUBLIC_NATIVE_APP_CHECK_ENABLED !== "true")
    return { ...config, name: config.name!, slug: config.slug! };
  return {
    ...config,
    name: config.name!,
    slug: config.slug!,
    ios: {
      ...config.ios,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_PLIST || "./GoogleService-Info.plist",
    },
    android: {
      ...config.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    plugins: [
      ...(config.plugins || []),
      "expo-build-properties",
      "expo-font",
      "expo-image",
      "expo-sharing",
      "expo-status-bar",
      "@react-native-firebase/app",
      "@react-native-firebase/app-check",
      ["expo-build-properties", { ios: { useFrameworks: "static" } }],
    ],
    
  };
};
