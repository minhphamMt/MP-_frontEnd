import api from "./axios";

export const getSongById = (id) => api.get(`/songs/${id}`);
