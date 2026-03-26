const CRAWLER_USER_AGENT_PATTERN =
  /Googlebot|Google-InspectionTool|AdsBot|bingbot|BingPreview|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Chrome-Lighthouse|Lighthouse|GTmetrix|HeadlessChrome/i;

function shouldRegisterServiceWorker() {
  if (!import.meta.env.PROD) return false;
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;

  const isSecureOrigin =
    window.location.protocol === "https:" || window.location.hostname === "localhost";

  if (!isSecureOrigin) return false;

  const userAgent = navigator.userAgent || "";
  if (CRAWLER_USER_AGENT_PATTERN.test(userAgent)) return false;

  return true;
}

export function registerAppServiceWorker() {
  if (!shouldRegisterServiceWorker()) return;

  const register = () => {
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Ignore registration failures in unsupported or constrained environments.
    });
  };

  if (document.readyState === "complete") {
    register();
    return;
  }

  window.addEventListener("load", register, { once: true });
}
