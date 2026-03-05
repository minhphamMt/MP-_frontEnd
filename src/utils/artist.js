const toArtistObject = (artist, fallbackSortOrder = 0) => {
  if (!artist) return null;

  if (typeof artist === "string") {
    const name = artist.trim();
    if (!name) return null;
    return {
      id: null,
      name,
      role: "featured",
      sort_order: fallbackSortOrder,
    };
  }

  const id = artist.id ?? artist.artist_id ?? artist.artistId ?? null;
  const name =
    artist.name ??
    artist.artist_name ??
    artist.alias ??
    artist.display_name ??
    artist.title ??
    "";

  if (!name) return null;

  return {
    id: id === null || id === undefined || id === "" ? null : Number(id) || id,
    name: String(name).trim(),
    role: artist.role ?? artist.artist_role ?? "featured",
    sort_order:
      artist.sort_order ??
      artist.sortOrder ??
      artist.order ??
      fallbackSortOrder,
  };
};

const dedupeArtists = (list = []) => {
  const seen = new Set();
  return list.filter((artist) => {
    const key = artist.id ? `id:${artist.id}` : `name:${artist.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const normalizeArtists = (input = {}) => {
  const source = input?.song ?? input ?? {};
  const rawArtists = source.artists ?? input?.artists ?? [];

  const normalizedFromArray = Array.isArray(rawArtists)
    ? rawArtists
        .map((artist, index) => toArtistObject(artist, index))
        .filter(Boolean)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    : [];

  if (normalizedFromArray.length) {
    return dedupeArtists(normalizedFromArray);
  }

  const fallbackSingleArtist = toArtistObject(
    source.artist ?? input?.artist,
    0
  );
  if (fallbackSingleArtist) {
    return [fallbackSingleArtist];
  }

  const fallbackArtistName =
    source.artist_name ??
    source.artistName ??
    input?.artist_name ??
    input?.artistName ??
    "";

  const fallbackArtistId =
    source.artist_id ??
    source.artistId ??
    input?.artist_id ??
    input?.artistId;

  if (!fallbackArtistName) return [];

  const parts = String(fallbackArtistName)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return [
      {
        id: fallbackArtistId ?? null,
        name: parts[0] || String(fallbackArtistName).trim(),
        role: "main",
        sort_order: 0,
      },
    ];
  }

  return dedupeArtists(
    parts.map((name, index) => ({
      id: index === 0 ? fallbackArtistId ?? null : null,
      name,
      role: index === 0 ? "main" : "featured",
      sort_order: index,
    }))
  );
};

export const getArtistLabel = (input = {}, fallback = "") => {
  const artists = normalizeArtists(input);
  if (artists.length) {
    return artists
      .map((artist) => artist.name)
      .filter(Boolean)
      .join(", ");
  }

  return fallback || "";
};

export const getPrimaryArtistId = (input = {}) => {
  const artists = normalizeArtists(input);
  const firstArtist = artists.find((artist) => artist?.id);
  return (
    firstArtist?.id ??
    input?.artist_id ??
    input?.artistId ??
    input?.artist?.id ??
    null
  );
};
