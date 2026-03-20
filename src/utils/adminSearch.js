export const normalizeAdminSearchType = (item = {}) => {
  const rawType = `${
    item.type || item.entity_type || item.entityType || item.kind || ""
  }`
    .toLowerCase()
    .trim();

  if (rawType.includes("playlist")) return null;
  if (
    item.playlist_id ||
    item.playlistId ||
    item.owner_id ||
    item.ownerId ||
    item.is_public !== undefined ||
    item.privacy !== undefined
  ) {
    return null;
  }

  if (["user", "profile"].includes(rawType)) return "user";
  if (["artist"].includes(rawType)) return "artist";
  if (["album"].includes(rawType)) return "album";
  if (["song", "track"].includes(rawType)) return "song";

  if (item.alias || item.realname || item.zing_artist_id) return "artist";

  if (
    item.title &&
    (item.play_count !== undefined ||
      item.audio_url ||
      item.audio_path ||
      item.duration !== undefined ||
      item.album_title ||
      item.weekly_play_count !== undefined)
  ) {
    return "song";
  }

  if (
    item.title &&
    (item.release_date ||
      item.zing_album_id ||
      item.artist_name ||
      item.artist_id ||
      item.album_type)
  ) {
    return "album";
  }

  if (item.display_name || item.email) return "user";
  if (item.name && !item.title) return "artist";

  return null;
};

export const extractAdminSearchItems = (payload) => {
  const itemsSource = payload?.items || payload?.results || payload?.data || payload;

  if (Array.isArray(itemsSource)) {
    return itemsSource;
  }

  return [
    ...(itemsSource?.songs ?? []),
    ...(itemsSource?.artists ?? []),
    ...(itemsSource?.albums ?? []),
    ...(itemsSource?.users ?? []),
  ];
};

export const filterAdminSearchItemsByType = (items = [], type) =>
  items.filter((item) => normalizeAdminSearchType(item) === type);
