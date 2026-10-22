import type { FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
export const nativeAuth = (app: FirebaseApp) => getAuth(app);
