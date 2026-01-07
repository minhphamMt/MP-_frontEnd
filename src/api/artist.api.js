import api from "./axios";

export const getArtistCollections = (params = {}) =>
  api.get("/artists/collections", { params });

export const followArtist = (artistId) =>
  api.post(`/artists/${artistId}/follow`);

export const unfollowArtist = (artistId) =>
  api.delete(`/artists/${artistId}/follow`);

export const getFollowedArtists = () => api.get("/users/me/followed-artists");