import api from "./axios";

export const getSongs = (params = {}) => api.get("/songs", { params });

export const getSongById = (id) => api.get(`/songs/${id}`);

export const getArtistSongs = (artistId, params = {}) =>
  api.get("/songs", {
    params: {
      ...params,
      artist_id: artistId,
    },
  });

export const createSong = (payload) => api.post("/songs", payload);

export const updateSong = (id, payload) => api.put(`/songs/${id}`, payload);

export const deleteSong = (id) => api.delete(`/songs/${id}`);
export const recordSongPlay = (id, duration) =>
  api.post(`/songs/${id}/play`, { duration });
export const getLikedSongs = () =>
  api.get("/api/songs/liked");
