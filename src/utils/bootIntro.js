const DEFAULT_BOOT_INTRO_DURATION = 1650;

let hideTimer = null;

export function resolveBootIntroTheme(pathname = "/", search = "") {
  const params = new URLSearchParams(search || "");
  const isArtistRoute =
    pathname === "/artist-auth" ||
    pathname === "/artist-request" ||
    pathname.startsWith("/artist/") ||
    (pathname === "/verify-email" && params.get("intent") === "artist");

  return isArtistRoute ? "artist" : "listener";
}

export function showBootIntro({ pathname, search = "", theme, duration = DEFAULT_BOOT_INTRO_DURATION } = {}) {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const bootIntro = document.getElementById("app-boot-intro");
  if (!bootIntro) return;

  const resolvedTheme = theme || resolveBootIntroTheme(pathname || window.location.pathname, search);
  document.documentElement.setAttribute("data-boot-theme", resolvedTheme);
  bootIntro.classList.remove("is-hidden");

  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    bootIntro.classList.add("is-hidden");
  }, duration);
}
