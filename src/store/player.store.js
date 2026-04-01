import { create } from "zustand";
import api from "../api/axios";
import { getMyHistory } from "../api/history.api";
import { getLikedSongs } from "../api/like.api";
import { getRecommendations } from "../api/recommendation.api";
import { getSongById, getSongLyrics, recordSongPlay } from "../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../utils/song";
import { getArtistLabel } from "../utils/artist";
import useAuthStore from "./auth.store";
import usePlaybackSessionStore from "./playback-session.store";
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
audio.preload = "auto";
audio.playsInline = true;
audio.setAttribute("playsinline", "");
audio.setAttribute("webkit-playsinline", "");
const lyricRequests = new Map();
const queueHydrationRequests = new Map();
let sleepTimerId = null;
let rememberedDockTab = "queue";
let lastMediaMetadataKey = "";
let lastMediaPositionStateKey = "";
let shouldResumePlayback = false;
let pendingRestoreTime = null;
let lastPersistedPlaybackKey = "";
const UPCOMING_QUEUE_HYDRATION_LIMIT = 2;
const PLAYBACK_RATE_DEFAULT = 1;
const PLAYBACK_RATE_MIN = 0.75;
const PLAYBACK_RATE_MAX = 1.5;
const GUEST_PREVIEW_LIMIT_SECONDS = 30;
const GUEST_PREVIEW_LIMIT_MESSAGE =
  "Vui lòng đăng nhập để nghe trọn vẹn bài hát sau 30 giây preview.";
let lastGuestPreviewNoticeSongId = "";

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

const getPlaybackSessionOwner = () => {
  const { isAuthenticated, user, role, authContext } = useAuthStore.getState();
  if (!isAuthenticated) return null;

  const identity = user?.id ?? user?._id ?? user?.email ?? null;
  if (!identity) return null;

  return [identity, role || "USER", authContext || "default"].join("|");
};

const clearPersistedPlayback = () => {
  pendingRestoreTime = null;
  lastPersistedPlaybackKey = "";
  usePlaybackSessionStore.getState().clear();
};

const persistPlaybackSnapshot = ({
  song,
  currentTime = 0,
  force = false,
  isPlaying,
} = {}) => {
  const ownerKey = getPlaybackSessionOwner();
  const songId = normalizeSongId(song);

  if (!ownerKey || !songId || !song) {
    clearPersistedPlayback();
    return;
  }

  const normalizedTime = Math.max(0, Math.floor(Number(currentTime) || 0));
  const nextIsPlaying =
    typeof isPlaying === "boolean"
      ? isPlaying
      : Boolean(usePlayerStore.getState()?.isPlaying);
  const nextKey = `${ownerKey}|${songId}|${normalizedTime}|${nextIsPlaying ? 1 : 0}`;

  if (!force && lastPersistedPlaybackKey === nextKey) return;

  lastPersistedPlaybackKey = nextKey;
  usePlaybackSessionStore.getState().setSnapshot({
    ownerKey,
    song: toPlayableSong(song),
    currentTime: normalizedTime,
    isPlaying: nextIsPlaying,
  });
};

const tryApplyPendingRestoreTime = () => {
  if (!(Number.isFinite(pendingRestoreTime) && pendingRestoreTime > 0)) {
    return false;
  }

  const boundedTime =
    Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.min(Math.max(pendingRestoreTime, 0), audio.duration)
      : Math.max(pendingRestoreTime, 0);

  try {
    if (Math.abs((audio.currentTime || 0) - boundedTime) > 0.25) {
      audio.currentTime = boundedTime;
    }
    pendingRestoreTime = null;
    return true;
  } catch {
    return false;
  }
};

const attachAudioToDom = () => {
  if (typeof document === "undefined" || audio.isConnected) return;

  audio.id = "app-background-audio";
  audio.hidden = true;
  audio.setAttribute("aria-hidden", "true");
  audio.setAttribute("tabindex", "-1");
  (document.body || document.documentElement)?.appendChild(audio);
};

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachAudioToDom, {
      once: true,
    });
  } else {
    attachAudioToDom();
  }
}

const syncPlaybackState = () => {
  const isPlaying = Boolean(audio.src) && !audio.paused && !audio.ended;

  if (usePlayerStore.getState().isPlaying !== isPlaying) {
    usePlayerStore.setState({ isPlaying });
  }

  return isPlaying;
};

const attemptPlayback = async () => {
  if (!shouldResumePlayback || !audio.src) {
    syncPlaybackState();
    return false;
  }

  try {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      await playPromise;
    }
  } catch {
    syncPlaybackState();
    return false;
  }

  return syncPlaybackState();
};

const primeAudioSource = (
  src,
  playbackRate,
  { autoplay = false, resetTime = true, startTime = null } = {}
) => {
  shouldResumePlayback = autoplay;
  audio.playbackRate = playbackRate;
  pendingRestoreTime =
    Number.isFinite(startTime) && Number(startTime) > 0
      ? Math.max(Number(startTime), 0)
      : null;

  const nextSource = src || "";
  const currentSource = audio.currentSrc || audio.src || "";
  const sourceChanged = currentSource !== nextSource;

  if (sourceChanged) {
    audio.pause();
    audio.src = nextSource;
  }

  if (pendingRestoreTime !== null) {
    tryApplyPendingRestoreTime();
  } else if (resetTime) {
    try {
      audio.currentTime = 0;
    } catch {
      // Safari can reject seeking before metadata exists for a fresh source.
    }
  }

  if (!autoplay) {
    syncPlaybackState();
    return;
  }

  void attemptPlayback();
};

const retryPendingPlayback = () => {
  tryApplyPendingRestoreTime();

  if (!shouldResumePlayback || !audio.src) {
    syncPlaybackState();
    return;
  }

  if (!audio.paused) {
    shouldResumePlayback = false;
    syncPlaybackState();
    return;
  }

  void attemptPlayback();
};

const getPreviewDurationCap = (song) => {
  const rawDuration = Number(song?.duration || audio.duration || 0);
  if (!Number.isFinite(rawDuration) || rawDuration <= 0) {
    return GUEST_PREVIEW_LIMIT_SECONDS;
  }

  return Math.min(rawDuration, GUEST_PREVIEW_LIMIT_SECONDS);
};

const shouldBlockGuestPreview = (time = audio.currentTime || 0) => {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) return false;

  const { currentSong } = usePlayerStore.getState();
  const songId = normalizeSongId(currentSong);
  if (!songId) return false;

  const totalDuration = Number(currentSong?.duration || audio.duration || 0);
  if (
    Number.isFinite(totalDuration) &&
    totalDuration > 0 &&
    totalDuration <= GUEST_PREVIEW_LIMIT_SECONDS + 0.25
  ) {
    return false;
  }

  return Number(time) >= GUEST_PREVIEW_LIMIT_SECONDS;
};

const blockGuestPreviewPlayback = ({ time = audio.currentTime || 0, forceNotice = false } = {}) => {
  if (!shouldBlockGuestPreview(time)) return false;

  const { currentSong } = usePlayerStore.getState();
  const songId = normalizeSongId(currentSong);
  if (!songId) return false;

  shouldResumePlayback = false;
  const previewCap = getPreviewDurationCap(currentSong);

  try {
    audio.currentTime = previewCap;
  } catch {
    // Ignore browsers that reject seeking while source metadata is unstable.
  }

  audio.pause();
  usePlayerStore.setState({
    isPlaying: false,
    currentTime: previewCap,
  });

  if (forceNotice || lastGuestPreviewNoticeSongId !== songId) {
    lastGuestPreviewNoticeSongId = songId;
    emitAuthRequired(GUEST_PREVIEW_LIMIT_MESSAGE);
  }

  return true;
};

const hydrateQueueSong = async (song) => {
  const songId = normalizeSongId(song);
  if (!songId || song?.audio_url) return song;

  if (queueHydrationRequests.has(songId)) {
    return queueHydrationRequests.get(songId);
  }

  const request = fetchPlayableSong(song, getSongById)
    .then((hydrated) => hydrated || song)
    .finally(() => {
      queueHydrationRequests.delete(songId);
    });

  queueHydrationRequests.set(songId, request);
  return request;
};

const hydrateUpcomingQueueSongs = async (
  startIndex,
  limit = UPCOMING_QUEUE_HYDRATION_LIMIT
) => {
  const { queue } = usePlayerStore.getState();
  if (!Array.isArray(queue) || !queue.length) return;

  const candidates = [];
  for (let offset = 1; offset <= limit; offset += 1) {
    const item = queue[startIndex + offset];
    if (!item) break;
    if (item.audio_url) continue;
    candidates.push(item);
  }

  if (!candidates.length) return;

  const hydratedEntries = await Promise.all(
    candidates.map(async (item) => {
      const hydrated = await hydrateQueueSong(item);
      const songId = normalizeSongId(hydrated);

      if (!songId || !hydrated?.audio_url) return null;
      return [songId, hydrated];
    })
  );

  const hydratedMap = new Map(hydratedEntries.filter(Boolean));
  if (!hydratedMap.size) return;

  usePlayerStore.setState((state) => ({
    queue: state.queue.map((item) => {
      const hydrated = hydratedMap.get(normalizeSongId(item));
      return hydrated ? { ...item, ...hydrated } : item;
    }),
  }));
};

const buildMediaMetadataKey = (song) => {
  if (!song) return "";

  return [
    normalizeSongId(song),
    song.title || "",
    getArtistLabel(song, "Unknown Artist"),
    song.album_title || "",
    song.cover_url || "",
  ].join("|");
};

const resolveMediaArtwork = (song) => {
  const artwork = song?.cover_url;
  if (!artwork) return [];

  return [
    { src: artwork, sizes: "96x96" },
    { src: artwork, sizes: "128x128" },
    { src: artwork, sizes: "192x192" },
    { src: artwork, sizes: "256x256" },
    { src: artwork, sizes: "384x384" },
    { src: artwork, sizes: "512x512" },
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
  const { currentSong } = usePlayerStore.getState();
  const playbackState =
    Boolean(audio.src) && !audio.paused && !audio.ended ? "playing" : "paused";

  mediaSession.playbackState = playbackState;

  if (currentSong) {
    const mediaMetadataKey = buildMediaMetadataKey(currentSong);

    if (mediaMetadataKey !== lastMediaMetadataKey) {
      if (typeof MediaMetadata === "function") {
        mediaSession.metadata = new MediaMetadata({
          title: currentSong.title || "Không rõ",
          artist: getArtistLabel(currentSong, "Unknown Artist"),
          album: currentSong.album_title || "",
          artwork: resolveMediaArtwork(currentSong),
        });
      }
      lastMediaMetadataKey = mediaMetadataKey;
      lastMediaPositionStateKey = "";
    }
  } else if (lastMediaMetadataKey) {
    mediaSession.metadata = null;
    lastMediaMetadataKey = "";
    lastMediaPositionStateKey = "";
  }

  if (
    currentSong &&
    typeof mediaSession.setPositionState === "function" &&
    Number.isFinite(audio.duration) &&
    audio.duration > 0
  ) {
    const positionStateKey = [
      Math.round((audio.currentTime || 0) * 2) / 2,
      Math.round((audio.duration || 0) * 2) / 2,
      audio.playbackRate || 1,
    ].join("|");

    if (positionStateKey !== lastMediaPositionStateKey) {
      mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(audio.currentTime || 0, audio.duration),
      });
      lastMediaPositionStateKey = positionStateKey;
    }
  } else {
    lastMediaPositionStateKey = "";
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
    lastGuestPreviewNoticeSongId = "";
    primeAudioSource(playable.audio_url, playbackRate, {
      autoplay: true,
    });

    set({
      currentSong: playable,
      queue: updatedQueue,
      currentIndex: targetIndex !== -1 ? targetIndex : 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      hasRecordedPlay: false,
      shuffleHistory: [],
      lastPlayedLoading: false,
      lastPlayedLoaded: true,
    });
    persistPlaybackSnapshot({
      song: playable,
      currentTime: 0,
      force: true,
      isPlaying: true,
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

    void hydrateUpcomingQueueSongs(targetIndex !== -1 ? targetIndex : 0);
  },

  pause: () => {
    shouldResumePlayback = false;
    audio.pause();
    set({ isPlaying: false });
    persistPlaybackSnapshot({
      song: get().currentSong,
      currentTime: audio.currentTime || get().currentTime || 0,
      force: true,
      isPlaying: false,
    });
  },

  resume: () => {
    const { currentSong, playbackRate } = get();
    if (!currentSong?.audio_url) return;
    if (blockGuestPreviewPlayback({ forceNotice: true })) return;

    const currentSource = audio.currentSrc || audio.src || "";
    if (currentSource !== currentSong.audio_url) {
      primeAudioSource(currentSong.audio_url, playbackRate, {
        autoplay: true,
        resetTime: false,
      });
      return;
    }

    shouldResumePlayback = true;
    void attemptPlayback();
  },

  togglePlay: () => {
    const { isPlaying } = get();
    isPlaying ? get().pause() : get().resume();
  },

  seek: (time) => {
    const boundedTime =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.min(Math.max(Number(time) || 0, 0), audio.duration)
        : Math.max(Number(time) || 0, 0);

    if (blockGuestPreviewPlayback({ time: boundedTime, forceNotice: true })) {
      return;
    }

    audio.currentTime = boundedTime;
    set({ currentTime: boundedTime });
    persistPlaybackSnapshot({
      song: get().currentSong,
      currentTime: boundedTime,
      force: true,
      isPlaying: get().isPlaying,
    });
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
      clearPersistedPlayback();
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
      clearPersistedPlayback();
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
      void hydrateUpcomingQueueSongs(get().currentIndex);
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
    shouldResumePlayback = false;
    lastGuestPreviewNoticeSongId = "";
    clearPersistedPlayback();
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

  restorePersistedPlayback: async () => {
    const ownerKey = getPlaybackSessionOwner();
    if (!ownerKey) {
      clearPersistedPlayback();
      return null;
    }

    const snapshot = usePlaybackSessionStore.getState().getSnapshot(ownerKey);
    if (!snapshot?.song) return null;

    let playable = toPlayableSong(snapshot.song);
    if (!playable?.audio_url) {
      const fetched = await fetchPlayableSong(playable, getSongById);
      if (fetched) playable = fetched;
    }

    if (!playable?.audio_url) {
      clearPersistedPlayback();
      return null;
    }

    const restoredTime = Math.max(0, Number(snapshot.currentTime) || 0);
    const shouldAutoplay = Boolean(snapshot.isPlaying);
    const { playbackRate } = get();

    primeAudioSource(playable.audio_url, playbackRate, {
      autoplay: shouldAutoplay,
      startTime: restoredTime,
    });

    set({
      currentSong: playable,
      queue: [playable],
      currentIndex: 0,
      isPlaying: false,
      currentTime: restoredTime,
      duration: 0,
      hasRecordedPlay: false,
      lastPlayedLoading: false,
      lastPlayedLoaded: true,
    });

    persistPlaybackSnapshot({
      song: playable,
      currentTime: restoredTime,
      force: true,
      isPlaying: shouldAutoplay,
    });
    get().preloadLyricsForSong(playable);
    void hydrateUpcomingQueueSongs(0);
    return playable;
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
      clearPersistedPlayback();
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

    if (!force) {
      const restoredSong = await get().restorePersistedPlayback();
      if (restoredSong) return restoredSong;
    }

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
      primeAudioSource(playable.audio_url, playbackRate, {
        autoplay: false,
      });

      set({
        currentSong: playable,
        queue: [playable],
        currentIndex: 0,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        hasRecordedPlay: false,
        lastPlayedLoading: false,
        lastPlayedLoaded: true,
      });
      get().preloadLyricsForSong(playable);
      void hydrateUpcomingQueueSongs(0);
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
  tryApplyPendingRestoreTime();
  usePlayerStore.setState({ duration: audio.duration || 0 });
  retryPendingPlayback();
  syncMediaSession();
});

audio.addEventListener("loadeddata", () => {
  tryApplyPendingRestoreTime();
  retryPendingPlayback();
});
audio.addEventListener("canplay", () => {
  tryApplyPendingRestoreTime();
  retryPendingPlayback();
});
audio.addEventListener("canplaythrough", () => {
  tryApplyPendingRestoreTime();
  retryPendingPlayback();
});

audio.addEventListener("playing", () => {
  // Re-apply handlers once playback is active so iOS lock screen picks track controls.
  shouldResumePlayback = false;
  syncPlaybackState();
  const state = usePlayerStore.getState();
  persistPlaybackSnapshot({
    song: state.currentSong,
    currentTime: audio.currentTime || state.currentTime || 0,
    force: true,
    isPlaying: true,
  });
  setupMediaSession();
  syncMediaSession();
});

audio.addEventListener("pause", () => {
  syncPlaybackState();
  const state = usePlayerStore.getState();
  persistPlaybackSnapshot({
    song: state.currentSong,
    currentTime: audio.currentTime || state.currentTime || 0,
    force: true,
    isPlaying: false,
  });
  syncMediaSession();
});

audio.addEventListener("timeupdate", () => {
  const time = audio.currentTime || 0;
  const state = usePlayerStore.getState();

  if (blockGuestPreviewPlayback({ time })) {
    return;
  }

  if (!state.hasRecordedPlay && time >= 30) {
    state.recordListeningProgress(time);
  }
  usePlayerStore.setState({ currentTime: time });
  persistPlaybackSnapshot({
    song: state.currentSong,
    currentTime: time,
    isPlaying: state.isPlaying,
  });
  syncMediaSession();
});

audio.addEventListener("ended", () => {
  const state = usePlayerStore.getState();

  if (blockGuestPreviewPlayback({ time: audio.currentTime || state.currentTime || 0, forceNotice: true })) {
    return;
  }

  usePlayerStore.setState({ currentTime: audio.duration || 0 });
  syncPlaybackState();
  if (state.repeatMode === "one") {
    shouldResumePlayback = true;
    audio.currentTime = 0;
    void attemptPlayback();
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
