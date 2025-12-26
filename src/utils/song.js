export const formatDuration = (s = 0) => {
  const total = Number.isFinite(Number(s)) ? Math.max(0, Math.round(Number(s))) : 0;
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const toPlayableSong = (raw = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const source = raw.song ?? raw;

  const audioPath =
    source.audio_url ||
    source.audioUrl ||
    source.audio ||
    source.streaming_url ||
    source.stream_url ||
    source.streamUrl ||
    source.source_url ||
    source.source ||
    source.url ||
    raw.audio_url ||
    raw.audioUrl ||
    raw.audio ||
    raw.streaming_url ||
    raw.stream_url ||
    raw.streamUrl ||
    raw.source_url ||
    raw.source ||
    raw.url ||
    (source.audio_path ? `${baseUrl}${source.audio_path}` : undefined) ||
    (raw.audio_path ? `${baseUrl}${raw.audio_path}` : undefined);

  return {
    id:
      source.id ??
      source.song_id ??
      source.songId ??
      raw.id ??
      raw.song_id ??
      raw.songId ??
      raw._id,
    title: source.title ?? source.name ?? raw.title ?? raw.name ?? "Không rõ",
    artist_name:
      source.artist_name ??
      source.artistName ??
      source.artist?.name ??
      raw.artist_name ??
      raw.artistName ??
      raw.artist?.name ??
      "",
    duration: source.duration ?? source.length ?? raw.duration ?? raw.length ?? 0,
    cover_url:
      source.cover_url ||
      source.thumbnail ||
      source.image_url ||
      source.thumbnail_m ||
      source.image ||
      source.cover ||
      source.album?.cover_url ||
      raw.cover_url ||
      raw.thumbnail ||
      raw.image_url ||
      raw.thumbnail_m ||
      raw.image ||
      raw.cover ||
      raw.album?.cover_url ||
      "",
    album_id: source.album_id ?? source.albumId ?? source.album?.id,
    album_title: source.album_title ?? source.albumTitle ?? source.album?.title,
    audio_url: audioPath || "",
    rank: raw.rank ?? source.rank,
    play_count:
      raw.playCount ?? raw.play_count ?? source.playCount ?? source.play_count,
  };
};

export const filterPlayableSongs = (list = []) =>
  list
    .map((item) => toPlayableSong(item))
     .filter((song) => song.id);

export const fetchPlayableSong = async (song, fetchById) => {
  if (!song) return null;
  if (song.audio_url) return song;

  const songId =
    song.id ?? song.song_id ?? song.songId ?? song?.song?.id ?? song?._id;
  if (!songId || typeof fetchById !== "function") return null;

  try {
    const res = await fetchById(songId);
    const payload = res?.data?.data || res?.data || {};
    const normalized = toPlayableSong({ ...song, ...payload });

    if (normalized?.audio_url) {
      return normalized;
    }
  } catch (err) {
    console.error("Fetch playable song failed", err);
  }

  return null;
};