import useAuthStore from "../store/auth.store";
import {
  isArtistWorkspacePath,
  normalizePathname,
  shouldUseArtistTheme,
} from "./routeContext";

const DEFAULT_BOOT_INTRO_DURATION = 1650;

let hideTimer = null;

export function resolveBootIntroTheme(
  pathname = "/",
  search = null,
  { role, authContext } = {}
) {
  const authState = useAuthStore.getState();
  const resolvedSearch =
    search ?? (typeof window !== "undefined" ? window.location.search || "" : "");

  return shouldUseArtistTheme({
    pathname,
    search: resolvedSearch,
    role: role ?? authState?.role ?? null,
    authContext: authContext ?? authState?.authContext ?? "default",
  })
    ? "artist"
    : "listener";
}

export function syncBootIntroTheme({
  pathname,
  search = null,
  theme,
  role,
  authContext,
} = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return null;

  const resolvedPathname = pathname || window.location.pathname;
  const resolvedSearch = search ?? window.location.search ?? "";
  const authState = useAuthStore.getState();
  const resolvedTheme =
    theme ||
    resolveBootIntroTheme(resolvedPathname, resolvedSearch, {
      role: role ?? authState?.role ?? null,
      authContext: authContext ?? authState?.authContext ?? "default",
    });

  document.documentElement.setAttribute("data-boot-theme", resolvedTheme);
  return resolvedTheme;
}

export function preloadIntroDestination(pathname = "/") {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === "/") {
    return Promise.all([
      import("../layouts/MainLayout"),
      import("../pages/Home"),
    ]);
  }

  if (
    normalizedPathname === "/login" ||
    normalizedPathname === "/register"
  ) {
    return Promise.all([import("../pages/Login")]);
  }

  if (
    normalizedPathname === "/admin" ||
    normalizedPathname === "/admin/dashboard" ||
    normalizedPathname === "/admin/analytics"
  ) {
    return Promise.all([
      import("../layouts/MainLayout"),
      import("../pages/admin/AdminAnalytics"),
    ]);
  }

  if (
    normalizedPathname === "/artist" ||
    normalizedPathname === "/artist/dashboard" ||
    isArtistWorkspacePath(normalizedPathname)
  ) {
    return Promise.all([
      import("../layouts/MainLayout"),
      import("../pages/artist/ArtistDashboard"),
    ]);
  }

  if (normalizedPathname === "/artist-request") {
    return Promise.all([import("../pages/ArtistRequest")]);
  }

  if (normalizedPathname === "/artist-auth") {
    return Promise.all([import("../pages/ArtistAuth")]);
  }

  return Promise.resolve();
}

export function showBootIntro({
  pathname,
  search = null,
  theme,
  duration = DEFAULT_BOOT_INTRO_DURATION,
  role,
  authContext,
} = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const bootIntro = document.getElementById("app-boot-intro");
  if (!bootIntro) return;

  const resolvedPathname = pathname || window.location.pathname;
  const resolvedSearch = search ?? window.location.search ?? "";
  syncBootIntroTheme({
    pathname: resolvedPathname,
    search: resolvedSearch,
    theme,
    role,
    authContext,
  });

  void preloadIntroDestination(resolvedPathname).catch((error) => {
    console.warn("Failed to preload intro destination", error);
  });

  bootIntro.classList.remove("is-hidden");

  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    bootIntro.classList.add("is-hidden");
  }, duration);
}
