import React from "react";
import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/auth.store";
import usePlayerStore from "./store/player.store";
import useAlbumLikeStore from "./store/album-like.store";
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
  const loadLikedAlbums = useAlbumLikeStore(
    (s) => s.loadLikedAlbums
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
      loadLikedAlbums();
      loadLastPlayed();
    }
  }, [
    isAuthReady,
    isAuthenticated,
    loadLikedSongs,
    loadLikedAlbums,
    loadLastPlayed,
  ]);

  return (
    <>
      <AppRoutes />
    </>
  );
}