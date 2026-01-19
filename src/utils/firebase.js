import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { firebaseLoginApi } from "../api/auth.api";
import useAuthStore from "../store/auth.store";

// ===== Firebase config từ ENV =====
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ===== Guard: env phải tồn tại =====
if (!firebaseConfig.apiKey) {
  throw new Error(
    "Firebase env chưa được cấu hình. Kiểm tra VITE_FIREBASE_*"
  );
}

// ===== Init app (tránh init nhiều lần) =====
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ===== Auth =====
export const auth = getAuth(app);

// ===== Google Login =====
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();
  return { user: result.user, idToken };
}
