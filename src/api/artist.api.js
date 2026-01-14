import api from "./axios";

export const getArtistCollections = (params = {}) =>
  api.get("/artists/collections", { params });

export const getArtistById = (id) => api.get(`/artists/${id}`);

export const getMyArtistProfile = () => api.get("/artists/me");

export const createArtist = (payload) => api.post("/artists", payload);

export const updateArtist = (id, payload) => api.put(`/artists/${id}`, payload);

export const followArtist = (artistId) =>
  api.post(`/artists/${artistId}/follow`);

export const unfollowArtist = (artistId) =>
  api.delete(`/artists/${artistId}/follow`);

export const getFollowedArtists = () => api.get("/users/me/followed-artists");