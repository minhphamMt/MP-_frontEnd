import api from "./axios";

export const createArtistRequest = (payload) =>
  api.post("/artist-requests", payload);

export const getMyArtistRequest = () => api.get("/artist-requests/me");

