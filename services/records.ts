import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  foodSchema,
  weightSchema,
  profileSchema,
  dateSchema,
  type FoodInput,
  type Profile,
} from "../shared/schemas";
import { localDate } from "../shared/metrics";
function uid() {
  if (!auth.currentUser) throw new Error("Sign in required");
  return auth.currentUser.uid;
}
export const userRef = () => doc(db, "users", uid());
export function recordRef(kind: "weights" | "foods" | "templates", id: string) {
  if (!id || id.includes("/")) throw new Error("Invalid record");
  return doc(db, "users", uid(), kind, id);
}
export async function saveWeight(input: unknown, existingId?: string) {
  const value = weightSchema.parse(input);
  if (value.date > localDate()) throw new Error("Future date");
  const userId = uid();
  const index = doc(db, "users", userId, "weightDays", value.date),
    ref = doc(db, "users", userId, "weights", existingId || value.date);
  await runTransaction(db, async (tx) => {
    const [day, record] = await Promise.all([tx.get(index), tx.get(ref)]);
    if (
      (!existingId && (day.exists() || record.exists())) ||
      (day.exists() && day.data().entryId !== ref.id)
    )
      throw Object.assign(new Error("Duplicate date"), {
        code: "already-exists",
      });
    if (existingId && (!record.exists() || record.data().date !== value.date))
      throw new Error("Record changed");
    tx.set(index, { entryId: ref.id });
    tx.set(ref, { ...value, updatedAt: serverTimestamp() }, { merge: true });
  });
}
export async function deleteWeight(id: string, date: string) {
  const ref = recordRef("weights", id),
    index = doc(db, "users", uid(), "weightDays", dateSchema.parse(date));
  await runTransaction(db, async (tx) => {
    const day = await tx.get(index);
    tx.delete(ref);
    if (day.exists() && day.data().entryId === id) tx.delete(index);
  });
}
export async function saveFoods(inputs: FoodInput[], existingId?: string) {
  if (
    !inputs.length ||
    inputs.length > 20 ||
    (existingId && inputs.length !== 1)
  )
    throw new Error("Invalid batch");
  const values = inputs.map((input) => foodSchema.parse(input));
  const userId = uid();
  const batch = writeBatch(db);
  values.forEach((value) => {
    const ref = existingId
      ? recordRef("foods", existingId)
      : doc(collection(db, "users", userId, "foods"));
    batch.set(ref, { ...value, updatedAt: serverTimestamp() }, { merge: true });
  });
  await batch.commit();
}
export const deleteFood = (id: string) => deleteDoc(recordRef("foods", id));
export async function saveTemplate(input: FoodInput) {
  const value = foodSchema.parse(input);
  await setDoc(doc(collection(db, "users", uid(), "templates")), value);
}
export const deleteTemplate = (id: string) =>
  deleteDoc(recordRef("templates", id));
export async function saveProfile(
  profile: Profile,
  goal: number,
  units: "metric" | "imperial",
) {
  profileSchema.parse(profile);
  weightSchema.shape.weight.parse(goal);
  await setDoc(
    userRef(),
    {
      profile,
      goal: String(goal),
      goalWeight: String(goal),
      units,
      onboardingComplete: true,
    },
    { merge: true },
  );
}
export const saveLanguage = (language: "en" | "zh") =>
  setDoc(userRef(), { language }, { merge: true });
export const saveAIConsent = (aiConsent: boolean) =>
  setDoc(userRef(), { aiConsent }, { merge: true });
