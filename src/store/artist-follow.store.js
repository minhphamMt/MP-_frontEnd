import { create } from "zustand";
import {
  followArtist as followArtistApi,
  unfollowArtist as unfollowArtistApi,
  getFollowedArtists,
} from "../api/artist.api";

const normalizeArtistId = (artist) => {
  const rawId =
    artist?.id ??
    artist?.artist_id ??
    artist?.artistId ??
    artist?.artist?.id ??
    artist;

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const normalizeFollowedArtist = (artist) => ({
  id: artist?.id ?? artist?.artist_id ?? artist?.artistId,
  name: artist?.name ?? artist?.artist_name ?? artist?.alias ?? "Nghệ sĩ",
  alias: artist?.alias,
  short_bio: artist?.short_bio,
  avatar_url: artist?.avatar_url,
  cover_url: artist?.cover_url ?? artist?.avatar_url ?? artist?.cover,
  national: artist?.national,
  follow_count: artist?.follow_count,
  song_count: artist?.song_count,
  followed_at: artist?.followed_at,
});

const useArtistFollowStore = create((set, get) => ({
  followedArtists: [],
  followedArtistIds: [],
  loading: false,
  hasLoaded: false,
  pendingIds: [],

  loadFollowedArtists: async () => {
    if (get().loading) return;
    set({ loading: true });

    try {
      const res = await getFollowedArtists();
      const raw = res?.data?.data ?? res?.data ?? [];
      const normalized = (raw || []).map(normalizeFollowedArtist);
      const ids = normalized
        .map((artist) => normalizeArtistId(artist))
        .filter(Boolean);

      set({
        followedArtists: normalized,
        followedArtistIds: ids,
        loading: false,
        hasLoaded: true,
      });
    } catch (error) {
      console.error("Load followed artists failed", error);
      set({
        followedArtists: [],
        followedArtistIds: [],
        loading: false,
        hasLoaded: true,
      });
    }
  },

  ensureLoaded: async () => {
    if (!get().hasLoaded && !get().loading) {
      await get().loadFollowedArtists();
    }
  },

  clearFollowedArtists: () =>
    set({
      followedArtists: [],
      followedArtistIds: [],
      hasLoaded: false,
    }),

  isFollowing: (artistId) => {
    const id = normalizeArtistId(artistId);
    if (!id) return false;
    return get().followedArtistIds.includes(id);
  },

  followArtist: async (artist) => {
    const id = normalizeArtistId(artist);
    if (!id) return false;

    if (get().pendingIds.includes(id)) return get().isFollowing(id);

    const previous = {
      followedArtists: get().followedArtists,
      followedArtistIds: get().followedArtistIds,
    };

    const normalized = normalizeFollowedArtist(artist);
    set((state) => ({
      followedArtists: state.followedArtists.some(
        (item) => normalizeArtistId(item) === id
      )
        ? state.followedArtists
        : [normalized, ...state.followedArtists],
      followedArtistIds: state.followedArtistIds.includes(id)
        ? state.followedArtistIds
        : [id, ...state.followedArtistIds],
      pendingIds: [...state.pendingIds, id],
    }));

    try {
      await followArtistApi(id);
      return true;
    } catch (error) {
      console.error("Follow artist failed", error);
      set({
        followedArtists: previous.followedArtists,
        followedArtistIds: previous.followedArtistIds,
      });
      return false;
    } finally {
      set((state) => ({
        pendingIds: state.pendingIds.filter((item) => item !== id),
      }));
    }
  },

  unfollowArtist: async (artistId) => {
    const id = normalizeArtistId(artistId);
    if (!id) return false;

    if (get().pendingIds.includes(id)) return get().isFollowing(id);

    const previous = {
      followedArtists: get().followedArtists,
      followedArtistIds: get().followedArtistIds,
    };

    set((state) => ({
      followedArtists: state.followedArtists.filter(
        (item) => normalizeArtistId(item) !== id
      ),
      followedArtistIds: state.followedArtistIds.filter((item) => item !== id),
      pendingIds: [...state.pendingIds, id],
    }));

    try {
      await unfollowArtistApi(id);
      return false;
    } catch (error) {
      console.error("Unfollow artist failed", error);
      set({
        followedArtists: previous.followedArtists,
        followedArtistIds: previous.followedArtistIds,
      });
      return true;
    } finally {
      set((state) => ({
        pendingIds: state.pendingIds.filter((item) => item !== id),
      }));
    }
  },

  toggleFollow: async (artist) => {
    const id = normalizeArtistId(artist);
    if (!id) return false;
    if (get().isFollowing(id)) {
      return get().unfollowArtist(id);
    }
    return get().followArtist(artist);
  },
}));

export default useArtistFollowStore;