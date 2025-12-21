import api from "./axios";

export const likeSong = (songId) => api.post(`/songs/${songId}/like`);

export const unlikeSong = (songId) => api.delete(`/songs/${songId}/like`);

export const getLikedSongs = () => api.get("/users/me/liked-songs");
