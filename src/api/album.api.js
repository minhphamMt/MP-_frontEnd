import api from "./axios";

// LẤY DANH SÁCH ALBUM (CHO HOME)
export const getAlbums = (params = {}) => api.get("/albums", { params });

// ALBUM DETAIL
export const getAlbumById = (id) => api.get(`/albums/${id}`);
// CRUD cho nghệ sĩ
export const createAlbum = (payload) => api.post("/albums", payload);

export const updateAlbum = (id, payload) => api.put(`/albums/${id}`, payload);

export const deleteAlbum = (id) => api.delete(`/albums/${id}`);