import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/auth.store";
import usePlayerStore from "./store/player.store";
import AudioProvider from "./components/player/AudioProvider";

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);
  const user = useAuthStore((s) => s.user);

  const loadLikedSongs = usePlayerStore(
    (s) => s.loadLikedSongs
  );

  // 1️⃣ Load user (auth)
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // 2️⃣ Khi đã có user → load liked songs
  useEffect(() => {
    if (user) {
      loadLikedSongs();
    }
  }, [user, loadLikedSongs]);

  return (
    <>
      <AudioProvider />
      <AppRoutes />
    </>
  );
}
