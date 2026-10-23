import { ensureNativeAppCheck } from "./appCheck";
import { httpsCallable } from "firebase/functions";
import { functions } from "../firebase";
import { aiRequestSchema, aiResultSchema } from "../shared/schemas";
export async function requestAI(input: unknown) {
  const value = aiRequestSchema.parse(input);
  await ensureNativeAppCheck();
  const result = await httpsCallable(functions, "nutritionAI", {
    timeout: 35000,
  })(value);
  return aiResultSchema.parse(result.data);
}
