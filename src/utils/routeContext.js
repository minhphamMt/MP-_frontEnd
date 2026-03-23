const ARTIST_WORKSPACE_SEGMENTS = new Set([
  "dashboard",
  "profile",
  "albums",
  "songs",
  "trash",
]);

export function normalizePathname(pathname = "/") {
  const value = String(pathname || "/").trim();
  if (!value || value === "/") return "/";

  const nextPathname = value.startsWith("/") ? value : `/${value}`;
  return nextPathname.replace(/\/+$/, "") || "/";
}

export function isArtistWorkspacePath(pathname = "/") {
  const normalizedPathname = normalizePathname(pathname);
  if (normalizedPathname === "/artist") return true;

  const segments = normalizedPathname.split("/").filter(Boolean);
  return (
    segments[0] === "artist" &&
    ARTIST_WORKSPACE_SEGMENTS.has(segments[1] || "")
  );
}

export function shouldUseArtistTheme({
  pathname = "/",
  search = "",
  role = null,
  authContext = "default",
} = {}) {
  const normalizedPathname = normalizePathname(pathname);

  if (
    normalizedPathname === "/artist-auth" ||
    normalizedPathname === "/artist-request" ||
    isArtistWorkspacePath(normalizedPathname)
  ) {
    return true;
  }

  if (
    normalizedPathname === "/verify-email" &&
    new URLSearchParams(search || "").get("intent") === "artist"
  ) {
    return true;
  }

  if (
    normalizedPathname === "/me" &&
    (role === "ARTIST" || authContext === "artist_request")
  ) {
    return true;
  }

  return false;
}

export function getPreferredAuthPath({
  pathname = "/",
  search = "",
  role = null,
  authContext = "default",
  fallback = "/login",
} = {}) {
  if (
    role === "ARTIST" ||
    authContext === "artist_request" ||
    shouldUseArtistTheme({ pathname, search, role, authContext })
  ) {
    return "/artist-auth";
  }

  return fallback === "/artist-auth" ? "/artist-auth" : "/login";
}
