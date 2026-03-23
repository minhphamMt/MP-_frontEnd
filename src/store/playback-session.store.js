import { create } from "zustand";

const STORAGE_KEY = "playback-session-state";

const normalizeSongId = (song) => {
  const rawId =
    song?.id ??
    song?._id ??
    song?.song_id ??
    song?.songId ??
    song?.song?.id ??
    song?.song?._id ??
    song;

  if (rawId === undefined || rawId === null) return null;
  return String(rawId);
};

const normalizeTime = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return 0;
  return Math.floor(numericValue);
};

const cloneSongForStorage = (song) => {
  const songId = normalizeSongId(song);
  if (!songId || !song) return null;

  try {
    return JSON.parse(JSON.stringify(song));
  } catch (error) {
    return {
      id: songId,
      title: song?.title || "",
      audio_url: song?.audio_url || "",
      cover_url: song?.cover_url || "",
      artist_name: song?.artist_name || "",
      artists: Array.isArray(song?.artists) ? song.artists : [],
      album_title: song?.album_title || "",
      duration: Number(song?.duration) || 0,
    };
  }
};

const safeParseJson = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse playback session state", error);
    return null;
  }
};

const loadStoredState = () => {
  if (typeof sessionStorage === "undefined") {
    return {
      sessionOwnerKey: null,
      song: null,
      currentTime: 0,
      isPlaying: false,
      updatedAt: null,
    };
  }

  const rawValue = sessionStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return {
      sessionOwnerKey: null,
      song: null,
      currentTime: 0,
      isPlaying: false,
      updatedAt: null,
    };
  }

  const parsedValue = safeParseJson(rawValue);
  if (!parsedValue) {
    return {
      sessionOwnerKey: null,
      song: null,
      currentTime: 0,
      isPlaying: false,
      updatedAt: null,
    };
  }

  const song = cloneSongForStorage(parsedValue.song);

  return {
    sessionOwnerKey: parsedValue.sessionOwnerKey || null,
    song,
    currentTime: normalizeTime(parsedValue.currentTime),
    isPlaying: Boolean(parsedValue.isPlaying),
    updatedAt: parsedValue.updatedAt || null,
  };
};

const persistState = (state) => {
  if (typeof sessionStorage === "undefined") return;

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
        JSON.stringify({
          sessionOwnerKey: state.sessionOwnerKey,
          song: state.song,
          currentTime: normalizeTime(state.currentTime),
          isPlaying: Boolean(state.isPlaying),
          updatedAt: state.updatedAt,
        })
      );
  } catch (error) {
    console.error("Failed to persist playback session state", error);
  }
};

const clearPersistedState = () => {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
};

const initialState = loadStoredState();

const usePlaybackSessionStore = create((set, get) => ({
  sessionOwnerKey: initialState.sessionOwnerKey,
  song: initialState.song,
  currentTime: initialState.currentTime,
  isPlaying: initialState.isPlaying,
  updatedAt: initialState.updatedAt,

  setSnapshot: ({ ownerKey, song, currentTime = 0, isPlaying = false } = {}) => {
    const nextSong = cloneSongForStorage(song);

    if (!ownerKey || !nextSong) {
      get().clear();
      return null;
    }

    const nextState = {
      sessionOwnerKey: ownerKey,
      song: nextSong,
      currentTime: normalizeTime(currentTime),
      isPlaying: Boolean(isPlaying),
      updatedAt: Date.now(),
    };

    set(nextState);
    persistState(nextState);
    return nextState;
  },

  getSnapshot: (ownerKey) => {
    const state = get();

    if (!ownerKey) {
      get().clear();
      return null;
    }

    if (state.sessionOwnerKey && state.sessionOwnerKey !== ownerKey) {
      get().clear();
      return null;
    }

    if (!state.song) return null;

    return {
      song: cloneSongForStorage(state.song),
      currentTime: normalizeTime(state.currentTime),
      isPlaying: Boolean(state.isPlaying),
      updatedAt: state.updatedAt || null,
    };
  },

  clear: () => {
    set({
      sessionOwnerKey: null,
      song: null,
      currentTime: 0,
      isPlaying: false,
      updatedAt: null,
    });
    clearPersistedState();
  },
}));

export default usePlaybackSessionStore;
