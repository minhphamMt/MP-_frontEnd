import api from "./axios";

export const searchEntities = (params = {}) => api.get("/search", { params });

export const getSearchHistory = ({
  userId,
  page = 1,
  limit = 10,
} = {}) => {
  return api.get("/search/history", {
    params: { page, limit, userId },
  });
};
export const saveSearchHistory = (keyword, userId) =>
  api.post("/search/save-history", { keyword, userId });

export default {
  searchEntities,
  getSearchHistory,
  saveSearchHistory
};