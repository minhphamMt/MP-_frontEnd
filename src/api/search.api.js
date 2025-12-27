import api from "./axios";

export const searchEntities = (params = {}) => api.get("/search", { params });

export const getSearchHistory = (params = {}) =>
  api.get("/search/history", { params });

export default {
  searchEntities,
  getSearchHistory,
};