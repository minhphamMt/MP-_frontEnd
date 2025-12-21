import api from "./axios";

export const getMyLikedSongs = () => api.get("/users/me/liked-songs");
