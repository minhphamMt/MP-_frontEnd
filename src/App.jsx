import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/auth.store";
import usePlayerStore from "./store/player.store";

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const isAuthReady = useAuthStore((s) => s.isAuthReady);
  const isAuthenticated = useAuthStore(
    (s) => s.isAuthenticated
  );

  const loadLikedSongs = usePlayerStore(
    (s) => s.loadLikedSongs
  );
  const loadLastPlayed = usePlayerStore(
    (s) => s.loadLastPlayed
  );

  /* =====================
     1️⃣ BOOTSTRAP AUTH
     ===================== */
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /* =====================
     2️⃣ LOAD LIKED SONGS
     (CHỈ KHI AUTH THỰC SỰ SẴN SÀNG)
     ===================== */
  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      loadLikedSongs(); // 🔥 GỌI ĐÚNG API BACKEND MÀY CODE
      loadLastPlayed();
    }
  }, [isAuthReady, isAuthenticated, loadLikedSongs, loadLastPlayed]);

  return (
    <>
      <AppRoutes />
    </>
  );
}