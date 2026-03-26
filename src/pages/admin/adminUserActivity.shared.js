export const USER_ACTIVITY_PAGE_LIMIT = 20;

export const formatDateTime = (value, fallback = "Chưa cập nhật") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null;
  }

  const duration = Math.max(Number(value), 0);
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export const getMetaPage = (meta) =>
  meta?.page ?? meta?.currentPage ?? meta?.pageNumber ?? meta?.current_page ?? 1;

const getMetaTotalPages = (meta) =>
  meta?.totalPages ?? meta?.total_pages ?? meta?.lastPage ?? meta?.last_page ?? null;

export const hasPreviousPage = (meta) => getMetaPage(meta) > 1;

export const hasNextPage = (meta, items) => {
  if (!meta) return false;

  const page = getMetaPage(meta);
  const totalPages = getMetaTotalPages(meta);
  if (totalPages) return page < totalPages;

  const explicitNext = meta.hasNext ?? meta.has_next ?? meta.has_more;
  if (typeof explicitNext === "boolean") return explicitNext;

  const total = meta.total ?? meta.totalItems ?? meta.count;
  const limit = meta.limit ?? meta.perPage ?? meta.per_page ?? items.length;
  if (total && limit) return page * limit < total;

  return false;
};

export const resolveTotal = (meta, items) =>
  meta?.total ?? meta?.totalItems ?? meta?.count ?? items.length;

const getArtistNames = (song) => {
  if (song?.artist_name) return song.artist_name;
  if (song?.artist?.name) return song.artist.name;
  if (typeof song?.artist === "string") return song.artist;
  if (Array.isArray(song?.artists)) {
    return song.artists
      .map((artist) => artist?.name || artist?.display_name || artist)
      .filter(Boolean)
      .join(", ");
  }
  return "Chưa cập nhật";
};

export const normalizeListeningItem = (entry) => {
  const song = entry?.song || entry?.track || entry?.item || entry;
  return {
    id:
      song?.id ??
      song?.song_id ??
      song?.songId ??
      entry?.song_id ??
      entry?.songId ??
      entry?.id,
    title: song?.title || song?.name || "Bài hát",
    artist: getArtistNames(song),
    album: song?.album_title || song?.album?.title || "Chưa cập nhật",
    cover:
      song?.cover_url ||
      song?.cover ||
      song?.thumbnail ||
      song?.image ||
      song?.album?.cover_url,
    listenedAt:
      entry?.listened_at ||
      entry?.created_at ||
      entry?.createdAt ||
      song?.listened_at ||
      song?.listen_time,
    duration: song?.duration,
  };
};

export const normalizeSearchItem = (entry) => ({
  id: entry?.id ?? `${entry?.keyword || entry?.query || entry?.searched_at || ""}`,
  keyword: entry?.keyword || entry?.query || entry?.term || entry?.search_term || "",
  searchedAt:
    entry?.searched_at ||
    entry?.created_at ||
    entry?.createdAt ||
    entry?.updated_at,
  resultType:
    entry?.type || entry?.entity_type || entry?.entityType || entry?.target_type,
});
