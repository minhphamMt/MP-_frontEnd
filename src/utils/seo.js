export const SITE_NAME = "Khoaluan Music";
export const DEFAULT_SITE_DESCRIPTION =
  "Nghe nhạc, khám phá bài hát, album, playlist và nghệ sĩ trên Khoaluan Music.";
export const DEFAULT_SOCIAL_IMAGE = "/logo-brand.png";
export const DEFAULT_LANGUAGE = "vi-VN";
export const DEFAULT_OG_LOCALE = "vi_VN";

const trimTrailingSlash = (value = "") => String(value || "").replace(/\/+$/, "");

const removeEmpty = (value) => {
  if (Array.isArray(value)) {
    const nextValue = value
      .map((item) => removeEmpty(item))
      .filter((item) => item !== undefined);

    return nextValue.length ? nextValue : undefined;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).reduce((acc, [key, item]) => {
      const cleaned = removeEmpty(item);
      if (cleaned !== undefined) {
        acc[key] = cleaned;
      }
      return acc;
    }, {});

    return Object.keys(entries).length ? entries : undefined;
  }

  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  return value;
};

export const getSiteUrl = () => {
  const envSiteUrl = trimTrailingSlash(import.meta.env.VITE_SITE_URL || "");
  if (envSiteUrl) return envSiteUrl;

  if (typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }

  return "";
};

export const toAbsoluteSiteUrl = (value = "") => {
  if (!value) return getSiteUrl();
  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = getSiteUrl();
  const normalizedPath = String(value).startsWith("/")
    ? String(value)
    : `/${String(value).replace(/^\/+/, "")}`;

  if (!baseUrl) return normalizedPath;
  return new URL(normalizedPath, `${baseUrl}/`).toString();
};

export const secondsToIsoDuration = (seconds) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  if (!totalSeconds) return undefined;

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  let value = "PT";
  if (hours) value += `${hours}H`;
  if (minutes) value += `${minutes}M`;
  if (remainingSeconds || value === "PT") value += `${remainingSeconds}S`;
  return value;
};

export const buildBreadcrumbJsonLd = (items = []) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item?.name,
      item: item?.url ? toAbsoluteSiteUrl(item.url) : undefined,
    })),
  });

export const buildWebSiteJsonLd = ({
  name = SITE_NAME,
  description = DEFAULT_SITE_DESCRIPTION,
  url = "/",
  searchPath = "/search?q={search_term_string}",
} = {}) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    inLanguage: DEFAULT_LANGUAGE,
    url: toAbsoluteSiteUrl(url),
    potentialAction: {
      "@type": "SearchAction",
      target: toAbsoluteSiteUrl(searchPath),
      "query-input": "required name=search_term_string",
    },
  });

export const buildCollectionPageJsonLd = ({
  name,
  description,
  url,
  image,
  breadcrumb,
} = {}) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    inLanguage: DEFAULT_LANGUAGE,
    url: toAbsoluteSiteUrl(url || ""),
    image: image ? [toAbsoluteSiteUrl(image)] : undefined,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: getSiteUrl() || undefined,
    },
    breadcrumb: breadcrumb?.length ? buildBreadcrumbJsonLd(breadcrumb) : undefined,
  });

export const buildMusicGroupJsonLd = ({
  name,
  description,
  url,
  image,
  sameAs,
  albumUrls,
  trackUrls,
} = {}) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name,
    description,
    url: toAbsoluteSiteUrl(url || ""),
    image: image ? [toAbsoluteSiteUrl(image)] : undefined,
    sameAs,
    inLanguage: DEFAULT_LANGUAGE,
    album: albumUrls?.map((item) => toAbsoluteSiteUrl(item)),
    track: trackUrls?.map((item) => toAbsoluteSiteUrl(item)),
  });

export const buildMusicAlbumJsonLd = ({
  name,
  description,
  url,
  image,
  artistName,
  artistUrl,
  datePublished,
  numTracks,
  tracks,
} = {}) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name,
    description,
    url: toAbsoluteSiteUrl(url || ""),
    image: image ? [toAbsoluteSiteUrl(image)] : undefined,
    datePublished,
    numTracks: numTracks || undefined,
    byArtist: artistName
      ? {
          "@type": "MusicGroup",
          name: artistName,
          url: artistUrl ? toAbsoluteSiteUrl(artistUrl) : undefined,
        }
      : undefined,
    track: tracks?.map((track, index) =>
      removeEmpty({
        "@type": "MusicRecording",
        position: index + 1,
        name: track?.name,
        url: track?.url ? toAbsoluteSiteUrl(track.url) : undefined,
        duration: secondsToIsoDuration(track?.duration),
        byArtist: track?.artistName
          ? {
              "@type": "MusicGroup",
              name: track.artistName,
              url: track?.artistUrl ? toAbsoluteSiteUrl(track.artistUrl) : undefined,
            }
          : undefined,
      })
    ),
  });

export const buildMusicRecordingJsonLd = ({
  name,
  description,
  url,
  image,
  duration,
  datePublished,
  artistName,
  artistUrl,
  albumName,
  albumUrl,
  interactionCount,
} = {}) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name,
    description,
    url: toAbsoluteSiteUrl(url || ""),
    image: image ? [toAbsoluteSiteUrl(image)] : undefined,
    duration: secondsToIsoDuration(duration),
    datePublished,
    inLanguage: DEFAULT_LANGUAGE,
    byArtist: artistName
      ? {
          "@type": "MusicGroup",
          name: artistName,
          url: artistUrl ? toAbsoluteSiteUrl(artistUrl) : undefined,
        }
      : undefined,
    inAlbum: albumName
      ? {
          "@type": "MusicAlbum",
          name: albumName,
          url: albumUrl ? toAbsoluteSiteUrl(albumUrl) : undefined,
        }
      : undefined,
    interactionStatistic:
      Number(interactionCount) > 0
        ? {
            "@type": "InteractionCounter",
            interactionType: "https://schema.org/ListenAction",
            userInteractionCount: Number(interactionCount),
          }
        : undefined,
  });

