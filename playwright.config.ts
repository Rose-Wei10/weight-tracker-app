import { defineConfig } from "@playwright/test";
export default defineConfig({
  timeout: 120000,
  expect: { timeout: 15000 },
  testDir: "./tests/e2e",
  workers: 1,
  use: {
    timezoneId: "America/Los_Angeles",
    baseURL: "http://127.0.0.1:8081",
    viewport: { width: 390, height: 844 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx expo start --web --port 8081",
    url: "http://127.0.0.1:8081",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      EXPO_PUBLIC_FIREBASE_API_KEY: "demo-not-a-secret",
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: "demo-weight-tracker",
      EXPO_PUBLIC_FIREBASE_APP_ID: "demo-app",
      EXPO_PUBLIC_USE_EMULATORS: "true",
      EXPO_PUBLIC_EMULATOR_HOST: "127.0.0.1",
    },
  },
});
