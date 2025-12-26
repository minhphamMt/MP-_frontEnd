import api from "./axios";

export const getPlaylists = (params = {}) => api.get("/playlists", { params });

export const getPlaylistById = (id) => api.get(`/playlists/${id}`);
