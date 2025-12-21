import api from "./axios";

// LẤY DANH SÁCH ALBUM (CHO HOME)
export const getAlbums = (params = {}) => api.get("/albums", { params });

// ALBUM DETAIL
export const getAlbumById = (id) => api.get(`/albums/${id}`);
