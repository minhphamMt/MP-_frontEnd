import { create } from "zustand";

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

  /* =====================
     INTERNAL
     ===================== */
  audio,

  /* =====================
     ACTIONS
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
      const nextIndex = currentIndex + 1;
      get().playSong(queue[nextIndex], queue);
    }
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      get().playSong(queue[prevIndex], queue);
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
