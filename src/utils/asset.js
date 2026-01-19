const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "";

export const resolveAssetUrl = (url, baseUrl = DEFAULT_BASE_URL) => {
  if (!url) return "";

  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("blob:")) {
    return url;
  }

  if (url.startsWith("//")) {
    return url;
  }

  const cleanedBase = (baseUrl || "").replace(/\/$/, "");
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;

  return cleanedBase ? `${cleanedBase}${normalizedPath}` : normalizedPath;
};