import api from "./axios";

export const getAdminOverview = (params = {}) =>
  api.get("/admin/reports/overview", { params });

export const searchAdmin = (params = {}) => api.get("/admin/search", { params });

export const listGenres = (params = {}) => api.get("/admin/genres", { params });

export const createGenre = (payload) => api.post("/admin/genres", payload);

export const updateGenre = (id, payload) =>
  api.put(`/admin/genres/${id}`, payload);

export const deleteGenre = (id) => api.delete(`/admin/genres/${id}`);

export const reviewSong = (id, payload) =>
  api.patch(`/admin/songs/${id}/review`, payload);

export const approveSong = (id) => api.patch(`/admin/songs/${id}/approve`);

export const blockSong = (id, payload) =>
  api.patch(`/admin/songs/${id}/block`, payload);

export const toggleUserActive = (id, payload) =>
  api.patch(`/admin/users/${id}/active`, payload);

export const updateUserRole = (id, payload) =>
  api.patch(`/admin/users/${id}/role`, payload);

export const listUsers = (params = {}) => api.get("/admin/users", { params });

export const updateUser = (id, payload) =>
  api.patch(`/admin/users/${id}`, payload);

export const listAdminSongs = (params = {}) =>
  api.get("/admin/songs", { params });

export const updateAdminSong = (id, payload) =>
  api.put(`/admin/songs/${id}`, payload);