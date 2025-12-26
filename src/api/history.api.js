import api from "./axios";

export const addHistory = (songId) => api.post("/history", { song_id: songId });

export const getMyHistory = (params = {}) =>
  api.get("/history/me", { params });