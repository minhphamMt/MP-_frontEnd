import api from "./axios";

export const getArtistCollections = (params = {}) =>
  api.get("/artists/collections", { params });

export const getArtists = (params = {}) => api.get("/artists", { params });

export const getArtistById = (id) => api.get(`/artists/${id}`);

export const getMyArtistProfile = () => api.get("/artists/me");

export const createArtist = (payload) => api.post("/artists", payload);

export const updateArtist = (id, payload) => api.put(`/artists/${id}`, payload);

export const deleteArtist = (id) => api.delete(`/artists/${id}`);

export const uploadArtistAvatar = (payload) =>
  api.post("/artists/me/avatar", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const followArtist = (artistId) =>
  api.post(`/artists/${artistId}/follow`);

export const unfollowArtist = (artistId) =>
  api.delete(`/artists/${artistId}/follow`);

export const getFollowedArtists = () => api.get("/users/me/followed-artists");
