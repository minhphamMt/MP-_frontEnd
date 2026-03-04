const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
const STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "";

export const resolveAssetUrl = (url, baseUrl = DEFAULT_BASE_URL) => {
  if (!url) return "";
  const rawUrl = `${url}`.trim();

  // Handle Firebase object path stored as encoded string (uploads%2F...).
  // Support both raw object path and absolute URL forms.
  if (/uploads%2F/i.test(rawUrl)) {
    try {
      const encodedPath = /^https?:\/\//i.test(rawUrl)
        ? new URL(rawUrl).pathname.replace(/^\/+/, "")
        : rawUrl;
      const decodedPath = decodeURIComponent(encodedPath).replace(/^\/+/, "");
      if (decodedPath.startsWith("uploads/") && STORAGE_BUCKET) {
        return `https://storage.googleapis.com/${STORAGE_BUCKET}/${decodedPath}`;
      }
    } catch {
      // Ignore and fallback to base URL strategy below.
    }
  }

  if (/^https?:\/\//i.test(rawUrl) || rawUrl.startsWith("data:")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("blob:")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("//")) {
    return rawUrl;
  }

  const cleanedBase = (baseUrl || "").replace(/\/$/, "");
  const normalizedPath = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;

  return cleanedBase ? `${cleanedBase}${normalizedPath}` : normalizedPath;
};
