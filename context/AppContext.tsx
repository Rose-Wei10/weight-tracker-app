import { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";
import { onAuthStateChanged, type User } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { auth, db, firebaseConfigured } from "../firebase";
import {
  foodSchema,
  weightSchema,
  type Food,
  type Weight,
  type Settings,
  type FoodInput,
} from "../shared/schemas";
import { localDate } from "../shared/metrics";
import { friendlyError } from "../services/errors";

type AppData = {
  user: User | null;
  authReady: boolean;
  ready: boolean;
  weights: Weight[];
  foods: Food[];
  templates: (FoodInput & { id: string })[];
  settings: Settings;
  today: string;
  error: string;
  retry: () => void;
};
const AppContext = createContext<AppData>({
  user: null,
  authReady: false,
  ready: false,
  weights: [],
  foods: [],
  templates: [],
  settings: {},
  today: localDate(),
  error: "",
  retry: () => {},
});
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [authReady, setAuthReady] = useState(!firebaseConfigured);
  const [weights, setWeights] = useState<Weight[]>([]),
    [foods, setFoods] = useState<Food[]>([]),
    [templates, setTemplates] = useState<(FoodInput & { id: string })[]>([]),
    [settings, setSettings] = useState<Settings>({});
  const [dataOwner, setDataOwner] = useState<string | null>(null);
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [today, setToday] = useState(localDate());
  useEffect(() => {
    if (!firebaseConfigured) return;
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);
  useEffect(() => {
    const refresh = () => setToday(localDate());
    const timer = setInterval(refresh, 30000);
    const subscription = AppState.addEventListener("change", refresh);
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    setWeights([]);
    setFoods([]);
    setTemplates([]);
    setSettings({});
    setReady(false);
    setError("");
    setDataOwner(user?.uid || null);
    if (!user) return;
    const received = new Set<string>();
    const loaded = (key: string) => {
      received.add(key);
      if (received.size >= 3) setReady(true);
    };
    const fail = (e: unknown) => setError(friendlyError(e));
    const unsubscribe = [
      onSnapshot(
        doc(db, "users", user.uid),
        (snap) => {
          const data = snap.data() || {};
          setSettings({ ...data, goal: data.goal ?? data.goalWeight });
          loaded("settings");
        },
        fail,
      ),
      onSnapshot(
        collection(db, "users", user.uid, "weights"),
        (snap) => {
          let invalid = false;
          const entries: Weight[] = [];
          snap.docs.forEach((d) => {
            const parsed = weightSchema.safeParse(d.data());
            if (parsed.success) entries.push({ ...parsed.data, id: d.id });
            else invalid = true;
          });
          setWeights(entries);
          if (invalid)
            setError(
              "Some legacy weight records need review. They remain stored unchanged.",
            );
          loaded("weights");
        },
        fail,
      ),
      onSnapshot(
        collection(db, "users", user.uid, "foods"),
        (snap) => {
          let invalid = false;
          const entries: Food[] = [];
          snap.docs.forEach((d) => {
            const raw = d.data();
            const parsed = foodSchema.safeParse({
              protein: 0,
              carbs: 0,
              fat: 0,
              quantity: 1,
              meal: "snack",
              source: "manual",
              ...raw,
            });
            if (parsed.success)
              entries.push({
                ...parsed.data,
                id: d.id,
                macrosKnown: ["protein", "carbs", "fat"].every(
                  (k) => typeof raw[k] === "number",
                ),
              });
            else invalid = true;
          });
          setFoods(entries);
          if (invalid)
            setError(
              "Some legacy food records need review. They remain stored unchanged.",
            );
          loaded("foods");
        },
        fail,
      ),
      onSnapshot(
        collection(db, "users", user.uid, "templates"),
        (snap) =>
          setTemplates(
            snap.docs.flatMap((d) => {
              const parsed = foodSchema.safeParse(d.data());
              return parsed.success ? [{ ...parsed.data, id: d.id }] : [];
            }),
          ),
        fail,
      ),
    ];
    return () => unsubscribe.forEach((fn) => fn());
  }, [user, revision]);
  return (
    <AppContext.Provider
      value={{
        user,
        authReady,
        ready: ready && dataOwner === user?.uid,
        weights: dataOwner === user?.uid ? weights : [],
        foods: dataOwner === user?.uid ? foods : [],
        templates: dataOwner === user?.uid ? templates : [],
        settings: dataOwner === user?.uid ? settings : {},
        today,
        error,
        retry: () => setRevision((n) => n + 1),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);
