import { getAlbums } from "../api/album.api";
import { getArtistById } from "../api/artist.api";
import { getArtistSongs } from "../api/song.api";
import {
  getArtistLabel,
  getPrimaryArtistId,
  normalizeArtists,
} from "../utils/artist";
import { formatDuration, toPlayableSong } from "../utils/song";

export const SONG_PREVIEW_LIMIT = 10;
export const ALBUM_PREVIEW_LIMIT = 5;

const extractData = (response) => response?.data?.data ?? response?.data ?? null;

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.rows)) return value.rows;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.albums)) return value.albums;
  if (Array.isArray(value.songs)) return value.songs;
  return [];
};

export const formatTotalDuration = (seconds = 0) => {
  const total = Number.isFinite(Number(seconds))
    ? Math.max(0, Math.round(Number(seconds)))
    : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }

  return formatDuration(total);
};

export const stripHtml = (value = "") =>
  `${value}`
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const createBioMarkup = (bio = "") => {
  if (!bio) return { __html: "" };

  let normalized = bio;
  normalized = normalized.replace(/\r\n/g, "\n");
  normalized = normalized.replace(/\n{2,}/g, "\n");
  normalized = normalized.replace(/<br\s*\/?>/gi, "<br />");
  normalized = normalized.replace(/(<br \/>){2,}/gi, "<br />");
  normalized = normalized.replace(/(\n\s*)*(<br \/>)(\s*\n)*/gi, "<br />");
  normalized = normalized.trim();

  return { __html: normalized };
};

const getTimestamp = (item) => {
  const raw =
    item?.release_date ||
    item?.releaseDate ||
    item?.published_at ||
    item?.publishedAt ||
    item?.created_at ||
    item?.createdAt ||
    item?.updated_at ||
    item?.updatedAt ||
    "";

  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
};

export const normalizeArtistProfile = (artist, fallback = {}) => {
  if (!artist && !fallback?.id && !fallback?.name) return null;

  return {
    id:
      artist?.id ??
      artist?.artist_id ??
      artist?.artistId ??
      fallback?.id ??
      null,
    name:
      artist?.name ||
      artist?.artist_name ||
      artist?.alias ||
      fallback?.name ||
      "Nghệ sĩ",
    alias: artist?.alias || fallback?.alias || "",
    realname: artist?.realname || fallback?.realname || "",
    birthday: artist?.birthday || fallback?.birthday || "",
    national: artist?.national || fallback?.national || "",
    cover:
      artist?.cover_url ||
      artist?.cover ||
      artist?.avatar_url ||
      fallback?.cover ||
      fallback?.avatar ||
      "",
    avatar:
      artist?.avatar_url ||
      artist?.avatar ||
      artist?.cover_url ||
      fallback?.avatar ||
      fallback?.cover ||
      "",
    bio: artist?.bio || fallback?.bio || "",
    shortBio:
      artist?.short_bio ||
      artist?.shortBio ||
      fallback?.shortBio ||
      fallback?.short_bio ||
      "",
  };
};

export const normalizeArtistAlbum = (album, artist) => {
  if (!album || typeof album !== "object") return null;

  return {
    ...album,
    id: album.id ?? album.album_id ?? album.albumId ?? null,
    title: album.title ?? album.name ?? "Album",
    cover_url:
      album.cover_url ||
      album.cover ||
      album.thumbnail ||
      album.image_url ||
      "",
    artist_name: getArtistLabel(
      album,
      artist?.name || album.artist_name || album.artist?.name || album.creator?.name || ""
    ),
  };
};

export async function fetchArtistDetailData(id) {
  const [artistResult, songsResult, albumsResult] = await Promise.allSettled([
    getArtistById(id),
    getArtistSongs(id),
    getAlbums({ artist_id: id, limit: 100 }),
  ]);

  const artistPayload =
    artistResult.status === "fulfilled" ? extractData(artistResult.value) : null;
  const songsPayload =
    songsResult.status === "fulfilled" ? extractData(songsResult.value) : null;
  const albumsPayload =
    albumsResult.status === "fulfilled" ? extractData(albumsResult.value) : null;

  const artistFromSongs = songsPayload?.artist ?? null;
  const rawSongs = toArray(songsPayload?.songs ?? songsPayload?.data ?? songsPayload);
  const rawAlbums = toArray(albumsPayload);

  const inferredName =
    artistPayload?.name ||
    artistPayload?.alias ||
    artistFromSongs?.name ||
    artistFromSongs?.alias ||
    getArtistLabel(rawSongs[0], "") ||
    getArtistLabel(rawAlbums[0], "");

  const artist = normalizeArtistProfile(artistPayload || artistFromSongs, {
    id,
    name: inferredName,
  });

  const songs = rawSongs
    .map((song) => {
      const fallbackArtists = normalizeArtists({
        artist_id: artist?.id ?? id,
        artist_name:
          artist?.name ||
          artist?.alias ||
          song?.artist_name ||
          song?.artist?.name ||
          "",
      });
      const artists = normalizeArtists({
        ...song,
        artists: song?.artists || fallbackArtists,
      });

      return toPlayableSong({
        ...song,
        artist_name: getArtistLabel(
          { ...song, artists },
          artist?.name || artist?.alias || ""
        ),
        artist_id: getPrimaryArtistId({ ...song, artists }) ?? artist?.id ?? id,
        artists,
      });
    })
    .filter((song) => song?.id);

  const albums = rawAlbums
    .map((album) => normalizeArtistAlbum(album, artist))
    .filter((album) => album?.id || album?.title)
    .sort((first, second) => getTimestamp(second) - getTimestamp(first));

  return {
    artist,
    songs,
    albums,
  };
}
