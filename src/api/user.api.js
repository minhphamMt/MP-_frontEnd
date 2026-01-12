import api from "./axios";

export const getMyLikedSongs = () => api.get("/users/me/liked-songs");
export const getCurrentUser = () => api.get("/users/me");
export const updateUserProfile = (payload) => api.put("/users/me", payload);
export const updateUserPassword = (payload) =>
 api.patch("/users/me/password", payload);
export const uploadUserAvatar = (payload) =>
  api.post("/users/me/avatar", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });