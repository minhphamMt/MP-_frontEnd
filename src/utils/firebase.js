import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// ===== Firebase config từ ENV =====
const firebaseConfig = {
  apiKey: "AIzaSyCNhLWahRkbPS1s2A2M_GZnd0oesA7R1GA",
  authDomain: "khoaluantotnghiep-bc862.firebaseapp.com",
  projectId: "khoaluantotnghiep-bc862",
  storageBucket: "khoaluantotnghiep-bc862.firebasestorage.app",
  messagingSenderId: "514446947158",
  appId: "1:514446947158:web:581fb92ce4943a7e539cf7",
  measurementId: "G-EJ18PMP8F4"
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
