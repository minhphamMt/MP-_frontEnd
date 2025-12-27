import api from "./axios";

export const getSongById = (id) => api.get(`/songs/${id}`);
export const recordSongPlay = (id, duration) =>
  api.post(`/songs/${id}/play`, { duration });