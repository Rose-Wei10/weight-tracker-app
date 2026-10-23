import { saveFoods, saveWeight } from "../services/records";
import { auth } from "../firebase";
import { runTransaction, writeBatch } from "firebase/firestore";
jest.mock("../firebase", () => ({
  auth: { currentUser: { uid: "alice" } },
  db: {},
}));
const mockSet = jest.fn(),
  mockCommit = jest.fn(async () => {}),
  mockGet = jest.fn(async () => ({ exists: () => false }));
jest.mock("firebase/firestore", () => ({
  collection: jest.fn((...parts) => parts.slice(1).join("/")),
  doc: jest.fn((...parts) => ({
    id: parts.at(-1),
    path: parts.slice(1).join("/"),
  })),
  serverTimestamp: () => "server-time",
  writeBatch: jest.fn(() => ({ set: mockSet, commit: mockCommit })),
  runTransaction: jest.fn(async (_db, callback) =>
    callback({ get: mockGet, set: mockSet }),
  ),
}));
beforeEach(() => {
  jest.clearAllMocks();
  (auth as unknown as { currentUser: unknown }).currentUser = { uid: "alice" };
  mockGet.mockResolvedValue({ exists: () => false });
});
test("unauthenticated food write is blocked before batch creation", async () => {
  (auth as unknown as { currentUser: unknown }).currentUser = null;
  await expect(
    saveFoods([
      {
        name: "Egg",
        date: "2026-10-21",
        meal: "snack",
        source: "manual",
        calories: 72,
        protein: 6,
        carbs: 0,
        fat: 5,
        quantity: 1,
      },
    ]),
  ).rejects.toThrow("Sign in required");
  expect(writeBatch).not.toHaveBeenCalled();
});
test("all foods validated before any database writes", async () => {
  await expect(
    saveFoods([
      {
        name: "Egg",
        date: "2026-10-21",
        meal: "snack",
        source: "manual",
        calories: -1,
        protein: 6,
        carbs: 0,
        fat: 5,
        quantity: 1,
      },
    ]),
  ).rejects.toThrow();
  expect(mockCommit).not.toHaveBeenCalled();
});
test("weight transaction only addresses current user records", async () => {
  await saveWeight({ weight: 70, date: "2026-10-20" });
  expect(runTransaction).toHaveBeenCalled();
  expect(mockSet.mock.calls.map((call) => call[0].path)).toEqual([
    "users/alice/weightDays/2026-10-20",
    "users/alice/weights/2026-10-20",
  ]);
});
test("concurrent date claim rejects duplicate", async () => {
  mockGet.mockResolvedValue({
    exists: () => true,
    data: () => ({ entryId: "other" }),
  } as never);
  await expect(
    saveWeight({ weight: 70, date: "2026-10-20" }),
  ).rejects.toMatchObject({ code: "already-exists" });
  expect(mockSet).not.toHaveBeenCalled();
});
