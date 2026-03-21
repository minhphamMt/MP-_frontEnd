import { create } from "zustand";

const normalizeUserKey = (userId) => {
  if (userId === undefined || userId === null) return null;
  return String(userId);
};

const normalizeSongKey = (songId) => {
  if (songId === undefined || songId === null) return null;
  return String(songId);
};

const useRecommendationSessionStore = create((set, get) => ({
  usedSeedSongIdsByUser: {},

  getUsedSeedSongIds: (userId) => {
    const userKey = normalizeUserKey(userId);
    if (!userKey) return [];
    return get().usedSeedSongIdsByUser[userKey] || [];
  },

  markSeedSongId: (userId, songId) => {
    const userKey = normalizeUserKey(userId);
    const songKey = normalizeSongKey(songId);
    if (!userKey || !songKey) return;

    set((state) => {
      const currentIds = state.usedSeedSongIdsByUser[userKey] || [];
      if (currentIds.includes(songKey)) return state;

      return {
        usedSeedSongIdsByUser: {
          ...state.usedSeedSongIdsByUser,
          [userKey]: [...currentIds, songKey],
        },
      };
    });
  },

  clearUserSeedSongIds: (userId) => {
    const userKey = normalizeUserKey(userId);
    if (!userKey) return;

    set((state) => {
      if (!state.usedSeedSongIdsByUser[userKey]) return state;

      const nextMap = { ...state.usedSeedSongIdsByUser };
      delete nextMap[userKey];

      return {
        usedSeedSongIdsByUser: nextMap,
      };
    });
  },

  resetForAuthChange: () => {
    set({ usedSeedSongIdsByUser: {} });
  },
}));

export default useRecommendationSessionStore;
