import api from "./axios";

const inferSearchEntityType = (item) => {
  const rawType = `${
    item?.type || item?.entity_type || item?.entityType || item?.kind || ""
  }`
    .toLowerCase()
    .trim();

  if (rawType.includes("song") || rawType.includes("track")) return "song";
  if (rawType.includes("artist")) return "artist";
  if (rawType.includes("album")) return "album";

  if (
    item?.audio_url ||
    item?.audio_path ||
    item?.duration !== undefined ||
    item?.play_count !== undefined ||
    item?.weekly_play_count !== undefined
  ) {
    return "song";
  }

  if (
    item?.release_date ||
    item?.album_type ||
    item?.zing_album_id ||
    item?.album_id ||
    item?.albumId
  ) {
    return "album";
  }

  if (
    item?.artist_id ||
    item?.artistId ||
    item?.alias ||
    item?.realname ||
    (item?.name && !item?.title)
  ) {
    return "artist";
  }

  return null;
};

export const normalizeSearchParams = (params = {}) => {
  const normalizedParams = { ...params };
  const rawKeyword = normalizedParams.keyword ?? normalizedParams.q;
  const keyword =
    typeof rawKeyword === "string" ? rawKeyword.trim() : rawKeyword;

  if (keyword) {
    normalizedParams.keyword = keyword;
  }

  delete normalizedParams.q;

  return normalizedParams;
};

export const extractSearchCollections = (responseData) => {
  const payload = responseData?.data ?? responseData ?? {};
  const source = payload?.items ?? payload?.results ?? payload?.data ?? payload;

  if (Array.isArray(source)) {
    return source.reduce(
      (groups, item) => {
        const type = inferSearchEntityType(item);
        if (type === "song") groups.songs.push(item);
        if (type === "artist") groups.artists.push(item);
        if (type === "album") groups.albums.push(item);
        return groups;
      },
      { songs: [], artists: [], albums: [] }
    );
  }

  return {
    songs: Array.isArray(source?.songs)
      ? source.songs
      : Array.isArray(source?.tracks)
      ? source.tracks
      : [],
    artists: Array.isArray(source?.artists) ? source.artists : [],
    albums: Array.isArray(source?.albums) ? source.albums : [],
  };
};

export const searchEntities = (params = {}) => {
  const normalizedParams = normalizeSearchParams(params);
  return api.get("/search", { params: normalizedParams });
};

export const getSearchHistory = ({
  userId,
  page = 1,
  limit = 10,
} = {}) => {
  return api.get("/search/history", {
    params: { page, limit, userId },
  });
};
export const saveSearchHistory = (keyword, userId) =>
  api.post("/search/save-history", { keyword, userId });

export default {
  extractSearchCollections,
  normalizeSearchParams,
  searchEntities,
  getSearchHistory,
  saveSearchHistory
};
