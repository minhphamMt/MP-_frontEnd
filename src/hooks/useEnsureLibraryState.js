import { useEffect } from "react";
import useAuthStore from "../store/auth.store";
import useAlbumLikeStore from "../store/album-like.store";
import usePlayerStore from "../store/player.store";

export function useEnsureLikedSongsLoaded(enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ensureLikedSongsLoaded = usePlayerStore(
    (state) => state.ensureLikedSongsLoaded
  );

  useEffect(() => {
    if (enabled && isAuthenticated) {
      ensureLikedSongsLoaded();
    }
  }, [enabled, ensureLikedSongsLoaded, isAuthenticated]);
}

export function useEnsureLikedAlbumsLoaded(enabled = true) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const ensureLikedAlbumsLoaded = useAlbumLikeStore(
    (state) => state.ensureLikedAlbumsLoaded
  );

  useEffect(() => {
    if (enabled && isAuthenticated) {
      ensureLikedAlbumsLoaded();
    }
  }, [enabled, ensureLikedAlbumsLoaded, isAuthenticated]);
}
