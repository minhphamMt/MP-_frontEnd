import { normalizeAlbumId } from "../store/album-like.store";
import { normalizeSongId } from "../store/player.store";
import { getArtistLabel, getPrimaryArtistId } from "./artist";

export const slugify = (value = "") => {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "";
};

const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
};

const buildEntityPath = (segment, id, slugSource = "") => {
  const normalizedId = normalizeId(id);
  if (!normalizedId) return null;

  const slug = slugify(slugSource);
  return slug
    ? `/${segment}/${normalizedId}/${slug}`
    : `/${segment}/${normalizedId}`;
};

export const getSongPath = (song) =>
  buildEntityPath("song", normalizeSongId(song), song?.title || song?.name || "");

export const getAlbumPath = (album) =>
  buildEntityPath(
    "album",
    normalizeAlbumId(album) ?? album?.id ?? album?.album_id ?? album?.albumId,
    album?.title || album?.name || ""
  );

export const getArtistPath = (artist) =>
  buildEntityPath(
    "artist",
    getPrimaryArtistId(artist) ??
      artist?.artist_id ??
      artist?.id ??
      artist?.artistId,
    getArtistLabel(
      artist,
      artist?.artist_name || artist?.name || artist?.alias || artist?.title || ""
    )
  );

export const getArtistSongsPath = (artist) => {
  const basePath = getArtistPath(artist);
  return basePath ? `${basePath}/songs` : null;
};

export const getArtistAlbumsPath = (artist) => {
  const basePath = getArtistPath(artist);
  return basePath ? `${basePath}/albums` : null;
};

