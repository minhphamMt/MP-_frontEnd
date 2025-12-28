import api from "./axios";

export const searchEntities = (params = {}) => api.get("/search", { params });

export const getSearchHistory = ({
  page = 1,
  limit = 10,
} = {}) => {
  return api.get("/search/history", {
    params: { page, limit },
  });
};
export const saveSearchHistory = (keyword) =>
  api.post("/search/save-history", { keyword });

export default {
  searchEntities,
  getSearchHistory,
  saveSearchHistory
};