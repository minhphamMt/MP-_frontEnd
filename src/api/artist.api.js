import api from "./axios";

export const getArtistCollections = (params = {}) =>
  api.get("/artists/collections", { params });
