import api from "./axios";

export const getRecommendations = (songId) => api.get(`/recommend/${songId}`);
