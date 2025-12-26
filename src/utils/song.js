export const formatDuration = (s = 0) => {
  const total = Number.isFinite(Number(s)) ? Math.max(0, Math.round(Number(s))) : 0;
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const toPlayableSong = (raw = {}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  const audioPath =
    raw.audio_url ||
    raw.audioUrl ||
    raw.audio ||
    (raw.audio_path ? `${baseUrl}${raw.audio_path}` : undefined);

  return {
    id: raw.id ?? raw.song_id ?? raw.songId ?? raw._id,
    title: raw.title ?? raw.name ?? "Không rõ",
    artist_name: raw.artist_name ?? raw.artistName ?? raw.artist?.name ?? "",
    duration: raw.duration ?? raw.length ?? 0,
    cover_url:
      raw.cover_url ||
      raw.thumbnail ||
      raw.image_url ||
      raw.image ||
      raw.cover ||
      raw.album?.cover_url ||
      "",
    album_id: raw.album_id ?? raw.albumId ?? raw.album?.id,
    album_title: raw.album_title ?? raw.albumTitle ?? raw.album?.title,
    audio_url: audioPath || "",
  };
};

export const filterPlayableSongs = (list = []) =>
  list
    .map((item) => toPlayableSong(item))
    .filter((song) => song.id && song.audio_url);