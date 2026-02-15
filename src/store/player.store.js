import { create } from "zustand";
import api from "../api/axios";
import { getMyHistory } from "../api/history.api";
import { getLikedSongs } from "../api/like.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById, recordSongPlay } from "../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../utils/song";
import useAuthStore from "./auth.store";
import { emitAuthRequired } from "../utils/authPrompt";

/* =====================
   HELPERS
===================== */
export const normalizeSongId = (song) => {
  const rawId =
    song?.id ??
    song?._id ??
    song?.song_id ??
    song?.songId ??
    song?.song?._id ??
    song?.song?.id ??
    song;

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const extractSongsFromResponse = (payload) => {
  const sources = [
    payload?.data,
    payload?.data?.data,
    payload?.data?.data?.likedSongs,
    payload?.data?.items,
    payload?.data?.songs,
    payload?.data?.likedSongs,
    payload?.songs,
    payload?.likedSongs,
    payload,
  ];
  return sources.find(Array.isArray) || [];
};

const audio = new Audio();

/* =====================
   STORE
===================== */
const usePlayerStore = create((set, get) => ({
  /* ===== STATE ===== */
  currentSong: null,
  queue: [],
  currentIndex: -1,

  isPlaying: false,
  repeatMode: "off", // off | all | one
  shuffle: false,
  shuffleHistory: [],

  duration: 0,
  currentTime: 0,
  hasRecordedPlay: false,

  volume: 1,
  muted: false,

  likedSongIds: [],
  recommendationLoading: false,

  /* ===== INTERNAL ===== */
  audio,

  /* =====================
     PLAYER CORE
  ===================== */

  playSong: async (song, queue = []) => {
    const hydratedList = (queue.length ? queue : [song]).map((item) =>
      toPlayableSong(item)
    );

    const targetIndex = hydratedList.findIndex(
      (s) => normalizeSongId(s) === normalizeSongId(song)
    );

    let playable = toPlayableSong(song);
    if (!playable.audio_url) {
      const fetched = await fetchPlayableSong(playable, getSongById);
      if (fetched) playable = fetched;
    }
    if (!playable?.audio_url) return;

    const targetId = normalizeSongId(playable);
    const updatedQueue = hydratedList.map((item) => {
      const id = normalizeSongId(item);
      if (id === targetId) return { ...item, ...playable };
      if (!item.audio_url) return toPlayableSong(item);
      return item;
    });

    audio.src = playable.audio_url;
    audio.load();
    audio.play();

    set({
      currentSong: playable,
      queue: updatedQueue,
      currentIndex: targetIndex !== -1 ? targetIndex : 0,
      isPlaying: true,
      currentTime: 0,
      hasRecordedPlay: false,
      shuffleHistory: [],
    });

    if (updatedQueue.length <= 1) {
      get().appendRecommendationsToQueue();
    }
  },

  pause: () => {
    audio.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    audio.play();
    set({ isPlaying: true });
  },

  togglePlay: () => {
    const { isPlaying } = get();
    isPlaying ? get().pause() : get().resume();
  },

  seek: (time) => {
    audio.currentTime = time;
    set({ currentTime: time });
  },

  /* =====================
     SHUFFLE / NEXT / PREV
  ===================== */

  toggleShuffle: () =>
    set((s) => ({ shuffle: !s.shuffle, shuffleHistory: [] })),

  playAt: (index) => {
    const { queue } = get();
    const song = queue[index];
    if (!song) return;
    get().playSong(song, queue);
  },

  playNext: async () => {
    const { queue, currentIndex, repeatMode, shuffle, shuffleHistory } = get();
    if (!queue.length) return;

    let nextIndex = currentIndex;

    if (shuffle) {
      if (queue.length === 1) return;
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === currentIndex);

      set({ shuffleHistory: [...shuffleHistory, currentIndex] });
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeatMode === "all") nextIndex = 0;
      else {
        const appended = await get().appendRecommendationsToQueue();
        if (!appended) return;
        const updatedState = get();
        if (updatedState.queue.length <= updatedState.currentIndex + 1) return;
        get().playSong(
          updatedState.queue[updatedState.currentIndex + 1],
          updatedState.queue
        );
        return;
      }
    }

    get().playSong(queue[nextIndex], queue);
  },

  playPrev: () => {
    const { shuffle, shuffleHistory, currentIndex, queue } = get();

    if (shuffle && shuffleHistory.length) {
      const prevIndex = shuffleHistory[shuffleHistory.length - 1];
      set({ shuffleHistory: shuffleHistory.slice(0, -1) });
      get().playSong(queue[prevIndex], queue);
      return;
    }

    if (currentIndex > 0) {
      get().playSong(queue[currentIndex - 1], queue);
    }
  },

  toggleRepeatMode: () => {
    const order = ["off", "all", "one"];
    const current = get().repeatMode;
    const next = order[(order.indexOf(current) + 1) % order.length];
    audio.loop = next === "one";
    set({ repeatMode: next });
  },

  /* =====================
     VOLUME
  ===================== */

  setVolume: (value) => {
    const volume = Math.min(1, Math.max(0, value));
    audio.volume = volume;
    set({ volume });
  },

  toggleMute: () => {
    audio.muted = !audio.muted;
    set({ muted: audio.muted });
  },

  /* =====================
     QUEUE
  ===================== */

  addToQueue: (songs) => {
    const list = Array.isArray(songs) ? songs : [songs];
    set((state) => {
      const ids = new Set(
        state.queue.map((s) => normalizeSongId(s)).filter(Boolean)
      );
      const newItems = list.filter(
        (s) => !ids.has(normalizeSongId(s))
      );
      return { queue: [...state.queue, ...newItems] };
    });
  },

  removeFromQueue: (index) =>
    set((state) => {
      if (index === state.currentIndex) {
        get().playNext();
      }
      return {
        queue: state.queue.filter((_, i) => i !== index),
      };
    }),

  clearQueue: () =>
    set({
      queue: [],
      currentSong: null,
      currentIndex: -1,
      isPlaying: false,
    }),

    appendRecommendationsToQueue: async () => {
    const { recommendationLoading, currentSong, queue } = get();
    if (recommendationLoading) return false;

    const seedSongId = normalizeSongId(currentSong);
    if (!seedSongId) return false;

    set({ recommendationLoading: true });
    try {
      const res = await getRecommendations(seedSongId);
      const items = res?.data?.data ?? res?.data ?? [];
      const ids = items
        .map((item) => item?.songId ?? item?.song_id ?? item?.id ?? item)
        .filter(Boolean);
      if (!ids.length) return false;

      const existingIds = new Set(
        queue.map((song) => normalizeSongId(song)).filter(Boolean)
      );

      const detailResults = await Promise.all(
        ids.map(async (songId) => {
          if (existingIds.has(String(songId))) return null;
          try {
            const songRes = await getSongById(songId);
            const payload = songRes?.data?.data ?? songRes?.data ?? songRes;
            return toPlayableSong(payload);
          } catch (error) {
            console.error("Load recommended song failed", error);
            return null;
          }
        })
      );

      const newSongs = detailResults.filter(Boolean);
      if (!newSongs.length) return false;

      set((state) => ({
        queue: [...state.queue, ...newSongs],
      }));
      return true;
    } catch (error) {
      console.error("Load recommendations for queue failed", error);
      return false;
    } finally {
      set({ recommendationLoading: false });
    }
  },
  
  resetForAuthChange: () => {
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";

    set({
      currentSong: null,
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
      hasRecordedPlay: false,
      shuffleHistory: [],
      likedSongIds: [],
      recommendationLoading: false,
    });
  },

  /* =====================
     HISTORY
  ===================== */

  recordListeningProgress: (durationSeconds) => {
    const { currentSong, hasRecordedPlay } = get();
    if (hasRecordedPlay) return;

    const duration = Math.floor(durationSeconds ?? audio.currentTime ?? 0);
    const songId = normalizeSongId(currentSong);

    if (!songId || duration < 30) return;

    set({ hasRecordedPlay: true });
    recordSongPlay(songId, duration).catch(() =>
      set({ hasRecordedPlay: false })
    );
  },

  loadLastPlayed: async () => {
    if (get().currentSong) return;

    try {
      const res = await getMyHistory({ limit: 1 });
      const payload = res?.data?.data ?? res?.data ?? {};
      const items = payload?.items ?? payload ?? [];

      let playable = toPlayableSong(items[0]);
      if (!playable?.audio_url) {
        const fetched = await fetchPlayableSong(playable, getSongById);
        if (fetched) playable = fetched;
      }
      if (!playable?.audio_url) return;

      audio.src = playable.audio_url;
      audio.load();

      set({
        currentSong: playable,
        queue: [playable],
        currentIndex: 0,
        isPlaying: false,
        currentTime: 0,
        hasRecordedPlay: false,
      });
    } catch (err) {
      console.error("Load last played song failed", err);
    }
  },

  /* =====================
     LIKE
  ===================== */

  loadLikedSongs: async () => {
    try {
      const res = await getLikedSongs();
      const songs = extractSongsFromResponse(res);
      const ids = [...new Set(songs.map(normalizeSongId).filter(Boolean))];
      set({ likedSongIds: ids });
    } catch (err) {
      console.error("Load liked songs error", err);
    }
  },

  toggleLike: async (songId) => {
    const targetId = normalizeSongId(songId);
    if (!targetId) return;

    if (!useAuthStore.getState().isAuthenticated) {
      emitAuthRequired();
      return;
    }

    const { likedSongIds } = get();
    const isLiked = likedSongIds.includes(targetId);

    set({
      likedSongIds: isLiked
        ? likedSongIds.filter((id) => id !== targetId)
        : [...likedSongIds, targetId],
    });

    try {
      isLiked
        ? await api.delete(`/songs/${targetId}/like`)
        : await api.post(`/songs/${targetId}/like`);
    } catch {
      set({ likedSongIds });
    }
  },
}));

/* =====================
   AUDIO EVENTS
===================== */
audio.addEventListener("loadedmetadata", () => {
  usePlayerStore.setState({ duration: audio.duration || 0 });
});

audio.addEventListener("timeupdate", () => {
  const time = audio.currentTime || 0;
  const state = usePlayerStore.getState();

  if (!state.hasRecordedPlay && time >= 30) {
    state.recordListeningProgress(time);
  }
  usePlayerStore.setState({ currentTime: time });
});

audio.addEventListener("ended", () => {
  const state = usePlayerStore.getState();
  if (state.repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
    return;
  }
  state.playNext();
});

audio.volume = usePlayerStore.getState().volume ?? 1;

export default usePlayerStore;
