import { promises as fs } from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const distDir = path.join(cwd, "dist");
const templatePath = path.join(distDir, "index.html");
const robotsPath = path.join(distDir, "robots.txt");
const sitemapPath = path.join(distDir, "sitemap.xml");

const ENV_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
];

const SITE_NAME = "Khoaluan Music";
const DEFAULT_DESCRIPTION =
  "Nghe nhac, kham pha bai hat, album va nghe si tren Khoaluan Music.";
const DEFAULT_IMAGE = "/logo-brand.png";
const DEFAULT_LANGUAGE = "vi-VN";
const DEFAULT_LOCALE = "vi_VN";
const PAGE_LIMIT = 100;
const MAX_PAGES = 30;
const PRERENDER_LIMITS = {
  songs: 350,
  albums: 180,
  artists: 140,
};
const REGION_LABELS = {
  vietnam: "Viet Nam",
  usuk: "US-UK",
  kpop: "K-Pop",
};

const DISALLOWED_ROUTES = [
  "/403",
  "/404",
  "/__seo",
  "/admin",
  "/artist-auth",
  "/artist-request",
  "/artist/albums",
  "/artist/dashboard",
  "/artist/profile",
  "/artist/songs",
  "/artist/trash",
  "/history",
  "/library",
  "/login",
  "/me",
  "/playlists",
  "/register",
  "/search",
  "/verify-email",
];

const PREVIEW_STYLE = `
<style data-seo-prerender>
  :root { color-scheme: dark; }
  body { margin: 0; background: #050705; color: #f4f7f4; font-family: "Segoe UI", system-ui, sans-serif; }
  #seo-prerender { max-width: 1100px; margin: 0 auto; padding: 40px 20px 72px; }
  .seo-breadcrumbs { display: flex; flex-wrap: wrap; gap: 8px; font-size: 14px; color: #a7b2a7; margin-bottom: 18px; }
  .seo-breadcrumbs a { color: #d7f5d3; text-decoration: none; }
  .seo-hero { display: grid; gap: 24px; align-items: start; margin-bottom: 32px; }
  .seo-cover { width: min(280px, 100%); border-radius: 24px; box-shadow: 0 20px 48px rgba(0, 0, 0, 0.35); }
  .seo-eyebrow { display: inline-block; padding: 6px 10px; border-radius: 999px; background: rgba(145, 255, 165, 0.12); color: #aef0b4; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
  .seo-title { margin: 14px 0 12px; font-size: clamp(32px, 6vw, 54px); line-height: 1.04; }
  .seo-description { margin: 0; color: #d4ddd4; font-size: 17px; line-height: 1.7; max-width: 72ch; }
  .seo-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 18px; }
  .seo-stat { padding: 10px 14px; border-radius: 16px; background: rgba(255, 255, 255, 0.06); }
  .seo-stat strong { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #98a598; }
  .seo-stat span { display: block; margin-top: 4px; color: #f4f7f4; font-size: 15px; }
  .seo-section { margin-top: 28px; padding: 22px 22px 10px; border-radius: 24px; background: rgba(255, 255, 255, 0.04); }
  .seo-section h2 { margin: 0 0 8px; font-size: 23px; }
  .seo-section p { margin: 0 0 18px; color: #bcc6bc; line-height: 1.7; }
  .seo-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
  .seo-item { padding: 16px 18px; border-radius: 18px; background: rgba(255, 255, 255, 0.045); }
  .seo-item a { color: #ffffff; text-decoration: none; font-weight: 600; }
  .seo-item small { display: block; margin-top: 6px; color: #9cab9c; line-height: 1.6; }
  .seo-item span { color: #d4ddd4; }
  @media (min-width: 860px) {
    .seo-hero.with-cover { grid-template-columns: 280px minmax(0, 1fr); }
  }
</style>`;

const injectStaticVerificationMeta = (template = "", googleSiteVerification = "") => {
  const cleanTemplate = String(template || "").replace(
    /<meta[^>]+name=["']google-site-verification["'][^>]*>\s*/gi,
    ""
  );

  if (!googleSiteVerification) return cleanTemplate;

  return cleanTemplate.replace(
    "</head>",
    `  <meta name="google-site-verification" content="${escapeHtml(googleSiteVerification)}" />\n</head>`
  );
};

const parseEnvContent = (content = "") =>
  content.split(/\r?\n/).reduce((acc, rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return acc;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) return acc;

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key) acc[key] = value;
    return acc;
  }, {});

const loadEnvValues = async () => {
  const loaded = {};

  for (const fileName of ENV_FILES) {
    try {
      const content = await fs.readFile(path.join(cwd, fileName), "utf8");
      Object.assign(loaded, parseEnvContent(content));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return loaded;
};

const normalizeSiteUrl = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  try {
    const normalized = new URL(trimmed);
    normalized.pathname = normalized.pathname.replace(/\/+$/, "");
    normalized.hash = "";
    normalized.search = "";
    return normalized.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
};

const toAbsoluteUrl = (siteUrl, value = "") => {
  if (!value) return siteUrl || "";
  if (/^https?:\/\//i.test(value)) return value;
  if (!siteUrl) return value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`;
  return new URL(value.startsWith("/") ? value : `/${value.replace(/^\/+/, "")}`, `${siteUrl}/`).toString();
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const stripHtml = (value = "") =>
  String(value || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncateText = (value = "", length = 160) => {
  const normalized = stripHtml(value);
  if (normalized.length <= length) return normalized;
  return `${normalized.slice(0, Math.max(0, length - 3)).trim()}...`;
};

const escapeHtml = (value = "") =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const slugify = (value = "") =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "";

const asNumber = (value) => {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
};

const normalizeDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
};

const formatDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDuration = (value) => {
  const seconds = Math.max(0, Math.round(asNumber(value)));
  if (!seconds) return "";

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

const formatCount = (value) => {
  const count = asNumber(value);
  return count > 0 ? count.toLocaleString("vi-VN") : "";
};

const mergeDefined = (previous = {}, next = {}) => {
  const merged = { ...previous };

  for (const [key, value] of Object.entries(next)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && !value.trim()) continue;
    if (Array.isArray(value) && !value.length) continue;
    merged[key] = value;
  }

  return merged;
};

const pushGrouped = (map, key, value) => {
  if (!key || !value?.id) return;
  const normalizedKey = String(key);
  const current = map.get(normalizedKey) || [];
  if (!current.some((item) => String(item.id) === String(value.id))) {
    current.push(value);
    map.set(normalizedKey, current);
  }
};

const removeEmpty = (value) => {
  if (Array.isArray(value)) {
    const nextValue = value.map(removeEmpty).filter((item) => item !== undefined);
    return nextValue.length ? nextValue : undefined;
  }

  if (value && typeof value === "object") {
    const nextValue = Object.entries(value).reduce((acc, [key, item]) => {
      const cleaned = removeEmpty(item);
      if (cleaned !== undefined) acc[key] = cleaned;
      return acc;
    }, {});
    return Object.keys(nextValue).length ? nextValue : undefined;
  }

  if (value === "" || value === null || value === undefined) return undefined;
  return value;
};

const prioritizeEntities = (items = [], relatedIds = [], limit = items.length) => {
  const wanted = new Set(
    ensureArray(relatedIds)
      .filter(Boolean)
      .map((value) => String(value))
  );
  const ordered = [
    ...items.filter((item) => wanted.has(String(item?.id))),
    ...items.filter((item) => !wanted.has(String(item?.id))),
  ];
  const seen = new Set();

  return ordered
    .filter((item) => {
      const id = item?.id ? String(item.id) : "";
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, limit);
};

const buildSongPath = (song) => {
  const id = song?.id ? String(song.id) : "";
  if (!id) return null;
  const slug = slugify(song?.title || song?.name || "");
  return slug ? `/song/${id}/${slug}` : `/song/${id}`;
};

const buildAlbumPath = (album) => {
  const id = album?.id ? String(album.id) : "";
  if (!id) return null;
  const slug = slugify(album?.title || album?.name || "");
  return slug ? `/album/${id}/${slug}` : `/album/${id}`;
};

const buildArtistPath = (artist) => {
  const id = artist?.id ? String(artist.id) : "";
  if (!id) return null;
  const slug = slugify(artist?.name || artist?.artist_name || artist?.alias || "");
  return slug ? `/artist/${id}/${slug}` : `/artist/${id}`;
};

const buildArtistSongsPath = (artist) => {
  const basePath = buildArtistPath(artist);
  return basePath ? `${basePath}/songs` : null;
};

const buildArtistAlbumsPath = (artist) => {
  const basePath = buildArtistPath(artist);
  return basePath ? `${basePath}/albums` : null;
};

const buildApiUrl = (apiUrl, endpoint, params = {}) => {
  const normalizedApiUrl = `${String(apiUrl || "").replace(/\/+$/, "")}/`;
  const url = new URL(String(endpoint || "").replace(/^\/+/, ""), normalizedApiUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
};

const fetchJson = async (apiUrl, endpoint, params = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(buildApiUrl(apiUrl, endpoint, params), {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchPagedCollection = async (apiUrl, endpoint, normalizeItem) => {
  const results = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const payload = await fetchJson(apiUrl, endpoint, { page, limit: PAGE_LIMIT });
    const rawItems = ensureArray(payload?.data);
    if (!rawItems.length) break;

    results.push(...rawItems.map(normalizeItem).filter((item) => item?.id));

    const totalPages = asNumber(payload?.meta?.totalPages);
    const limitValue = asNumber(payload?.meta?.limit) || PAGE_LIMIT;
    if ((totalPages && page >= totalPages) || rawItems.length < limitValue) break;
  }

  return results;
};

const normalizeArtist = (value = {}) => ({
  id: value?.id ?? value?.artist_id ?? value?.artistId ?? null,
  name: value?.name || value?.artist_name || value?.alias || "",
  alias: value?.alias || "",
  bio: stripHtml(value?.bio || value?.description || ""),
  shortBio: stripHtml(value?.short_bio || value?.shortBio || ""),
  avatarUrl: value?.avatar_url || value?.avatar || value?.cover_url || "",
  coverUrl: value?.cover_url || value?.cover || value?.avatar_url || "",
  followCount: asNumber(value?.follow_count),
  songCount: asNumber(value?.song_count),
  albumCount: asNumber(value?.album_count),
  realname: value?.realname || "",
  national: value?.national || "",
  birthday: normalizeDate(value?.birthday),
});

const normalizeAlbum = (value = {}) => ({
  id: value?.id ?? value?.album_id ?? value?.albumId ?? null,
  title: value?.title || value?.name || "",
  artistId: value?.artist_id ?? value?.artistId ?? value?.artist?.id ?? null,
  artistName: value?.artist_name || value?.artist?.name || "",
  coverUrl: value?.cover_url || value?.cover || value?.thumbnail || "",
  releaseDate: normalizeDate(value?.release_date || value?.releaseDate || value?.created_at),
  songCount: asNumber(value?.song_count),
});

const normalizeSong = (value = {}) => {
  const artists = ensureArray(value?.artists)
    .map((artist) => normalizeArtist(artist))
    .filter((artist) => artist?.id || artist?.name);
  const artistName =
    artists[0]?.name || value?.artist_name || value?.artist?.name || value?.artist?.alias || "";
  const artistId = artists[0]?.id ?? value?.artist_id ?? value?.artist?.id ?? null;
  const albumId = value?.album_id ?? value?.album?.id ?? value?.albumId ?? null;

  return {
    id: value?.id ?? value?.song_id ?? value?.songId ?? null,
    title: value?.title || value?.name || "",
    artistId,
    artistName,
    artists,
    albumId,
    albumTitle: value?.album_title || value?.album?.title || value?.album?.name || "",
    coverUrl: value?.cover_url || value?.cover || value?.album?.cover_url || "",
    duration: asNumber(value?.duration),
    playCount: asNumber(
      value?.play_count ?? value?.weekly_play_count ?? value?.periodPlayCount
    ),
    releaseDate: normalizeDate(
      value?.release_date || value?.releaseDate || value?.created_at
    ),
    genres: ensureArray(value?.genres)
      .map((genre) => genre?.name || genre)
      .filter(Boolean),
    rank: asNumber(value?.rank),
  };
};

const sortSongs = (items = []) =>
  [...items].sort(
    (first, second) =>
      asNumber(second.playCount) - asNumber(first.playCount) ||
      new Date(second.releaseDate || 0).getTime() -
        new Date(first.releaseDate || 0).getTime() ||
      String(first.title || "").localeCompare(String(second.title || ""), "vi")
  );

const sortAlbums = (items = []) =>
  [...items].sort(
    (first, second) =>
      new Date(second.releaseDate || 0).getTime() -
        new Date(first.releaseDate || 0).getTime() ||
      asNumber(second.songCount) - asNumber(first.songCount) ||
      String(first.title || "").localeCompare(String(second.title || ""), "vi")
  );

const sortArtists = (items = []) =>
  [...items].sort(
    (first, second) =>
      asNumber(second.followCount) - asNumber(first.followCount) ||
      asNumber(second.songCount) - asNumber(first.songCount) ||
      String(first.name || "").localeCompare(String(second.name || ""), "vi")
  );

const renderSongItem = (song, index) => {
  const details = [song.artistName, song.albumTitle, formatDuration(song.duration)]
    .filter(Boolean)
    .join(" • ");
  const badge = song.rank || index ? `<span>#${song.rank || index}</span> ` : "";
  return `<li class="seo-item"><a href="${escapeHtml(
    buildSongPath(song) || "/"
  )}">${badge}${escapeHtml(song.title || "Bai hat")}</a><small>${escapeHtml(
    details
  )}</small></li>`;
};

const renderAlbumItem = (album) => {
  const details = [
    album.artistName,
    formatDate(album.releaseDate),
    album.songCount ? `${album.songCount} bai hat` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  return `<li class="seo-item"><a href="${escapeHtml(
    buildAlbumPath(album) || "/albums"
  )}">${escapeHtml(album.title || "Album")}</a><small>${escapeHtml(
    details
  )}</small></li>`;
};

const renderArtistItem = (artist) => {
  const details = [artist.alias, artist.national, artist.songCount ? `${artist.songCount} bai hat` : ""]
    .filter(Boolean)
    .join(" • ");
  return `<li class="seo-item"><a href="${escapeHtml(
    buildArtistPath(artist) || "/"
  )}">${escapeHtml(artist.name || "Nghe si")}</a><small>${escapeHtml(
    details || artist.shortBio || artist.bio || "Nghe si tren Khoaluan Music."
  )}</small></li>`;
};

const renderGenreItem = (group) => {
  const preview = ensureArray(group?.songs)
    .slice(0, 3)
    .map((song) => song.title)
    .filter(Boolean)
    .join(", ");
  return `<li class="seo-item"><a href="${escapeHtml(`/top-50/${group.id}`)}">${escapeHtml(
    group.name || "Top 50"
  )}</a><small>${escapeHtml(
    preview || "Bang xep hang nhac duoc cap nhat tren Khoaluan Music."
  )}</small></li>`;
};

const renderSection = ({ title, description, items = [] }) => {
  if (!items.length) return "";
  return `<section class="seo-section"><h2>${escapeHtml(
    title
  )}</h2><p>${escapeHtml(description)}</p><ul class="seo-list">${items.join(
    ""
  )}</ul></section>`;
};

const renderPageBody = ({
  eyebrow,
  title,
  description,
  image,
  breadcrumbs = [],
  stats = [],
  sections = [],
}) => {
  const breadcrumbMarkup = breadcrumbs.length
    ? `<nav class="seo-breadcrumbs">${breadcrumbs
        .map((item, index) =>
          item?.url && index !== breadcrumbs.length - 1
            ? `<a href="${escapeHtml(item.url)}">${escapeHtml(item.name)}</a>`
            : `<span>${escapeHtml(item?.name || "")}</span>`
        )
        .join("<span>/</span>")}</nav>`
    : "";

  const statsMarkup = stats.length
    ? `<div class="seo-stats">${stats
        .map(
          (item) =>
            `<div class="seo-stat"><strong>${escapeHtml(
              item.label
            )}</strong><span>${escapeHtml(item.value)}</span></div>`
        )
        .join("")}</div>`
    : "";

  const hasHeroContent = Boolean(eyebrow || title || description || image || stats.length);

  return `<main id="seo-prerender">${breadcrumbMarkup}${
    hasHeroContent
      ? `<section class="seo-hero${image ? " with-cover" : ""}">${
          image
            ? `<img class="seo-cover" src="${escapeHtml(image)}" alt="${escapeHtml(
                title
              )}" />`
            : ""
        }<div>${
          eyebrow ? `<span class="seo-eyebrow">${escapeHtml(eyebrow)}</span>` : ""
        }${
          title ? `<h1 class="seo-title">${escapeHtml(title)}</h1>` : ""
        }${
          description
            ? `<p class="seo-description">${escapeHtml(description)}</p>`
            : ""
        }${statsMarkup}</div></section>`
      : ""
  }${sections.filter(Boolean).join("")}</main>`;
};

const buildBreadcrumbSchema = (siteUrl, items = []) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item?.name,
      item: item?.url ? toAbsoluteUrl(siteUrl, item.url) : undefined,
    })),
  });

const buildWebsiteSchema = (siteUrl) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    inLanguage: DEFAULT_LANGUAGE,
    url: siteUrl || undefined,
    potentialAction: siteUrl
      ? {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        }
      : undefined,
  });

const buildOrganizationSchema = (siteUrl) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl || undefined,
    logo: toAbsoluteUrl(siteUrl, DEFAULT_IMAGE),
  });

const buildCollectionSchema = (siteUrl, page) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.title,
    description: page.description,
    inLanguage: DEFAULT_LANGUAGE,
    url: page.canonical ? toAbsoluteUrl(siteUrl, page.canonical) : undefined,
    image: page.image ? [toAbsoluteUrl(siteUrl, page.image)] : undefined,
  });

const buildMusicRecordingSchema = (siteUrl, song, artist, album) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: song.title,
    description: `${song.title} - ${song.artistName || artist?.name || SITE_NAME}`,
    inLanguage: DEFAULT_LANGUAGE,
    url: toAbsoluteUrl(siteUrl, buildSongPath(song)),
    image: song.coverUrl ? [toAbsoluteUrl(siteUrl, song.coverUrl)] : undefined,
    duration: song.duration ? `PT${Math.max(1, Math.round(song.duration))}S` : undefined,
    datePublished: song.releaseDate ? song.releaseDate.split("T")[0] : undefined,
    byArtist: artist?.name
      ? {
          "@type": "MusicGroup",
          name: artist.name,
          url: buildArtistPath(artist)
            ? toAbsoluteUrl(siteUrl, buildArtistPath(artist))
            : undefined,
        }
      : undefined,
    inAlbum: album?.title
      ? {
          "@type": "MusicAlbum",
          name: album.title,
          url: buildAlbumPath(album)
            ? toAbsoluteUrl(siteUrl, buildAlbumPath(album))
            : undefined,
        }
      : undefined,
  });

const buildMusicAlbumSchema = (siteUrl, album, artist, tracks = []) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    name: album.title,
    description: `${album.title} - ${album.artistName || artist?.name || SITE_NAME}`,
    inLanguage: DEFAULT_LANGUAGE,
    url: toAbsoluteUrl(siteUrl, buildAlbumPath(album)),
    image: album.coverUrl ? [toAbsoluteUrl(siteUrl, album.coverUrl)] : undefined,
    datePublished: album.releaseDate ? album.releaseDate.split("T")[0] : undefined,
    numTracks: tracks.length || album.songCount || undefined,
    byArtist: artist?.name
      ? {
          "@type": "MusicGroup",
          name: artist.name,
          url: buildArtistPath(artist)
            ? toAbsoluteUrl(siteUrl, buildArtistPath(artist))
            : undefined,
        }
      : undefined,
  });

const buildMusicGroupSchema = (siteUrl, artist) =>
  removeEmpty({
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    description: artist.shortBio || artist.bio || `${artist.name} tren ${SITE_NAME}`,
    inLanguage: DEFAULT_LANGUAGE,
    url: toAbsoluteUrl(siteUrl, buildArtistPath(artist)),
    image: artist.coverUrl ? [toAbsoluteUrl(siteUrl, artist.coverUrl)] : undefined,
  });

const buildDocument = (template, siteUrl, page) => {
  const cleanTemplate = template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta[^>]+name=["']description["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']robots["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']googlebot["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']keywords["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+property=["']og:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<meta[^>]+name=["']twitter:[^"']+["'][^>]*>\s*/gi, "")
    .replace(/<link[^>]+rel=["']canonical["'][^>]*>\s*/gi, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, "");

  const canonicalUrl = page.canonical ? toAbsoluteUrl(siteUrl, page.canonical) : "";
  const imageUrl = toAbsoluteUrl(siteUrl, page.image || DEFAULT_IMAGE);
  const robots = page.robots || "index, follow";
  const jsonLd = ensureArray(page.jsonLd)
    .map((item) => removeEmpty(item))
    .filter(Boolean)
    .map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`)
    .join("");

  const headTags = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}" />`,
    `<meta name="robots" content="${escapeHtml(robots)}" />`,
    `<meta name="googlebot" content="${escapeHtml(robots)}" />`,
    page.keywords
      ? `<meta name="keywords" content="${escapeHtml(page.keywords)}" />`
      : "",
    canonicalUrl
      ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
      : "",
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:locale" content="${escapeHtml(DEFAULT_LOCALE)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(page.description)}" />`,
    page.canonical
      ? `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
      : "",
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(page.title)}" />`,
    PREVIEW_STYLE,
    jsonLd,
  ]
    .filter(Boolean)
    .join("\n");

  return cleanTemplate
    .replace("</head>", `${headTags}\n</head>`)
    .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
};

const routeToFilePath = (route) =>
  route === "/"
    ? path.join(distDir, "index.html")
    : path.join(distDir, route.replace(/^\/+/, ""), "index.html");

const writeRoutePage = async (template, siteUrl, route, page) => {
  const filePath = routeToFilePath(route);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buildDocument(template, siteUrl, page), "utf8");
};

const createRobotsTxt = (siteUrl) => {
  const lines = ["User-agent: *", "Allow: /"];
  for (const route of DISALLOWED_ROUTES) lines.push(`Disallow: ${route}`);
  if (siteUrl) lines.push("", `Sitemap: ${siteUrl}/sitemap.xml`);
  return `${lines.join("\n")}\n`;
};

const createSitemapXml = (siteUrl, routes = []) => {
  const today = new Date().toISOString().split("T")[0];
  const items = [...new Set(routes)].sort();
  const urls = items
    .map((route) => {
      const loc = `${siteUrl}${route === "/" ? "" : route}`;
      return `  <url>\n    <loc>${escapeHtml(
        loc
      )}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${
        route === "/" ? "daily" : "weekly"
      }</changefreq>\n    <priority>${
        route === "/" ? "1.0" : "0.7"
      }</priority>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const buildNoindexPage = (title, description, canonical = "") => ({
  title,
  description,
  canonical,
  robots: "noindex, nofollow",
  image: DEFAULT_IMAGE,
  body: renderPageBody({
    eyebrow: "Khoaluan Music",
    title,
    description,
    sections: [],
  }),
  jsonLd: [],
});

const buildRedirectPage = (title, description, to) => ({
  title,
  description,
  canonical: to,
  robots: "noindex, follow",
  image: DEFAULT_IMAGE,
  body: `${renderPageBody({
    eyebrow: "Dang chuyen huong",
    title,
    description,
    sections: [
      renderSection({
        title: "Lien ket moi",
        description: "Trang nay da duoc chuyen sang URL chuan cho SEO va chia se lien ket.",
        items: [
          `<li class="seo-item"><a href="${escapeHtml(to)}">${escapeHtml(
            to
          )}</a><small>Neu trinh duyet khong tu dong chuyen, hay mo lien ket o tren.</small></li>`,
        ],
      }),
    ],
  })}<script>window.location.replace(${JSON.stringify(to)});</script>`,
  jsonLd: [],
});

const main = async () => {
  const envValues = await loadEnvValues();
  const siteUrl = normalizeSiteUrl(
    process.env.VITE_SITE_URL ||
      process.env.SITE_URL ||
      envValues.VITE_SITE_URL ||
      envValues.SITE_URL
  );
  const googleSiteVerification = String(
    process.env.VITE_GOOGLE_SITE_VERIFICATION ||
      process.env.GOOGLE_SITE_VERIFICATION ||
      envValues.VITE_GOOGLE_SITE_VERIFICATION ||
      envValues.GOOGLE_SITE_VERIFICATION ||
      ""
  ).trim();
  const apiUrl = normalizeSiteUrl(process.env.VITE_API_URL || envValues.VITE_API_URL);
  const rawTemplate = await fs.readFile(templatePath, "utf8");
  const template = injectStaticVerificationMeta(rawTemplate, googleSiteVerification);
  const indexableRoutes = [];

  const settled = await Promise.allSettled([
    apiUrl ? fetchPagedCollection(apiUrl, "/songs", normalizeSong) : Promise.resolve([]),
    apiUrl ? fetchPagedCollection(apiUrl, "/albums", normalizeAlbum) : Promise.resolve([]),
    apiUrl ? fetchPagedCollection(apiUrl, "/artists", normalizeArtist) : Promise.resolve([]),
    apiUrl ? fetchJson(apiUrl, "/charts/top-50/genres") : Promise.resolve({ data: [] }),
    apiUrl ? fetchJson(apiUrl, "/charts/zing", { limit: 10 }) : Promise.resolve({ data: [] }),
    apiUrl
      ? fetchJson(apiUrl, "/charts/regions", { region: "vietnam", limit: 10 })
      : Promise.resolve({ data: {} }),
    apiUrl ? fetchJson(apiUrl, "/charts/weekly/top5") : Promise.resolve({ data: [] }),
    apiUrl
      ? fetchJson(apiUrl, "/charts/new-release", { page: 1, limit: 12 })
      : Promise.resolve({ data: { songs: [] } }),
  ]);

  const songs = settled[0].status === "fulfilled" ? settled[0].value : [];
  const albums = settled[1].status === "fulfilled" ? settled[1].value : [];
  const artists = settled[2].status === "fulfilled" ? settled[2].value : [];
  const topGenres =
    settled[3].status === "fulfilled"
      ? ensureArray(settled[3].value?.data).map((item) => ({
          id: item?.genre?.id ?? item?.id ?? null,
          name: item?.genre?.name || item?.name || "",
          songs: ensureArray(item?.songs)
            .map((song) => normalizeSong(song))
            .filter((song) => song?.id),
        }))
      : [];
  const zingSongs =
    settled[4].status === "fulfilled"
      ? ensureArray(settled[4].value?.data).map((item) =>
          normalizeSong({
            ...item?.song,
            artist: item?.artist,
            rank: item?.rank,
            periodPlayCount: item?.periodPlayCount,
          })
        )
      : [];
  const regionPayload = settled[5].status === "fulfilled" ? settled[5].value?.data : {};
  const weeklySongs =
    settled[6].status === "fulfilled"
      ? ensureArray(settled[6].value?.data).map((item) => normalizeSong(item))
      : [];
  const newReleaseSongs =
    settled[7].status === "fulfilled"
      ? ensureArray(settled[7].value?.data?.songs).map((item) => normalizeSong(item))
      : [];

  const artistMap = new Map();
  const albumMap = new Map();
  const songMap = new Map();

  for (const artist of artists) {
    if (artist?.id) artistMap.set(String(artist.id), artist);
  }

  for (const album of albums) {
    if (!album?.id) continue;
    albumMap.set(String(album.id), album);
    if (album.artistId) {
      artistMap.set(
        String(album.artistId),
        mergeDefined(artistMap.get(String(album.artistId)), {
          id: album.artistId,
          name: album.artistName,
        })
      );
    }
  }

  const mergedSongs = [
    ...songs,
    ...zingSongs,
    ...weeklySongs,
    ...newReleaseSongs,
    ...topGenres.flatMap((group) => group.songs),
    ...Object.values(regionPayload || {}).flatMap((items) =>
      Array.isArray(items) ? items.map((item) => normalizeSong(item)) : []
    ),
  ];

  for (const song of mergedSongs) {
    if (!song?.id) continue;
    songMap.set(String(song.id), mergeDefined(songMap.get(String(song.id)), song));
    if (song.artistId) {
      artistMap.set(
        String(song.artistId),
        mergeDefined(artistMap.get(String(song.artistId)), {
          id: song.artistId,
          name: song.artistName,
        })
      );
    }
    if (song.albumId) {
      albumMap.set(
        String(song.albumId),
        mergeDefined(albumMap.get(String(song.albumId)), {
          id: song.albumId,
          title: song.albumTitle,
          artistId: song.artistId,
          artistName: song.artistName,
          coverUrl: song.coverUrl,
          releaseDate: song.releaseDate,
        })
      );
    }
  }

  const finalSongs = sortSongs(Array.from(songMap.values()));
  const finalAlbums = sortAlbums(Array.from(albumMap.values()));
  const finalArtists = sortArtists(Array.from(artistMap.values()));
  const prerenderSongs = prioritizeEntities(
    finalSongs,
    [
      ...newReleaseSongs.slice(0, 40).map((song) => song.id),
      ...zingSongs.slice(0, 60).map((song) => song.id),
      ...weeklySongs.slice(0, 40).map((song) => song.id),
      ...topGenres.flatMap((group) => group.songs.slice(0, 8).map((song) => song.id)),
    ],
    PRERENDER_LIMITS.songs
  );
  const prerenderAlbums = prioritizeEntities(
    finalAlbums,
    prerenderSongs.map((song) => song.albumId),
    PRERENDER_LIMITS.albums
  );
  const prerenderArtists = prioritizeEntities(
    finalArtists,
    [
      ...prerenderSongs.map((song) => song.artistId),
      ...prerenderAlbums.map((album) => album.artistId),
    ],
    PRERENDER_LIMITS.artists
  );
  const songsByAlbumId = new Map();
  const songsByArtistId = new Map();
  const albumsByArtistId = new Map();

  for (const song of prerenderSongs) {
    pushGrouped(songsByAlbumId, song.albumId, song);
    pushGrouped(songsByArtistId, song.artistId, song);
  }

  for (const album of prerenderAlbums) {
    pushGrouped(albumsByArtistId, album.artistId, album);
  }

  const homePage = {
    title: `${SITE_NAME} | Nghe nhac truc tuyen`,
    description: DEFAULT_DESCRIPTION,
    canonical: "/",
    image: DEFAULT_IMAGE,
    keywords: "nghe nhac, bai hat, album, nghe si, zing chart, top 50",
    body: renderPageBody({
      sections: [
        renderSection({
          title: "Bai hat moi va duoc nghe nhieu",
          description:
            "Cap nhat nhac moi cung nhung bai hat noi bat tu bang xep hang va tuan nay.",
          items: [...prerenderSongs.slice(0, 6), ...zingSongs.slice(0, 6)]
            .slice(0, 10)
            .map((song, index) => renderSongItem(song, index + 1)),
        }),
        renderSection({
          title: "Album dang chu y",
          description:
            "Tong hop album moi va album co nhieu bai hat noi bat tren Khoaluan Music.",
          items: prerenderAlbums.slice(0, 10).map(renderAlbumItem),
        }),
        renderSection({
          title: "Top 50 theo chu de",
          description:
            "Cac bo suu tap top 50 giup bot tim thay trang chuyen muc va chi tiet nhanh hon.",
          items: topGenres.slice(0, 8).map(renderGenreItem),
        }),
      ],
    }),
    jsonLd: [buildWebsiteSchema(siteUrl), buildOrganizationSchema(siteUrl)],
  };

  await writeRoutePage(template, siteUrl, "/", homePage);
  indexableRoutes.push("/");

  const staticCollectionPages = [
    {
      route: "/albums",
      title: `Albums | ${SITE_NAME}`,
      description:
        "Kham pha album moi, album noi bat va bo suu tap nhac duoc cap nhat lien tuc.",
      items: prerenderAlbums.slice(0, 30).map(renderAlbumItem),
    },
    {
      route: "/new-release",
      title: `Nhac moi | ${SITE_NAME}`,
      description:
        "Danh sach bai hat moi phat hanh, cap nhat nhanh cho nguoi nghe va cong cu tim kiem.",
      items: prerenderSongs
        .slice(0, 30)
        .map((song, index) => renderSongItem(song, index + 1)),
    },
    {
      route: "/top-50",
      title: `Top 50 | ${SITE_NAME}`,
      description: "Bang tong hop top 50 theo tung chu de va the loai tren Khoaluan Music.",
      items: topGenres.map(renderGenreItem),
    },
    {
      route: "/zing-chart",
      title: `Zing Chart | ${SITE_NAME}`,
      description:
        "Bang xep hang bai hat noi bat duoc nguoi nghe quan tam tren Khoaluan Music.",
      items: zingSongs
        .slice(0, 30)
        .map((song, index) => renderSongItem(song, song.rank || index + 1)),
    },
  ];

  for (const page of staticCollectionPages) {
    const document = {
      title: page.title,
      description: page.description,
      canonical: page.route,
      image: DEFAULT_IMAGE,
      keywords: "nhac moi, album, bang xep hang, top 50, zing chart",
      body: renderPageBody({
        eyebrow: SITE_NAME,
        title: page.title.replace(` | ${SITE_NAME}`, ""),
        description: page.description,
        breadcrumbs: [
          { name: "Trang chu", url: "/" },
          { name: page.title.replace(` | ${SITE_NAME}`, ""), url: page.route },
        ],
        sections: [
          renderSection({
            title: "Noi dung",
            description: page.description,
            items: page.items,
          }),
        ],
      }),
      jsonLd: [buildCollectionSchema(siteUrl, { ...page, image: DEFAULT_IMAGE })],
    };

    await writeRoutePage(template, siteUrl, page.route, document);
    indexableRoutes.push(page.route);
  }

  for (const [regionKey, regionLabel] of Object.entries(REGION_LABELS)) {
    const songsForRegion = ensureArray(regionPayload?.[regionKey]).map((item) =>
      normalizeSong(item)
    );
    const route = `/zing-chart/region/${regionKey}`;

    await writeRoutePage(template, siteUrl, route, {
      title: `${regionLabel} Chart | ${SITE_NAME}`,
      description: `Bang xep hang ${regionLabel} voi danh sach bai hat duoc nghe nhieu tren Khoaluan Music.`,
      canonical: route,
      image: DEFAULT_IMAGE,
      keywords: `${regionLabel}, zing chart, bai hat hot`,
      body: renderPageBody({
        eyebrow: "Regional Chart",
        title: `${regionLabel} Chart`,
        description: `Cap nhat bai hat noi bat trong khu vuc ${regionLabel}.`,
        breadcrumbs: [
          { name: "Trang chu", url: "/" },
          { name: "Zing Chart", url: "/zing-chart" },
          { name: regionLabel, url: route },
        ],
        sections: [
          renderSection({
            title: `${regionLabel} noi bat`,
            description:
              "Danh sach bai hat de bot va mang xa hoi nhin thay noi dung cua trang chart ngay trong HTML.",
            items: songsForRegion
              .slice(0, 30)
              .map((song, index) => renderSongItem(song, index + 1)),
          }),
        ],
      }),
      jsonLd: [
        buildCollectionSchema(siteUrl, {
          title: `${regionLabel} Chart`,
          description: `Bang xep hang ${regionLabel}.`,
          canonical: route,
          image: DEFAULT_IMAGE,
        }),
      ],
    });
    indexableRoutes.push(route);
  }

  for (const group of topGenres) {
    if (!group?.id) continue;
    const route = `/top-50/${group.id}`;

    await writeRoutePage(template, siteUrl, route, {
      title: `${group.name} Top 50 | ${SITE_NAME}`,
      description: truncateText(
        `Top 50 bai hat noi bat thuoc chu de ${group.name} tren Khoaluan Music.`,
        155
      ),
      canonical: route,
      image: group.songs[0]?.coverUrl || DEFAULT_IMAGE,
      keywords: `${group.name}, top 50, bai hat`,
      body: renderPageBody({
        eyebrow: "Top 50",
        title: `${group.name} Top 50`,
        description: `Tong hop bai hat noi bat thuoc chu de ${group.name}.`,
        breadcrumbs: [
          { name: "Trang chu", url: "/" },
          { name: "Top 50", url: "/top-50" },
          { name: group.name, url: route },
        ],
        sections: [
          renderSection({
            title: "Danh sach bai hat",
            description:
              "Noi dung duoc prerender de cong cu tim kiem doc duoc ngay ca khi khong chay JavaScript.",
            items: group.songs
              .slice(0, 50)
              .map((song, index) => renderSongItem(song, index + 1)),
          }),
        ],
      }),
      jsonLd: [
        buildCollectionSchema(siteUrl, {
          title: `${group.name} Top 50`,
          description: `Top 50 bai hat ${group.name}.`,
          canonical: route,
          image: group.songs[0]?.coverUrl || DEFAULT_IMAGE,
        }),
        buildBreadcrumbSchema(siteUrl, [
          { name: "Trang chu", url: "/" },
          { name: "Top 50", url: "/top-50" },
          { name: group.name, url: route },
        ]),
      ],
    });
    indexableRoutes.push(route);
  }

  for (const song of finalSongs) {
    const canonical = buildSongPath(song);
    if (!canonical) continue;
    const artist = song.artistId ? artistMap.get(String(song.artistId)) : null;
    const album = song.albumId ? albumMap.get(String(song.albumId)) : null;
    const relatedSongs = ensureArray(songsByArtistId.get(String(song.artistId)))
      .filter((item) => String(item.id) !== String(song.id))
      .slice(0, 10);

    await writeRoutePage(template, siteUrl, canonical, {
      title: `${song.title} | ${song.artistName || SITE_NAME}`,
      description: truncateText(
        `${song.title} - ${song.artistName || "Nghe si"}${
          song.albumTitle ? `, thuoc album ${song.albumTitle}` : ""
        }. Nghe va kham pha tren ${SITE_NAME}.`
      ),
      canonical,
      image: song.coverUrl || DEFAULT_IMAGE,
      keywords: `${song.title}, ${song.artistName || "nghe si"}, lyrics, music`,
      body: renderPageBody({
        eyebrow: "Music Recording",
        title: song.title || "Bai hat",
        description: `${song.artistName || "Nghe si"}${
          song.albumTitle ? ` • ${song.albumTitle}` : ""
        }`,
        image: song.coverUrl || DEFAULT_IMAGE,
        breadcrumbs: [
          { name: "Trang chu", url: "/" },
          { name: song.title || "Bai hat", url: canonical },
        ],
        stats: [
          { label: "Nghe si", value: song.artistName || "Dang cap nhat" },
          album?.title ? { label: "Album", value: album.title } : null,
          song.duration ? { label: "Thoi luong", value: formatDuration(song.duration) } : null,
          song.playCount ? { label: "Luot nghe", value: formatCount(song.playCount) } : null,
          song.releaseDate ? { label: "Phat hanh", value: formatDate(song.releaseDate) } : null,
        ].filter(Boolean),
        sections: [
          album
            ? renderSection({
                title: "Album lien quan",
                description:
                  "Lien ket den album goc giup bot hieu ro hon moi quan he giua bai hat va album.",
                items: [renderAlbumItem(album)],
              })
            : "",
          artist
            ? renderSection({
                title: "Nghe si",
                description:
                  "Trang nghe si chua thong tin tong hop ve bai hat, album va profile.",
                items: [renderArtistItem(artist)],
              })
            : "",
          renderSection({
            title: "Bai hat cung nghe si",
            description:
              "Danh sach tham khao de tang lien ket noi bo giua cac bai hat cung mot nghe si.",
            items: relatedSongs.map((item, index) => renderSongItem(item, index + 1)),
          }),
        ],
      }),
      jsonLd: [
        buildMusicRecordingSchema(siteUrl, song, artist, album),
        buildBreadcrumbSchema(siteUrl, [
          { name: "Trang chu", url: "/" },
          { name: song.title || "Bai hat", url: canonical },
        ]),
      ],
    });
    indexableRoutes.push(canonical);

    const legacyRoute = `/song/${song.id}`;
    if (legacyRoute !== canonical) {
      await writeRoutePage(
        template,
        siteUrl,
        legacyRoute,
        buildRedirectPage(
          `${song.title} | URL chuan`,
          "Trang bai hat da duoc chuyen sang URL co slug de toi uu SEO.",
          canonical
        )
      );
    }
  }

  for (const artist of prerenderArtists) {
    const canonical = buildArtistPath(artist);
    if (!canonical) continue;
    const artistSongs = ensureArray(songsByArtistId.get(String(artist.id))).slice(0, 20);
    const artistAlbums = ensureArray(albumsByArtistId.get(String(artist.id))).slice(0, 12);
    const songsRoute = buildArtistSongsPath(artist);
    const albumsRoute = buildArtistAlbumsPath(artist);

    await writeRoutePage(template, siteUrl, canonical, {
      title: `${artist.name} | ${SITE_NAME}`,
      description: truncateText(
        artist.shortBio || artist.bio || `Thong tin ve ${artist.name} tren ${SITE_NAME}.`
      ),
      canonical,
      image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
      keywords: `${artist.name}, nghe si, bai hat, album`,
      body: renderPageBody({
        eyebrow: "Music Group",
        title: artist.name || "Nghe si",
        description:
          artist.shortBio || artist.bio || `${artist.name || "Nghe si"} tren ${SITE_NAME}.`,
        image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
        breadcrumbs: [
          { name: "Trang chu", url: "/" },
          { name: artist.name || "Nghe si", url: canonical },
        ],
        stats: [
          artist.alias ? { label: "Alias", value: artist.alias } : null,
          artist.national ? { label: "Quoc gia", value: artist.national } : null,
          artist.followCount ? { label: "Theo doi", value: formatCount(artist.followCount) } : null,
          artist.songCount || artistSongs.length
            ? { label: "Bai hat", value: String(artist.songCount || artistSongs.length) }
            : null,
          artist.albumCount || artistAlbums.length
            ? { label: "Album", value: String(artist.albumCount || artistAlbums.length) }
            : null,
        ].filter(Boolean),
        sections: [
          renderSection({
            title: "Bai hat noi bat",
            description:
              "Danh sach bai hat cua nghe si duoc dat san trong HTML de tang do phu noi dung.",
            items: artistSongs.map((song, index) => renderSongItem(song, index + 1)),
          }),
          renderSection({
            title: "Album",
            description: "Tong hop album cua nghe si tren Khoaluan Music.",
            items: artistAlbums.map(renderAlbumItem),
          }),
          renderSection({
            title: "Dieu huong nhanh",
            description: "Trang bo sung cho danh sach bai hat va album cua nghe si.",
            items: [songsRoute, albumsRoute]
              .filter(Boolean)
              .map(
                (route) =>
                  `<li class="seo-item"><a href="${escapeHtml(route)}">${escapeHtml(
                    route.endsWith("/songs") ? "Xem tat ca bai hat" : "Xem tat ca album"
                  )}</a><small>Duong dan chuan cho profile cong khai cua nghe si.</small></li>`
              ),
          }),
        ],
      }),
      jsonLd: [
        buildMusicGroupSchema(siteUrl, artist),
        buildBreadcrumbSchema(siteUrl, [
          { name: "Trang chu", url: "/" },
          { name: artist.name || "Nghe si", url: canonical },
        ]),
      ],
    });
    indexableRoutes.push(canonical);

    if (songsRoute) {
      await writeRoutePage(template, siteUrl, songsRoute, {
        title: `${artist.name} - Bai hat | ${SITE_NAME}`,
        description: `Danh sach bai hat cua ${artist.name} tren ${SITE_NAME}.`,
        canonical: songsRoute,
        image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
        keywords: `${artist.name}, bai hat, playlist`,
        body: renderPageBody({
          eyebrow: "Artist Songs",
          title: `${artist.name} - Bai hat`,
          description: `Tong hop bai hat cua ${artist.name}.`,
          image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
          breadcrumbs: [
            { name: "Trang chu", url: "/" },
            { name: artist.name || "Nghe si", url: canonical },
            { name: "Bai hat", url: songsRoute },
          ],
          sections: [
            renderSection({
              title: "Tat ca bai hat",
              description:
                "Trang bo sung giup URL danh sach bai hat cua nghe si co HTML va metadata rieng.",
              items: artistSongs.map((song, index) => renderSongItem(song, index + 1)),
            }),
          ],
        }),
        jsonLd: [
          buildCollectionSchema(siteUrl, {
            title: `${artist.name} - Bai hat`,
            description: `Danh sach bai hat cua ${artist.name}.`,
            canonical: songsRoute,
            image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
          }),
        ],
      });
      indexableRoutes.push(songsRoute);
    }

    if (albumsRoute) {
      await writeRoutePage(template, siteUrl, albumsRoute, {
        title: `${artist.name} - Album | ${SITE_NAME}`,
        description: `Danh sach album cua ${artist.name} tren ${SITE_NAME}.`,
        canonical: albumsRoute,
        image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
        keywords: `${artist.name}, album`,
        body: renderPageBody({
          eyebrow: "Artist Albums",
          title: `${artist.name} - Album`,
          description: `Tong hop album cua ${artist.name}.`,
          image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
          breadcrumbs: [
            { name: "Trang chu", url: "/" },
            { name: artist.name || "Nghe si", url: canonical },
            { name: "Album", url: albumsRoute },
          ],
          sections: [
            renderSection({
              title: "Tat ca album",
              description: "Trang bo sung cho URL danh sach album cong khai cua nghe si.",
              items: artistAlbums.map(renderAlbumItem),
            }),
          ],
        }),
        jsonLd: [
          buildCollectionSchema(siteUrl, {
            title: `${artist.name} - Album`,
            description: `Danh sach album cua ${artist.name}.`,
            canonical: albumsRoute,
            image: artist.coverUrl || artist.avatarUrl || DEFAULT_IMAGE,
          }),
        ],
      });
      indexableRoutes.push(albumsRoute);
    }

    const legacyRoute = `/artist/${artist.id}`;
    if (legacyRoute !== canonical) {
      await writeRoutePage(
        template,
        siteUrl,
        legacyRoute,
        buildRedirectPage(
          `${artist.name} | URL chuan`,
          "Trang nghe si da duoc chuyen sang URL co slug de toi uu SEO.",
          canonical
        )
      );
    }

    if (songsRoute) {
      await writeRoutePage(
        template,
        siteUrl,
        `/artist/${artist.id}/songs`,
        buildRedirectPage(
          `${artist.name} - Bai hat | URL chuan`,
          "Trang danh sach bai hat da duoc chuan hoa URL.",
          songsRoute
        )
      );
    }

    if (albumsRoute) {
      await writeRoutePage(
        template,
        siteUrl,
        `/artist/${artist.id}/albums`,
        buildRedirectPage(
          `${artist.name} - Album | URL chuan`,
          "Trang danh sach album da duoc chuan hoa URL.",
          albumsRoute
        )
      );
    }
  }

  const noindexPages = [
    ["/login", "Dang nhap | Khoaluan Music", "Trang dang nhap tai khoan Khoaluan Music."],
    ["/register", "Dang ky | Khoaluan Music", "Trang tao tai khoan Khoaluan Music."],
    ["/artist-auth", "Artist Auth | Khoaluan Music", "Trang xac thuc nghe si tren Khoaluan Music."],
    ["/verify-email", "Xac thuc email | Khoaluan Music", "Trang xac thuc email cho tai khoan."],
    ["/search", "Tim kiem | Khoaluan Music", "Ket qua tim kiem thay doi theo truy van nguoi dung."],
    ["/artist-request", "Dang ky nghe si | Khoaluan Music", "Trang gui yeu cau tro thanh nghe si."],
    ["/me", "Tai khoan cua toi | Khoaluan Music", "Trang thong tin tai khoan ca nhan."],
    ["/history", "Lich su nghe | Khoaluan Music", "Trang lich su nghe nhac cua tai khoan."],
    ["/403", "403 | Khoaluan Music", "Trang thong bao khong co quyen truy cap."],
    ["/404", "404 | Khoaluan Music", "Trang thong bao khong tim thay noi dung."],
    ["/__seo/song", "Song Route | Khoaluan Music", "Fallback noindex cho route bai hat."],
    ["/__seo/album", "Album Route | Khoaluan Music", "Fallback noindex cho route album."],
    ["/__seo/artist-public", "Artist Route | Khoaluan Music", "Fallback noindex cho route nghe si cong khai."],
    ["/__seo/artist-public-songs", "Artist Songs Route | Khoaluan Music", "Fallback noindex cho route bai hat nghe si."],
    ["/__seo/artist-public-albums", "Artist Albums Route | Khoaluan Music", "Fallback noindex cho route album nghe si."],
    ["/__seo/top-50-genre", "Top 50 Route | Khoaluan Music", "Fallback noindex cho route top 50 theo chu de."],
    ["/__seo/playlists", "Playlists Route | Khoaluan Music", "Fallback noindex cho route playlist ca nhan."],
    ["/__seo/library", "Library Route | Khoaluan Music", "Fallback noindex cho route thu vien."],
    ["/__seo/artist-app", "Artist Workspace | Khoaluan Music", "Fallback noindex cho workspace nghe si."],
    ["/__seo/admin-app", "Admin Workspace | Khoaluan Music", "Fallback noindex cho workspace quan tri."],
  ];

  for (const [route, title, description] of noindexPages) {
    await writeRoutePage(
      template,
      siteUrl,
      route,
      buildNoindexPage(title, description, route.startsWith("/__seo") ? "" : route)
    );
  }

  await writeRoutePage(
    template,
    siteUrl,
    "/top-100",
    buildRedirectPage(
      "Top 100 | URL chuan",
      "Trang nay da chuyen sang Top 50 de dong bo he thong URL.",
      "/top-50"
    )
  );

  await fs.writeFile(
    path.join(distDir, "404.html"),
    buildDocument(
      template,
      siteUrl,
      buildNoindexPage("404 | Khoaluan Music", "Khong tim thay noi dung ban dang tim.")
    ),
    "utf8"
  );
  await fs.writeFile(robotsPath, createRobotsTxt(siteUrl), "utf8");

  if (siteUrl) {
    await fs.writeFile(sitemapPath, createSitemapXml(siteUrl, indexableRoutes), "utf8");
    console.log(
      `[seo] Generated prerendered pages, robots.txt and sitemap.xml for ${siteUrl}`
    );
  } else {
    try {
      await fs.unlink(sitemapPath);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    console.warn(
      "[seo] VITE_SITE_URL is missing. Prerendered HTML and robots.txt were generated, but sitemap.xml was skipped."
    );
  }

  console.log(
    `[seo] Prerendered ${indexableRoutes.length} indexable routes, ${
      noindexPages.length + 1
    } noindex helper routes and ${
      prerenderSongs.length + prerenderAlbums.length + prerenderArtists.length
    } entity-driven pages.`
  );
};

main().catch((error) => {
  console.error("[seo] Failed to generate SEO files.", error);
  process.exitCode = 1;
});
