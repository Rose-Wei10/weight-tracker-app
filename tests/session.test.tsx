import { act, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";
import { AppProvider, useApp } from "../context/AppContext";
let mockAuthCallback: (user: unknown) => void;
const mockAuthStop = jest.fn(),
  mockStops: jest.Mock[] = [],
  mockListeners = new Map<string, (snap: unknown) => void>();
jest.mock("../firebase", () => ({
  auth: {},
  db: {},
  firebaseConfigured: true,
}));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_auth, fn) => {
    mockAuthCallback = fn;
    return mockAuthStop;
  }),
}));
jest.mock("firebase/firestore", () => ({
  doc: jest.fn((...v) => v.slice(1).join("/")),
  collection: jest.fn((...v) => v.slice(1).join("/")),
  onSnapshot: jest.fn((path, fn) => {
    mockListeners.set(path, fn);
    const stop = jest.fn();
    mockStops.push(stop);
    return stop;
  }),
}));
function Reader() {
  const value = useApp();
  return (
    <Text testID="state">
      {JSON.stringify({
        uid: value.user?.uid,
        weights: value.weights,
        ready: value.ready,
      })}
    </Text>
  );
}
test("session changes clear records and unsubscribe all old listeners", async () => {
  const ui = render(
    <AppProvider>
      <Reader />
    </AppProvider>,
  );
  act(() => mockAuthCallback({ uid: "alice" }));
  await waitFor(() =>
    expect(mockListeners.has("users/alice/weights")).toBe(true),
  );
  act(() => {
    mockListeners.get("users/alice/weights")!({
      docs: [{ id: "old", data: () => ({ date: "2026-10-20", weight: 70 }) }],
    });
  });
  expect(ui.getByTestId("state").props.children).toContain("old");
  act(() => mockAuthCallback({ uid: "bob" }));
  await waitFor(() =>
    expect(mockListeners.has("users/bob/weights")).toBe(true),
  );
  expect(ui.getByTestId("state").props.children).not.toContain("old");
  mockStops
    .slice(0, 4)
    .forEach((stop) => expect(stop).toHaveBeenCalledTimes(1));
  act(() => mockAuthCallback(null));
  await waitFor(() =>
    expect(ui.getByTestId("state").props.children).toContain('"weights":[]'),
  );
  ui.unmount();
  expect(mockAuthStop).toHaveBeenCalledTimes(1);
});
test("readiness waits for distinct profile, weight and diary snapshots", async () => {
  mockListeners.clear();
  const ui = render(
    <AppProvider>
      <Reader />
    </AppProvider>,
  );
  act(() => mockAuthCallback({ uid: "alice" }));
  await waitFor(() =>
    expect(mockListeners.has("users/alice/weights")).toBe(true),
  );
  act(() => {
    for (let i = 0; i < 3; i++)
      mockListeners.get("users/alice/weights")!({ docs: [] });
  });
  expect(ui.getByTestId("state").props.children).toContain('"ready":false');
  act(() => {
    mockListeners.get("users/alice")!({ data: () => ({}) });
    mockListeners.get("users/alice/foods")!({ docs: [] });
  });
  expect(ui.getByTestId("state").props.children).toContain('"ready":true');
  ui.unmount();
});
