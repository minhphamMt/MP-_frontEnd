import { resolveAssetUrl } from "./asset";
import { getArtistLabel, getPrimaryArtistId, normalizeArtists } from "./artist";

export const formatDuration = (s = 0) => {
  const total = Number.isFinite(Number(s)) ? Math.max(0, Math.round(Number(s))) : 0;
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const resolveAudioUrl = (path, baseUrl) => {
  if (!path) return undefined;
  const rawPath = `${path}`.trim();

  // Handle Firebase object path stored as url-encoded string (uploads%2Fmusic%2F...).
  // Support both raw object path and absolute URL forms.
  if (/uploads%2F/i.test(rawPath)) {
    try {
      const encodedPath = /^https?:\/\//i.test(rawPath)
        ? new URL(rawPath).pathname.replace(/^\/+/, "")
        : rawPath;
      const decodedPath = decodeURIComponent(encodedPath).replace(/^\/+/, "");
      const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
      if (decodedPath.startsWith("uploads/") && storageBucket) {
        return `https://storage.googleapis.com/${storageBucket}/${decodedPath}`;
      }
    } catch {
      // Fallback to base URL strategy below if decode fails.
    }
  }
  if (/^https?:\/\//i.test(rawPath)) return rawPath;

  const cleanedBase = (baseUrl || "").replace(/\/$/, "");
  const normalizedPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  return cleanedBase ? `${cleanedBase}${normalizedPath}` : normalizedPath;
};

export const toPlayableSong = (rawInput = {}) => {
  const raw =
    rawInput && typeof rawInput === "object" ? rawInput : {};
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
  const source = raw.song ?? raw;

  const audioPath =
    resolveAudioUrl(
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
        raw.url,
      baseUrl
    ) ||
    resolveAudioUrl(source.audio_path, baseUrl) ||
    resolveAudioUrl(raw.audio_path, baseUrl);

  const cover =
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
    "";

  const artists = normalizeArtists({ ...raw, ...source });
  const artistName = getArtistLabel({ ...raw, ...source }) || "";
  const artistId = getPrimaryArtistId({ ...raw, ...source });

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
    artist_name: artistName,
    artist_id: artistId,
    artists,
    duration: source.duration ?? source.length ?? raw.duration ?? raw.length ?? 0,
    cover_url: resolveAssetUrl(cover, baseUrl),
    album_id: source.album_id ?? source.albumId ?? source.album?.id,
    album_title: source.album_title ?? source.albumTitle ?? source.album?.title,
    audio_url: audioPath || "",
    rank: raw.rank ?? source.rank,
    play_count:
      raw.weekly_play_count ??
      source.weekly_play_count ??
      raw.playCount ??
      raw.play_count ??
      source.playCount ??
      source.play_count,
    weekly_play_count: raw.weekly_play_count ?? source.weekly_play_count,
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
