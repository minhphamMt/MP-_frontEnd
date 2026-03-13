import { create } from "zustand";
import api from "../api/axios";
import { getMyHistory } from "../api/history.api";
import { getLikedSongs } from "../api/like.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById, getSongLyrics, recordSongPlay } from "../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../utils/song";
import { getArtistLabel } from "../utils/artist";
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

const extractLyricsFromResponse = (payload) => {
  const topLevel = payload?.data ?? payload;
  const data = topLevel?.data ?? topLevel;
  const items = data?.items ?? data ?? [];
  return Array.isArray(items) ? items : [];
};

const audio = new Audio();
const lyricRequests = new Map();
let sleepTimerId = null;
let rememberedDockTab = "queue";
const PLAYBACK_RATE_DEFAULT = 1;
const PLAYBACK_RATE_MIN = 0.75;
const PLAYBACK_RATE_MAX = 1.5;

const clampPlaybackRate = (value) =>
  Math.min(PLAYBACK_RATE_MAX, Math.max(PLAYBACK_RATE_MIN, Number(value) || PLAYBACK_RATE_DEFAULT));

const PLAYER_DOCK_TABS = new Set(["queue", "lyrics"]);
const getConfiguredPlaybackRate = () => PLAYBACK_RATE_DEFAULT;
const getRememberedDockTab = () => rememberedDockTab;
const getAutoOpenDockTab = () => null;

const rememberDockTab = (tab) => {
  if (!PLAYER_DOCK_TABS.has(tab)) return;
  rememberedDockTab = tab;
};

const resolveMediaArtwork = (song) => {
  const artwork = song?.cover_url;
  if (!artwork) return [];

  return [
    { src: artwork, sizes: "96x96", type: "image/png" },
    { src: artwork, sizes: "128x128", type: "image/png" },
    { src: artwork, sizes: "192x192", type: "image/png" },
    { src: artwork, sizes: "256x256", type: "image/png" },
    { src: artwork, sizes: "384x384", type: "image/png" },
    { src: artwork, sizes: "512x512", type: "image/png" },
  ];
};

const setupMediaSession = () => {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  const mediaSession = navigator.mediaSession;
  const safeSetActionHandler = (action, handler) => {
    try {
      mediaSession.setActionHandler(action, handler);
    } catch (error) {
      // Ignore unsupported actions.
    }
  };

  const play = () => usePlayerStore.getState().resume();
  const pause = () => usePlayerStore.getState().pause();
  const playNext = () => usePlayerStore.getState().playNext();
  const playPrev = () => usePlayerStore.getState().playPrev();
  const seekTo = (details) => {
    const rawTime = Number(details?.seekTime);
    if (!Number.isFinite(rawTime)) return;

    const boundedTime = Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.min(Math.max(rawTime, 0), audio.duration)
      : Math.max(rawTime, 0);

    if (details?.fastSeek && typeof audio.fastSeek === "function") {
      audio.fastSeek(boundedTime);
    } else {
      audio.currentTime = boundedTime;
    }

    usePlayerStore.setState({ currentTime: boundedTime });
  };

  safeSetActionHandler("play", play);
  safeSetActionHandler("pause", pause);
  safeSetActionHandler("nexttrack", playNext);
  safeSetActionHandler("previoustrack", playPrev);
  safeSetActionHandler("seekto", seekTo);
  // Clear seek handlers so iOS lock screen/external controls keep skip-track icons.
  safeSetActionHandler("seekbackward", null);
  safeSetActionHandler("seekforward", null);
};

const syncMediaSession = () => {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) {
    return;
  }

  const mediaSession = navigator.mediaSession;
  const { currentSong, isPlaying } = usePlayerStore.getState();

  mediaSession.playbackState = isPlaying ? "playing" : "paused";

  if (currentSong) {
    mediaSession.metadata = new MediaMetadata({
      title: currentSong.title || "Không rõ",
      artist: getArtistLabel(currentSong, "Unknown Artist"),
      album: currentSong.album_title || "",
      artwork: resolveMediaArtwork(currentSong),
    });
  }

  if (typeof mediaSession.setPositionState === "function" && Number.isFinite(audio.duration) && audio.duration > 0) {
    mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate || 1,
      position: Math.min(audio.currentTime || 0, audio.duration),
    });
  }
};

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
  playbackRate: getConfiguredPlaybackRate(),
  sleepTimerEndsAt: null,
  sleepTimerMinutes: 0,

  likedSongIds: [],
  likedSongsLoading: false,
  likedSongsLoaded: false,
  lastPlayedLoading: false,
  lastPlayedLoaded: false,
  recommendationLoading: false,
  dockPanelOpen: false,
  dockPanelTab: getRememberedDockTab(),
  lyricsBySongId: {},
  lyricsLoadingBySongId: {},
  lyricsErrorBySongId: {},

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

    const { playbackRate } = get();
    audio.src = playable.audio_url;
    audio.playbackRate = playbackRate;
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
      lastPlayedLoading: false,
      lastPlayedLoaded: true,
    });

    const autoOpenDockTab = getAutoOpenDockTab();
    if (
      autoOpenDockTab &&
      typeof window !== "undefined" &&
      window.innerWidth >= 1024
    ) {
      rememberDockTab(autoOpenDockTab);
      set({
        dockPanelOpen: true,
        dockPanelTab: autoOpenDockTab,
      });
    }

    get().preloadLyricsForSong(playable);

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

  setPlaybackRate: (value) => {
    const playbackRate = clampPlaybackRate(value);
    audio.playbackRate = playbackRate;
    set({ playbackRate });
    syncMediaSession();
  },

  cyclePlaybackRate: () => {
    const order = [0.75, 1, 1.25, 1.5];
    const current = clampPlaybackRate(get().playbackRate);
    const currentIndex = order.findIndex((item) => item === current);
    const nextRate = order[(currentIndex + 1) % order.length];
    get().setPlaybackRate(nextRate);
  },

  clearSleepTimer: () => {
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      sleepTimerId = null;
    }
    set({
      sleepTimerEndsAt: null,
      sleepTimerMinutes: 0,
    });
  },

  setSleepTimer: (minutes) => {
    const nextMinutes = Math.max(0, Number(minutes) || 0);
    get().clearSleepTimer();

    if (!nextMinutes) return;

    const sleepTimerEndsAt = Date.now() + nextMinutes * 60 * 1000;
    sleepTimerId = setTimeout(() => {
      const { pause } = get();
      pause();
      get().clearSleepTimer();
    }, nextMinutes * 60 * 1000);

    set({
      sleepTimerEndsAt,
      sleepTimerMinutes: nextMinutes,
    });
  },

  openDockPanel: (tab = getRememberedDockTab()) => {
    const nextTab = PLAYER_DOCK_TABS.has(tab) ? tab : getRememberedDockTab();
    rememberDockTab(nextTab);
    set({
      dockPanelOpen: true,
      dockPanelTab: nextTab,
    });
  },

  closeDockPanel: () =>
    set({
      dockPanelOpen: false,
    }),

  toggleDockPanel: (tab = getRememberedDockTab()) => {
    const nextTab = PLAYER_DOCK_TABS.has(tab) ? tab : getRememberedDockTab();
    rememberDockTab(nextTab);
    set((state) => ({
      dockPanelOpen: state.dockPanelTab === nextTab ? !state.dockPanelOpen : true,
      dockPanelTab: nextTab,
    }));
  },

  setDockPanelTab: (tab = getRememberedDockTab()) => {
    const nextTab = PLAYER_DOCK_TABS.has(tab) ? tab : getRememberedDockTab();
    rememberDockTab(nextTab);
    set({
      dockPanelTab: nextTab,
      dockPanelOpen: true,
    });
  },

  ensureLyricsLoaded: async (songOrId, { force = false } = {}) => {
    const songId = normalizeSongId(songOrId);
    if (!songId) return [];

    const { lyricsBySongId, lyricsLoadingBySongId } = get();
    const hasCachedLyrics = Object.prototype.hasOwnProperty.call(
      lyricsBySongId,
      songId
    );

    if (hasCachedLyrics && !force) {
      return lyricsBySongId[songId] ?? [];
    }

    if (lyricRequests.has(songId)) {
      return lyricRequests.get(songId);
    }

    if (!lyricsLoadingBySongId[songId]) {
      set((state) => ({
        lyricsLoadingBySongId: {
          ...state.lyricsLoadingBySongId,
          [songId]: true,
        },
        lyricsErrorBySongId: {
          ...state.lyricsErrorBySongId,
          [songId]: null,
        },
      }));
    }

    const request = getSongLyrics(songId)
      .then((response) => {
        const items = extractLyricsFromResponse(response);

        set((state) => ({
          lyricsBySongId: {
            ...state.lyricsBySongId,
            [songId]: items,
          },
          lyricsLoadingBySongId: {
            ...state.lyricsLoadingBySongId,
            [songId]: false,
          },
          lyricsErrorBySongId: {
            ...state.lyricsErrorBySongId,
            [songId]: null,
          },
        }));

        return items;
      })
      .catch((error) => {
        console.error("Load song lyrics failed", error);

        set((state) => ({
          lyricsLoadingBySongId: {
            ...state.lyricsLoadingBySongId,
            [songId]: false,
          },
          lyricsErrorBySongId: {
            ...state.lyricsErrorBySongId,
            [songId]: "Kh\u00f4ng th\u1ec3 t\u1ea3i l\u1eddi b\u00e0i h\u00e1t",
          },
        }));

        return [];
      })
      .finally(() => {
        lyricRequests.delete(songId);
      });

    lyricRequests.set(songId, request);
    return request;
  },

  preloadLyricsForSong: (songOrId) => {
    const songId = normalizeSongId(songOrId);
    if (!songId) return;

    const { lyricsBySongId, lyricsLoadingBySongId } = get();
    const hasCachedLyrics = Object.prototype.hasOwnProperty.call(
      lyricsBySongId,
      songId
    );

    if (hasCachedLyrics || lyricsLoadingBySongId[songId]) return;

    void get().ensureLyricsLoaded(songId);
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

  moveQueueItem: (fromIndex, toIndex) =>
    set((state) => {
      const queue = [...state.queue];
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= queue.length ||
        toIndex >= queue.length
      ) {
        return state;
      }

      const [movedItem] = queue.splice(fromIndex, 1);
      queue.splice(toIndex, 0, movedItem);

      let nextCurrentIndex = state.currentIndex;
      if (fromIndex === state.currentIndex) {
        nextCurrentIndex = toIndex;
      } else if (fromIndex < state.currentIndex && toIndex >= state.currentIndex) {
        nextCurrentIndex = Math.max(0, state.currentIndex - 1);
      } else if (fromIndex > state.currentIndex && toIndex <= state.currentIndex) {
        nextCurrentIndex = Math.min(queue.length - 1, state.currentIndex + 1);
      }

      return {
        queue,
        currentIndex: nextCurrentIndex,
      };
    }),

  removeFromQueue: (index) => {
    const state = get();
    if (index < 0 || index >= state.queue.length) return;

    const nextQueue = state.queue.filter((_, itemIndex) => itemIndex !== index);

    if (!nextQueue.length) {
      audio.pause();
      audio.currentTime = 0;
      set({
        queue: [],
        currentSong: null,
        currentIndex: -1,
        isPlaying: false,
        currentTime: 0,
      });
      return;
    }

    if (index === state.currentIndex) {
      const nextIndex = Math.min(index, nextQueue.length - 1);
      const nextSong = nextQueue[nextIndex];
      get().playSong(nextSong, nextQueue);
      return;
    }

    set({
      queue: nextQueue,
      currentIndex: index < state.currentIndex ? state.currentIndex - 1 : state.currentIndex,
    });
  },

  clearQueue: () =>
    {
      get().clearSleepTimer();
      set({
        queue: [],
        currentSong: null,
        currentIndex: -1,
        isPlaying: false,
        dockPanelOpen: false,
        dockPanelTab: getRememberedDockTab(),
      });
    },

    appendRecommendationsToQueue: async () => {
    const { recommendationLoading, currentSong, queue, repeatMode } = get();
    if (recommendationLoading) return false;
    if (repeatMode !== "off") return false;

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
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      sleepTimerId = null;
    }
    audio.pause();
    audio.currentTime = 0;
    audio.src = "";
    audio.playbackRate = getConfiguredPlaybackRate();

    set({
      currentSong: null,
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      duration: 0,
      currentTime: 0,
      hasRecordedPlay: false,
      playbackRate: getConfiguredPlaybackRate(),
      sleepTimerEndsAt: null,
      sleepTimerMinutes: 0,
      shuffleHistory: [],
      likedSongIds: [],
      likedSongsLoading: false,
      likedSongsLoaded: false,
      lastPlayedLoading: false,
      lastPlayedLoaded: false,
      recommendationLoading: false,
      dockPanelOpen: false,
      dockPanelTab: getRememberedDockTab(),
      lyricsBySongId: {},
      lyricsLoadingBySongId: {},
      lyricsErrorBySongId: {},
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

  ensureLastPlayedLoaded: async () => get().loadLastPlayed(),

  loadLastPlayed: async ({ force = false } = {}) => {
    const { isAuthenticated } = useAuthStore.getState();
    const { currentSong, lastPlayedLoading, lastPlayedLoaded } = get();

    if (!isAuthenticated) {
      set({
        lastPlayedLoading: false,
        lastPlayedLoaded: false,
      });
      return null;
    }

    if (currentSong && !force) {
      set({
        lastPlayedLoading: false,
        lastPlayedLoaded: true,
      });
      return currentSong;
    }

    if (lastPlayedLoading) return currentSong;
    if (lastPlayedLoaded && !force) return currentSong;

    set({ lastPlayedLoading: true });

    try {
      const res = await getMyHistory({ limit: 1 });
      const payload = res?.data?.data ?? res?.data ?? {};
      const items = payload?.items ?? payload ?? [];

      if (!items.length) {
        set({
          lastPlayedLoading: false,
          lastPlayedLoaded: true,
        });
        return null;
      }

      let playable = toPlayableSong(items[0]);
      if (!playable?.audio_url) {
        const fetched = await fetchPlayableSong(playable, getSongById);
        if (fetched) playable = fetched;
      }
      if (!playable?.audio_url) {
        set({
          lastPlayedLoading: false,
          lastPlayedLoaded: true,
        });
        return null;
      }

      const { playbackRate } = get();
      audio.src = playable.audio_url;
      audio.playbackRate = playbackRate;
      audio.load();

      set({
        currentSong: playable,
        queue: [playable],
        currentIndex: 0,
        isPlaying: false,
        currentTime: 0,
        hasRecordedPlay: false,
        lastPlayedLoading: false,
        lastPlayedLoaded: true,
      });
      get().preloadLyricsForSong(playable);
      return playable;
    } catch (err) {
      console.error("Load last played song failed", err);
      set({
        lastPlayedLoading: false,
        lastPlayedLoaded: true,
      });
      return null;
    }
  },

  /* =====================
     LIKE
  ===================== */

  setLikedSongIds: (songIds = []) => {
    const ids = [...new Set((songIds || []).map(normalizeSongId).filter(Boolean))];
    set({
      likedSongIds: ids,
      likedSongsLoading: false,
      likedSongsLoaded: true,
    });
  },

  ensureLikedSongsLoaded: async () => get().loadLikedSongs(),

  loadLikedSongs: async ({ force = false } = {}) => {
    const { isAuthenticated } = useAuthStore.getState();
    const { likedSongsLoading, likedSongsLoaded, likedSongIds } = get();

    if (!isAuthenticated) {
      set({
        likedSongIds: [],
        likedSongsLoading: false,
        likedSongsLoaded: false,
      });
      return [];
    }

    if (likedSongsLoading) return likedSongIds;
    if (likedSongsLoaded && !force) return likedSongIds;

    set({ likedSongsLoading: true });
    try {
      const res = await getLikedSongs();
      const songs = extractSongsFromResponse(res);
      const ids = [...new Set(songs.map(normalizeSongId).filter(Boolean))];
      set({
        likedSongIds: ids,
        likedSongsLoading: false,
        likedSongsLoaded: true,
      });
      return ids;
    } catch (err) {
      console.error("Load liked songs error", err);
      set({
        likedSongsLoading: false,
        likedSongsLoaded: likedSongIds.length > 0,
      });
      return likedSongIds;
    }
  },

  toggleLike: async (songId) => {
    const targetId = normalizeSongId(songId);
    if (!targetId) return;

    if (!useAuthStore.getState().isAuthenticated) {
      emitAuthRequired();
      return;
    }

    if (!get().likedSongsLoaded) {
      await get().ensureLikedSongsLoaded();
    }

    const { likedSongIds } = get();
    const isLiked = likedSongIds.includes(targetId);

    set({
      likedSongIds: isLiked
        ? likedSongIds.filter((id) => id !== targetId)
        : [...likedSongIds, targetId],
      likedSongsLoaded: true,
    });

    try {
      isLiked
        ? await api.delete(`/songs/${targetId}/like`)
        : await api.post(`/songs/${targetId}/like`);
    } catch {
      set({ likedSongIds, likedSongsLoaded: true });
    }
  },
}));

/* =====================
   AUDIO EVENTS
===================== */
audio.addEventListener("loadedmetadata", () => {
  usePlayerStore.setState({ duration: audio.duration || 0 });
  syncMediaSession();
});

audio.addEventListener("playing", () => {
  // Re-apply handlers once playback is active so iOS lock screen picks track controls.
  setupMediaSession();
  syncMediaSession();
});

audio.addEventListener("timeupdate", () => {
  const time = audio.currentTime || 0;
  const state = usePlayerStore.getState();

  if (!state.hasRecordedPlay && time >= 30) {
    state.recordListeningProgress(time);
  }
  usePlayerStore.setState({ currentTime: time });
  syncMediaSession();
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
audio.playbackRate = usePlayerStore.getState().playbackRate ?? PLAYBACK_RATE_DEFAULT;

setupMediaSession();

usePlayerStore.subscribe((state, prevState) => {
  if (
    state.currentSong !== prevState.currentSong ||
    state.isPlaying !== prevState.isPlaying
  ) {
    syncMediaSession();
  }
});

export default usePlayerStore;
