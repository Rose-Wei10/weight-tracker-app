import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import {
  defineSecret,
  defineString,
  defineBoolean,
} from "firebase-functions/params";
import { aiRequestSchema } from "../../shared/schemas";
import { callProvider } from "./provider";
import { reserveUsage, unsafeRequest, safetyAnswer } from "./policy";
initializeApp();
const db = getFirestore(),
  key = defineSecret("OPENROUTER_API_KEY");
const model = defineString("AI_MODEL", { default: "" });
const enabled = defineBoolean("AI_ENABLED", { default: false });
const options = {
  region: "us-central1",
  maxInstances: 2,
  timeoutSeconds: 40,
  memory: "256MiB" as const,
};
export const nutritionAI = onCall(
  {
    ...options,
    secrets: [key],
    enforceAppCheck: process.env.FUNCTIONS_EMULATOR !== "true",
  },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "Sign in required");
    if (!enabled.value() || !model.value())
      throw new HttpsError("failed-precondition", "AI not configured");
    if (
      !request.auth.token.email_verified &&
      process.env.FUNCTIONS_EMULATOR !== "true"
    )
      throw new HttpsError("failed-precondition", "Verify your email first");
    const parsed = aiRequestSchema.safeParse(request.data);
    if (!parsed.success)
      throw new HttpsError("invalid-argument", "Invalid request");
    const input = parsed.data,
      uid = request.auth.uid;
    await db.runTransaction(async (tx) => {
      const quotaRef = db.doc(`_aiQuota/${uid}`),
        globalRef = db.doc("_aiBudget/daily"),
        userRef = db.doc(`users/${uid}`);
      const [user, quota, budget] = await Promise.all([
        tx.get(userRef),
        tx.get(quotaRef),
        tx.get(globalRef),
      ]);
      if (user.get("deleting"))
        throw new HttpsError(
          "failed-precondition",
          "Account deletion in progress",
        );
      if (user.get("aiConsent") !== true)
        throw new HttpsError("permission-denied", "Consent required");
      let reserved;
      try {
        reserved = reserveUsage(quota.data() || {}, Date.now());
      } catch {
        throw new HttpsError(
          "resource-exhausted",
          "Daily or minute limit reached",
        );
      }
      const day = new Date().toISOString().slice(0, 10),
        total = budget.get("day") === day ? budget.get("count") || 0 : 0;
      if (total >= 200)
        throw new HttpsError(
          "resource-exhausted",
          "Global daily limit reached",
        );
      tx.set(quotaRef, reserved);
      tx.set(globalRef, { day, count: total + 1 });
    });
    if (unsafeRequest(input.text)) return safetyAnswer;
    try {
      return await callProvider(input, key.value(), model.value());
    } catch {
      throw new HttpsError(
        "unavailable",
        "AI unavailable. Try manual logging.",
      );
    }
  },
);
export const deleteAccount = onCall(options, async (request) => {
  if (!request.auth)
    throw new HttpsError("unauthenticated", "Sign in required");
  if (request.data?.confirm !== true)
    throw new HttpsError("invalid-argument", "Explicit confirmation required");
  const authTime = Number(request.auth.token.auth_time);
  if (!Number.isFinite(authTime) || Date.now() / 1000 - authTime > 300)
    throw new HttpsError("unauthenticated", "Sign in again");
  const uid = request.auth.uid,
    ref = db.doc(`users/${uid}`);
  // Freeze client writes first. Retrying completes a partial deletion safely.
  await db
    .doc(`_accountBlocks/${uid}`)
    .set({ expiresAt: new Date(Date.now() + 2 * 3600000) });
  await ref.set({ deleting: true }, { merge: true });
  await db.recursiveDelete(ref);
  await db.doc(`_aiQuota/${uid}`).delete();
  await getAuth().deleteUser(uid);
  return { deleted: true };
});
