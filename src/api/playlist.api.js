import api from "./axios";

export const getPlaylists = (params = {}) => api.get("/playlists", { params });

export const getPlaylistById = (id) => api.get(`/playlists/${id}`);

export const createPlaylist = (payload) => api.post("/playlists", payload);

export const updatePlaylist = (id, payload) => api.put(`/playlists/${id}`, payload);

export const deletePlaylist = (id) => api.delete(`/playlists/${id}`);

export const addSongToPlaylist = (id, payload) =>
  api.post(`/playlists/${id}/songs`, payload);

export const removeSongFromPlaylist = (id, songId) =>
  api.delete(`/playlists/${id}/songs/${songId}`);

export const reorderSongInPlaylist = (id, songId, payload) =>
  api.patch(`/playlists/${id}/songs/${songId}/reorder`, payload);