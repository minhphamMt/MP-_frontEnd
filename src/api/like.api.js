import api from "./axios";

export const likeSong = (songId) => api.post(`/songs/${songId}/like`);

export const unlikeSong = (songId) => api.delete(`/songs/${songId}/like`);

export const getLikedSongs = () => api.get("/songs/liked");

export const likeAlbum = (albumId) => api.post(`/albums/${albumId}/like`);

export const unlikeAlbum = (albumId) => api.delete(`/albums/${albumId}/like`);

export const getLikedAlbums = () => api.get("/users/me/liked-albums");