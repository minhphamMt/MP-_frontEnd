import api from "./axios";

export const getDeletedItems = () => api.get("/trash");

export const restoreSong = (id) => api.patch(`/songs/${id}/restore`);

export const restoreAlbum = (id) => api.patch(`/albums/${id}/restore`);

export const restoreArtist = (id) => api.patch(`/artists/${id}/restore`);

export const restoreGenre = (id) => api.patch(`/admin/genres/${id}/restore`);

export const hardDeleteSong = (id) => api.delete(`/songs/${id}`);

export const hardDeleteAlbum = (id) => api.delete(`/albums/${id}`);

export const hardDeleteArtist = (id) => api.delete(`/artists/${id}`);

export const hardDeleteGenre = (id) => api.delete(`/admin/genres/${id}`);