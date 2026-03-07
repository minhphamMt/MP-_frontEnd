import { create } from "zustand";
import {
  getLikedAlbums,
  likeAlbum,
  unlikeAlbum,
} from "../api/like.api";
import useAuthStore from "./auth.store";
import { emitAuthRequired } from "../utils/authPrompt";

export const normalizeAlbumId = (album) => {
  const rawId =
    album?.id ??
    album?._id ??
    album?.album_id ??
    album?.albumId ??
    album?.album?._id ??
    album?.album?.id ??
    album;

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const extractAlbumsFromResponse = (payload) => {
  const sources = [
    payload?.data,
    payload?.data?.data,
    payload?.data?.albums,
    payload?.data?.items,
    payload?.albums,
    payload?.items,
    payload,
  ];

  return sources.find(Array.isArray) || [];
};

const useAlbumLikeStore = create((set, get) => ({
  likedAlbumIds: [],
  likedAlbumsLoading: false,
  likedAlbumsLoaded: false,

  resetForAuthChange: () =>
    set({
      likedAlbumIds: [],
      likedAlbumsLoading: false,
      likedAlbumsLoaded: false,
    }),

  setLikedAlbumIds: (albumIds = []) => {
    const ids = [
      ...new Set(
        (albumIds || [])
          .map((album) => normalizeAlbumId(album))
          .filter((id) => id !== null && id !== "")
      ),
    ];

    set({
      likedAlbumIds: ids,
      likedAlbumsLoading: false,
      likedAlbumsLoaded: true,
    });
  },

  ensureLikedAlbumsLoaded: async () => get().loadLikedAlbums(),

  loadLikedAlbums: async ({ force = false } = {}) => {
    const { isAuthenticated } = useAuthStore.getState();
    const { likedAlbumsLoading, likedAlbumsLoaded, likedAlbumIds } = get();

    if (!isAuthenticated) {
      set({
        likedAlbumIds: [],
        likedAlbumsLoading: false,
        likedAlbumsLoaded: false,
      });
      return [];
    }

    if (likedAlbumsLoading) return likedAlbumIds;
    if (likedAlbumsLoaded && !force) return likedAlbumIds;

    set({ likedAlbumsLoading: true });
    try {
      const res = await getLikedAlbums();
      const albums = extractAlbumsFromResponse(res);

      const ids = [
        ...new Set(
          albums
            .map((album) => normalizeAlbumId(album))
            .filter((id) => id !== null && id !== "")
        ),
      ];

      set({
        likedAlbumIds: ids,
        likedAlbumsLoading: false,
        likedAlbumsLoaded: true,
      });
      return ids;
    } catch (err) {
      console.error("Load liked albums error", err);
      set({
        likedAlbumsLoading: false,
        likedAlbumsLoaded: likedAlbumIds.length > 0,
      });
      return likedAlbumIds;
    }
  },

  toggleAlbumLike: async (albumId) => {
    const targetId = normalizeAlbumId(albumId);
    if (!targetId) return;

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      emitAuthRequired();
      return;
    }

    if (!get().likedAlbumsLoaded) {
      await get().ensureLikedAlbumsLoaded();
    }

    const { likedAlbumIds } = get();
    const isLiked = likedAlbumIds.includes(targetId);

    set({
      likedAlbumIds: isLiked
        ? likedAlbumIds.filter((id) => id !== targetId)
        : [...likedAlbumIds, targetId],
      likedAlbumsLoaded: true,
    });

    try {
      if (isLiked) {
        await unlikeAlbum(targetId);
      } else {
        await likeAlbum(targetId);
      }
    } catch (err) {
      console.error("Toggle album like error", err);
      set({ likedAlbumIds, likedAlbumsLoaded: true });
    }
  },
}));

export default useAlbumLikeStore;
