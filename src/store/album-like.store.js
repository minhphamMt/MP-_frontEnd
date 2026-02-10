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

  loadLikedAlbums: async () => {
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

      set({ likedAlbumIds: ids });
    } catch (err) {
      console.error("Load liked albums error", err);
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

    const { likedAlbumIds } = get();
    const isLiked = likedAlbumIds.includes(targetId);

    set({
      likedAlbumIds: isLiked
        ? likedAlbumIds.filter((id) => id !== targetId)
        : [...likedAlbumIds, targetId],
    });

    try {
      if (isLiked) {
        await unlikeAlbum(targetId);
      } else {
        await likeAlbum(targetId);
      }
    } catch (err) {
      console.error("Toggle album like error", err);
      set({ likedAlbumIds });
    }
  },
}));

export default useAlbumLikeStore;