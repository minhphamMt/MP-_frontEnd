import api from "./axios";

const extractPayload = (response) => response?.data?.data ?? response?.data ?? null;

const normalizePaginatedCollection = (collection) => {
  if (Array.isArray(collection)) {
    return { items: collection, meta: null };
  }

  if (!collection || typeof collection !== "object") {
    return { items: [], meta: null };
  }

  const items = Array.isArray(collection.items)
    ? collection.items
    : Array.isArray(collection.rows)
      ? collection.rows
      : Array.isArray(collection.data)
        ? collection.data
        : [];

  const meta =
    collection.meta ??
    (collection.page ||
    collection.currentPage ||
    collection.total ||
    collection.totalPages ||
    collection.total_pages
      ? {
          page: collection.page ?? collection.currentPage,
          limit: collection.limit ?? collection.perPage ?? collection.per_page,
          total: collection.total,
          totalPages: collection.totalPages ?? collection.total_pages,
          hasNext: collection.hasNext ?? collection.has_next ?? collection.has_more,
        }
      : null);

  return { items, meta };
};

const normalizeCollectionWithMeta = (collection, metaOverride) => {
  const normalized = normalizePaginatedCollection(collection);
  return {
    items: normalized.items,
    meta: metaOverride ?? normalized.meta,
  };
};

export const normalizeUserDetailPayload = (payload) => {
  if (!payload) {
    return {
      profile: null,
      listeningHistory: { items: [], meta: null },
      searchHistory: { items: [], meta: null },
      raw: payload,
    };
  }

  const profile = payload.profile ?? payload.user ?? payload;

  return {
    profile,
    listeningHistory: normalizeCollectionWithMeta(
      payload.listening_history ?? payload.listeningHistory ?? payload.listening,
      payload.listening_history_meta ??
        payload.listeningHistoryMeta ??
        payload.listening_meta
    ),
    searchHistory: normalizeCollectionWithMeta(
      payload.search_history ?? payload.searchHistory ?? payload.search,
      payload.search_history_meta ??
        payload.searchHistoryMeta ??
        payload.search_meta
    ),
    raw: payload,
  };
};

export const getAdminOverview = (params = {}) =>
  api.get("/admin/reports/overview", { params });
export const getReportCharts = (params = {}) =>
  api.get("/admin/reports/charts", { params });

export const searchAdmin = (params = {}) => api.get("/admin/search", { params });

export const listGenres = (params = {}) => api.get("/admin/genres", { params });

export const createGenre = (payload) => api.post("/admin/genres", payload);

export const updateGenre = (id, payload) =>
  api.put(`/admin/genres/${id}`, payload);

export const deleteGenre = (id) => api.delete(`/admin/genres/${id}`);

export const reviewSong = (id, payload) =>
  api.patch(`/admin/songs/${id}/review`, payload);

export const approveSong = (id) => api.patch(`/admin/songs/${id}/approve`);

export const blockSong = (id, payload) =>
  api.patch(`/admin/songs/${id}/block`, payload);

export const toggleUserActive = (id, payload) =>
  api.patch(`/users/${id}/active`, payload);

export const updateUserRole = (id, payload) =>
  api.patch(`/users/${id}/role`, payload);

export const listUsers = (params = {}) => api.get("/users", { params });

export const getUserById = (id) => api.get(`/users/${id}`);

export const getAdminUserDetail = async (id, params = {}) => {
  const response = await api.get(`/admin/users/${id}`, { params });
  const payload = extractPayload(response);

  return {
    ...normalizeUserDetailPayload(payload),
    response,
  };
};

export const createUser = (payload) => api.post("/users", payload);

export const updateUser = (id, payload) => api.put(`/users/${id}`, payload);

export const deleteUser = (id) => api.delete(`/users/${id}`);

export const uploadUserAvatarByAdmin = (id, payload) =>
  api.post(`/users/${id}/avatar`, payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const listAdminSongs = (params = {}) =>
  api.get("/admin/songs", { params });

export const updateAdminSong = (id, payload) =>
  api.put(`/admin/songs/${id}`, payload);

export const validateAdminSongLyrics = (id, payload = {}) =>
  api.post(`/admin/songs/${id}/lyrics/validate`, payload);

export const importAdminSongLyrics = (id, payload = {}) =>
  api.post(`/admin/songs/${id}/lyrics/import`, payload);

export const listArtistRequests = (params = {}) =>
  api.get("/admin/artist-requests", { params });

export const updateArtistRequest = (id, payload) =>
  api.patch(`/admin/artist-requests/${id}`, payload);

export const reviewArtistRequest = (id, payload) =>
  api.patch(`/admin/artist-requests/${id}/review`, payload);

export const approveArtistRequest = (id) =>
  api.patch(`/admin/artist-requests/${id}/approve`);

export const rejectArtistRequest = (id, payload) =>
  api.patch(`/admin/artist-requests/${id}/reject`, payload);
