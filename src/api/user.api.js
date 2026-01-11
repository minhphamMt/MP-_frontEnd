import api from "./axios";

export const getMyLikedSongs = () => api.get("/users/me/liked-songs");
export const getCurrentUser = () => api.get("/users/me");
export const updateUserProfile = (payload) => api.put("/users/me", payload);
export const updateUserPassword = (payload) =>
  api.patch("/users/me/password", payload);