import { create } from "zustand";
import api from "../api/axios";

const audio = new Audio();

const usePlayerStore = create((set, get) => ({
  /* =====================
     STATE
     ===================== */
  currentSong: null,
  queue: [],
  currentIndex: -1,

  isPlaying: false,
  duration: 0,
  currentTime: 0,

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
    const index = list.findIndex((s) => s.id === song.id);

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

  playNext: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      get().playSong(queue[currentIndex + 1], queue);
    }
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      get().playSong(queue[currentIndex - 1], queue);
    }
  },

  /* =====================
     ACTIONS – LIKE (BACKEND)
     ===================== */

  loadLikedSongs: async () => {
    try {
      const res = await api.get("/users/me/liked-songs");
      const ids = (res.data?.data || []).map((s) => s.id);
      set({ likedSongIds: ids });
    } catch (err) {
      console.error("Load liked songs error", err);
    }
  },

  toggleLike: async (songId) => {
    const { likedSongIds } = get();
    const isLiked = likedSongIds.includes(songId);

    // optimistic update
    set({
      likedSongIds: isLiked
        ? likedSongIds.filter((id) => id !== songId)
        : [...likedSongIds, songId],
    });

    try {
      if (isLiked) {
        await api.delete(`/songs/${songId}/like`);
      } else {
        await api.post(`/songs/${songId}/like`);
      }
    } catch (err) {
      console.error("Toggle like error", err);
      // rollback
      set({ likedSongIds });
    }
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
  usePlayerStore.getState().playNext();
});

export default usePlayerStore;
