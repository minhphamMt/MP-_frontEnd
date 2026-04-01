const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";
const STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "";

const decodeMaybeEncodedPath = (value = "") => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const extractAssetPath = (url = "") => {
  const rawUrl = `${url}`.trim();
  if (!rawUrl) return "";

  if (/^https?:\/\//i.test(rawUrl)) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.pathname.includes("/o/")) {
        const encodedObjectPath = parsed.pathname.split("/o/")[1] || "";
        return decodeMaybeEncodedPath(encodedObjectPath);
      }
      return decodeMaybeEncodedPath(parsed.pathname);
    } catch {
      return decodeMaybeEncodedPath(rawUrl.split(/[?#]/)[0] || "");
    }
  }

  return decodeMaybeEncodedPath(rawUrl.split(/[?#]/)[0] || "");
};

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

export const getAssetFileName = (url) => {
  const path = extractAssetPath(url);
  if (!path) return "";

  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
};
