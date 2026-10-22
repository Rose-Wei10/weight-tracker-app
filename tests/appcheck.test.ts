import { ensureNativeAppCheck } from "../services/appCheck.native";
import { initializeAppCheck } from "firebase/app-check";
const mockNativeInit = jest.fn(async () => ({})),
  mockConfigure = jest.fn();
const expiry = Math.floor(Date.now() / 1000) + 3600;
const mockToken = `a.${Buffer.from(JSON.stringify({ exp: expiry })).toString("base64url")}.b`;
jest.mock("../firebase", () => ({ app: {} }));
jest.mock("firebase/app-check", () => ({
  CustomProvider: jest.fn((options) => options),
  initializeAppCheck: jest.fn(),
}));
jest.mock("@react-native-firebase/app", () => ({ getApp: () => ({}) }));
jest.mock("@react-native-firebase/app-check", () => ({
  ReactNativeFirebaseAppCheckProvider: jest.fn(() => ({
    configure: mockConfigure,
  })),
  initializeAppCheck: mockNativeInit,
  getToken: jest.fn(async () => ({ token: mockToken })),
}));
afterEach(() => {
  delete process.env.EXPO_PUBLIC_USE_EMULATORS;
  delete process.env.EXPO_PUBLIC_NATIVE_APP_CHECK_ENABLED;
});
test("unconfigured native production requests fail closed", async () => {
  await expect(ensureNativeAppCheck()).rejects.toMatchObject({
    code: "functions/failed-precondition",
  });
  expect(mockNativeInit).not.toHaveBeenCalled();
});
test("explicit development emulator does not load attestation", async () => {
  process.env.EXPO_PUBLIC_USE_EMULATORS = "true";
  await ensureNativeAppCheck();
  expect(mockNativeInit).not.toHaveBeenCalled();
});
test("native tokens bridge to JS SDK with real expiry and production providers", async () => {
  process.env.EXPO_PUBLIC_NATIVE_APP_CHECK_ENABLED = "true";
  await ensureNativeAppCheck();
  expect(mockConfigure).toHaveBeenCalledWith({
    android: { provider: "playIntegrity" },
    apple: { provider: "appAttestWithDeviceCheckFallback" },
  });
  const options = (initializeAppCheck as jest.Mock).mock.calls[0][1];
  expect(await options.provider.getToken()).toEqual({
    token: mockToken,
    expireTimeMillis: expiry * 1000,
  });
  expect(options.isTokenAutoRefreshEnabled).toBe(false);
});
