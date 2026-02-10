import api from "./axios";

export const getRecommendations = (songId) => api.get(`/recommend/${songId}`);

export const getColdStartRecommendations = async (limit) => {
  const params = Number(limit) > 0 ? { limit: Number(limit) } : undefined;

  try {
    return await api.get("/recommendations/cold-start", { params });
  } catch (error) {
    if (error?.response?.status === 404) {
      return api.get("/recommend/cold-start", { params });
    }
    throw error;
  }
};
