import { create } from "zustand";
import api from "../api/axios";
import { addHistory, getMyHistory } from "../api/history.api";
import { getSongById } from "../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../utils/song";

export const normalizeSongId = (song) => {
  const rawId =
    song?.id ?? song?.song_id ?? song?.songId ?? song?.song?.id ?? song;

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

const usePlayerStore = create((set, get) => ({
  /* =====================
     STATE
     ===================== */
  currentSong: null,
  queue: [],
  currentIndex: -1,
  repeatMode: "off", // off | all | one

  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 1,

  /* ===== LIKE ===== */
  likedSongIds: [],

  /* =====================
     INTERNAL
     ===================== */
  audio,

  /* =====================
     ACTIONS – PLAYER
     ===================== */

  playSong: (song, queue = []) => {
    const list = queue.length ? queue : [song];
     const targetId = normalizeSongId(song);
    const index = list.findIndex(
      (s) => normalizeSongId(s) === targetId
    );

    audio.src = song.audio_url;
    audio.load();
    audio.play();

    set({
      currentSong: song,
      queue: list,
      currentIndex: index !== -1 ? index : 0,
      isPlaying: true,
      currentTime: 0,
    });

     if (song?.id) {
      addHistory(song.id).catch((err) =>
        console.error("Add listening history failed", err)
      );
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

  seek: (time) => {
    audio.currentTime = time;
    set({ currentTime: time });
  },
 setVolume: (value) => {
    const volume = Math.min(1, Math.max(0, value));
    audio.volume = volume;
    set({ volume });
  },
  playNext: () => {
      const { queue, currentIndex, repeatMode } = get();
    if (!queue.length) return;

    if (currentIndex < queue.length - 1) {
      get().playSong(queue[currentIndex + 1], queue);
        } else if (repeatMode === "all") {
      get().playSong(queue[0], queue);
    }
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
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

  loadLastPlayed: async () => {
    if (get().currentSong) return;

    try {
      const res = await getMyHistory({ limit: 1 });
      const payload = res?.data?.data ?? res?.data ?? {};
      const items = Array.isArray(payload)
        ? payload
        : payload?.items ?? payload?.data ?? [];

      const lastSong = toPlayableSong(items[0]);

      if (!lastSong?.id) return;

      let playable = lastSong;
      if (!playable.audio_url) {
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
      });
    } catch (err) {
      console.error("Load last played song failed", err);
    }
  },
  
  /* =====================
     ACTIONS – LIKE (BACKEND)
     ===================== */

  loadLikedSongs: async () => {
    try {
      const res = await api.get("/users/me/liked-songs");
      const songs = extractSongsFromResponse(res);

      const ids = [
        ...new Set(
          songs
            .map((s) => normalizeSongId(s))
            .filter((id) => id !== null && id !== "")
        ),
      ];
      set({ likedSongIds: ids });
    } catch (err) {
      console.error("Load liked songs error", err);
    }
  },

  toggleLike: async (songId) => {
    const targetId = normalizeSongId(songId);
    if (!targetId) return;

    const { likedSongIds } = get();
    const isLiked = likedSongIds.includes(targetId);

    // optimistic update
    set({
      likedSongIds: isLiked
        ? likedSongIds.filter((id) => id !== targetId)
        : [...likedSongIds, targetId],
    });

    try {
      if (isLiked) {
        await api.delete(`/songs/${targetId}/like`);
      } else {
        await api.post(`/songs/${targetId}/like`);
      }
    } catch (err) {
      console.error("Toggle like error", err);
      // rollback
      set({ likedSongIds });
    }
  },
  
  /* =====================
     ACTIONS – QUEUE
     ===================== */

  addToQueue: (songs) => {
    const list = Array.isArray(songs) ? songs : [songs];

    set((state) => {
      const existingIds = new Set(
        state.queue
          .map((s) => normalizeSongId(s))
          .filter((id) => id !== null)
      );

      const newItems = list.filter((item) => {
        const id = normalizeSongId(item);
        return id && !existingIds.has(id);
      });

      return { queue: [...state.queue, ...newItems] };
    });
  },
}));

/* =====================
   AUDIO EVENTS
   ===================== */
audio.addEventListener("loadedmetadata", () => {
  usePlayerStore.setState({
    duration: audio.duration || 0,
  });
});

audio.addEventListener("timeupdate", () => {
  usePlayerStore.setState({
    currentTime: audio.currentTime || 0,
  });
});

audio.addEventListener("ended", () => {
 const state = usePlayerStore.getState();
  if (state.repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
    return;
  }

  const { queue, currentIndex } = state;
  if (currentIndex < queue.length - 1 || state.repeatMode === "all") {
    state.playNext();
  } else {
    state.pause();
    audio.currentTime = 0;
  }
});
audio.volume = usePlayerStore.getState().volume ?? 1;
export default usePlayerStore;
