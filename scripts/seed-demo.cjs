if (process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080")
  throw new Error(
    "Demo seeding requires the explicit localhost Firestore emulator.",
  );
const root = process.cwd();
const { initializeApp } = require(root + "/node_modules/firebase/app");
const {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require(root + "/node_modules/firebase/auth");
const {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  writeBatch,
} = require(root + "/node_modules/firebase/firestore");
(async () => {
  const app = initializeApp({
      apiKey: "demo-not-a-secret",
      projectId: "demo-weight-tracker",
      appId: "demo-app",
    }),
    auth = getAuth(app),
    db = getFirestore(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  let credential;
  try {
    credential = await createUserWithEmailAndPassword(
      auth,
      "preview@example.test",
      "Preview-only-2026",
    );
  } catch (e) {
    if (e.code !== "auth/email-already-in-use") throw e;
    credential = await signInWithEmailAndPassword(
      auth,
      "preview@example.test",
      "Preview-only-2026",
    );
  }
  const { user } = credential;
  await setDoc(doc(db, "users", user.uid), {
    language: "en",
    units: "metric",
    goal: "65",
    goalWeight: "65",
    onboardingComplete: true,
    aiConsent: false,
    profile: {
      weight: 70.4,
      height: 172,
      age: 29,
      gender: "female",
      activity: 1.375,
      intent: "maintain",
      target: 2050,
      tdee: 2050,
    },
  });
  const date = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
  );
  let batch = writeBatch(db);
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - 29 + i);
    const key = date(d);
    batch.set(doc(db, "users", user.uid, "weights", key), {
      date: key,
      weight: Math.round((72.1 - i * 0.055 + Math.sin(i) * 0.18) * 10) / 10,
    });
    batch.set(doc(db, "users", user.uid, "weightDays", key), { entryId: key });
  }
  await batch.commit();
  for (const [i, f] of [
    {
      name: "Greek yogurt, berries & oats",
      calories: 360,
      protein: 25,
      carbs: 44,
      fat: 9,
      meal: "breakfast",
    },
    {
      name: "Roasted vegetable & quinoa bowl",
      calories: 520,
      protein: 20,
      carbs: 65,
      fat: 20,
      meal: "lunch",
    },
  ].entries())
    await setDoc(doc(db, "users", user.uid, "foods", "preview-" + i), {
      ...f,
      date: date(now),
      quantity: 1,
      source: "manual",
    });
  console.log("Synthetic emulator preview records created.");
  process.exit(0);
})().catch((e) => {
  console.error(e.code || e.message);
  process.exit(1);
});
