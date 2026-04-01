import { resolveAssetUrl } from "./asset";

export const LYRIC_SOURCE_FOLDER = "uploads/lyric";
export const LYRIC_SOURCE_ACCEPT = ".txt,.lrc";
export const LYRIC_SOURCE_ALLOWED_EXTENSIONS = ["txt", "lrc"];

const UTF8_BOM = "\uFEFF";
const VIETNAMESE_CHAR_PATTERN =
  /[ăâđêôơưĂÂĐÊÔƠƯáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/g;
const MOJIBAKE_PATTERN =
  /(Ã.|Â.|Æ.|Ä.|Ð.|Ñ.|â€¦|â€”|â€œ|â€|â€˜|â€™|áº|á»|á¼|á¸|\uFFFD)/g;
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const COMMON_TEXT_ENCODINGS = [
  "utf-8",
  "windows-1258",
  "utf-16le",
  "utf-16be",
  "windows-1252",
];

const decodeMaybeEncodedPath = (value = "") => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const buildLyricSourceAccessUrl = (url) => {
  const rawUrl = `${url || ""}`.trim();
  if (!rawUrl) return "";
  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : undefined;

  try {
    const parsed = new URL(resolveAssetUrl(rawUrl), origin);
    if (parsed.hostname === "firebasestorage.googleapis.com") {
      return `/__firebase-storage-proxy${parsed.pathname}${parsed.search}`;
    }
    return parsed.toString();
  } catch {
    return resolveAssetUrl(rawUrl);
  }
};

const extractPathWithoutQuery = (value = "") => {
  const rawValue = `${value}`.trim();
  if (!rawValue) return "";

  if (/^https?:\/\//i.test(rawValue)) {
    try {
      const parsed = new URL(rawValue);
      if (parsed.pathname.includes("/o/")) {
        const encodedObjectPath = parsed.pathname.split("/o/")[1] || "";
        return decodeMaybeEncodedPath(encodedObjectPath);
      }
      return decodeMaybeEncodedPath(parsed.pathname);
    } catch {
      return decodeMaybeEncodedPath(rawValue.split(/[?#]/)[0] || "");
    }
  }

  return decodeMaybeEncodedPath(rawValue.split(/[?#]/)[0] || "");
};

export const getLyricsPath = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();

  return (
    value?.lyrics_path ||
    value?.lyricsPath ||
    value?.lyrics_url ||
    value?.lyricsUrl ||
    ""
  );
};

export const hasLyricsInDb = (value) =>
  Boolean(value?.has_lyrics_in_db ?? value?.hasLyricsInDb ?? false);

export const getLyricSourceExtension = (value) => {
  const path = extractPathWithoutQuery(getLyricsPath(value)).toLowerCase();
  const match = path.match(/\.([a-z0-9]+)$/i);
  return match?.[1] || "";
};

const getFileExtensionFromName = (name = "") => {
  const normalizedName = `${name}`.trim().toLowerCase();
  const match = normalizedName.match(/\.([a-z0-9]+)$/i);
  return match?.[1] || "";
};

export const getLyricSourceFileName = (value) => {
  const path = extractPathWithoutQuery(getLyricsPath(value));
  if (!path) return "";
  const segments = path.split("/").filter(Boolean);
  return segments[segments.length - 1] || "";
};

export const isLrcLyricSource = (value) => getLyricSourceExtension(value) === "lrc";

export const isTxtLyricSource = (value) => getLyricSourceExtension(value) === "txt";

export const getLyricSourceState = (value) => {
  const lyricsPath = getLyricsPath(value);
  const extension = getLyricSourceExtension(value);
  const imported = hasLyricsInDb(value);

  if (!lyricsPath && imported) {
    return {
      key: "db_only",
      tone: "success",
      shortLabel: "Đã có lyrics DB",
      label: "Đã có lyrics trong DB",
      extension: "",
      lyricsPath: "",
      imported: true,
      isImportable: false,
    };
  }

  if (!lyricsPath) {
    return {
      key: "no_source",
      tone: "muted",
      shortLabel: "Chưa có source",
      label: "Chưa có file lyric source",
      extension: "",
      lyricsPath: "",
      imported: false,
      isImportable: false,
    };
  }

  if (extension === "txt") {
    return {
      key: "source_txt",
      tone: "warning",
      shortLabel: "TXT source",
      label: "Có file TXT source",
      extension,
      lyricsPath,
      imported,
      isImportable: false,
    };
  }

  if (extension === "lrc" && imported) {
    return {
      key: "source_lrc_imported",
      tone: "success",
      shortLabel: "LRC đã import",
      label: "LRC source đã import vào DB",
      extension,
      lyricsPath,
      imported,
      isImportable: true,
    };
  }

  if (extension === "lrc") {
    return {
      key: "source_lrc_not_imported",
      tone: "info",
      shortLabel: "LRC chờ import",
      label: "LRC source chưa import vào DB",
      extension,
      lyricsPath,
      imported,
      isImportable: true,
    };
  }

  return {
    key: "source_other",
    tone: "muted",
    shortLabel: extension ? `${extension.toUpperCase()} source` : "Có source",
    label: extension ? `Có file source .${extension}` : "Có file lyric source",
    extension,
    lyricsPath,
    imported,
    isImportable: false,
  };
};

export const validateLyricSourceFile = (
  file,
  allowedExtensions = LYRIC_SOURCE_ALLOWED_EXTENSIONS
) => {
  if (!file) {
    return { valid: false, extension: "", error: "Vui lòng chọn file lyric." };
  }

  const name = `${file.name || ""}`.trim();
  const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "";

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      extension,
      error: "Chỉ hỗ trợ file lyric .txt hoặc .lrc.",
    };
  }

  return { valid: true, extension, error: "" };
};

export const formatLyricPreviewTime = (timeMs) => {
  const total = Number.isFinite(Number(timeMs))
    ? Math.max(0, Math.floor(Number(timeMs)))
    : 0;
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const milliseconds = total % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}.${String(milliseconds).padStart(3, "0")}`;
};

const countMatches = (value, pattern) => {
  if (!value) return 0;
  return value.match(pattern)?.length || 0;
};

const detectBomEncoding = (bytes) => {
  if (!bytes?.length) return "";
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return "utf-8";
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return "utf-16le";
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return "utf-16be";
  return "";
};

const scoreDecodedText = (text) => {
  const readableCount = countMatches(text, /[A-Za-z0-9\u00C0-\u024F\u1E00-\u1EFF]/g);
  const vietnameseCount = countMatches(text, VIETNAMESE_CHAR_PATTERN);
  const mojibakeCount = countMatches(text, MOJIBAKE_PATTERN);
  const replacementCount = countMatches(text, /\uFFFD/g);
  const controlCount = countMatches(text, CONTROL_CHAR_PATTERN);

  return (
    readableCount +
    vietnameseCount * 6 -
    mojibakeCount * 12 -
    replacementCount * 18 -
    controlCount * 8
  );
};

const decodeTextBytes = (arrayBuffer) => {
  const bytes = new Uint8Array(arrayBuffer);
  const bomEncoding = detectBomEncoding(bytes);
  const encodings = bomEncoding
    ? [bomEncoding, ...COMMON_TEXT_ENCODINGS.filter((encoding) => encoding !== bomEncoding)]
    : COMMON_TEXT_ENCODINGS;

  let bestCandidate = null;

  encodings.forEach((encoding) => {
    try {
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(bytes);
      const score = scoreDecodedText(text);

      if (!bestCandidate || score > bestCandidate.score) {
        bestCandidate = { encoding, text, score };
      }
    } catch {
      // Ignore unsupported encodings on the current browser.
    }
  });

  return bestCandidate?.text || new TextDecoder("utf-8").decode(bytes);
};

const readLyricTextFromFile = async (file) => {
  const buffer = await file.arrayBuffer();
  return decodeTextBytes(buffer);
};

const fetchLyricTextFromUrl = async (url) => {
  try {
    const response = await fetch(buildLyricSourceAccessUrl(url), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Không thể tải lyric source.");
    }

    const buffer = await response.arrayBuffer();
    return decodeTextBytes(buffer);
  } catch (error) {
    if (error instanceof TypeError) {
      const corsError = new Error("CORS_BLOCKED");
      corsError.code = "cors_blocked";
      corsError.cause = error;
      throw corsError;
    }

    throw error;
  }
};

const buildUtf8TextBlob = (text, extension = "txt") =>
  new Blob([UTF8_BOM, typeof text === "string" ? text : ""], {
    type: extension === "lrc" ? "text/plain;charset=utf-8" : "text/plain;charset=utf-8",
  });

const triggerBlobDownload = (blob, fileName) => {
  if (typeof document === "undefined") return;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 15000);
};

const triggerDirectUrlDownload = (url, fileName) => {
  if (typeof document === "undefined") return;
  const anchor = document.createElement("a");
  anchor.href = buildLyricSourceAccessUrl(url);
  anchor.download = fileName;
  anchor.rel = "noreferrer";
  anchor.target = "_blank";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
};

const openBlobInNewTab = (blob, fileName) => {
  if (typeof window === "undefined") return;

  const previewWindow = window.open("", "_blank");
  const objectUrl = URL.createObjectURL(blob);

  if (previewWindow && !previewWindow.closed) {
    previewWindow.opener = null;
    previewWindow.location.href = objectUrl;
    previewWindow.document.title = fileName;
  } else {
    window.open(objectUrl, "_blank");
  }

  setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
};

const openDirectUrlInNewTab = (url) => {
  if (typeof window === "undefined") return;
  window.open(buildLyricSourceAccessUrl(url), "_blank", "noopener,noreferrer");
};

const resolveLyricSourceFileName = ({ file, value }) => {
  if (file?.name) return file.name;
  const currentName = getLyricSourceFileName(value);
  if (currentName) return currentName;
  const extension = getLyricSourceExtension(value) || "txt";
  return `lyrics-source.${extension}`;
};

const resolveLyricSourceExtension = ({ file, value }) => {
  if (file?.name) return getFileExtensionFromName(file.name);
  return getLyricSourceExtension(value);
};

const resolveNormalizedLyricSourceText = async ({ file, value }) => {
  if (file instanceof File) {
    return readLyricTextFromFile(file);
  }

  const sourceUrl = getLyricsPath(value);
  if (!sourceUrl) {
    throw new Error("Chưa có lyric source.");
  }

  return fetchLyricTextFromUrl(sourceUrl);
};

export const prepareLyricSourceUploadFile = async (file) => {
  if (!(file instanceof File)) return file;

  const validation = validateLyricSourceFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const normalizedText = await readLyricTextFromFile(file);
  return new File([normalizedText], file.name, {
    type: "text/plain;charset=utf-8",
    lastModified: file.lastModified || Date.now(),
  });
};

export const openLyricSourceFile = async ({ file = null, value = null } = {}) => {
  const extension = resolveLyricSourceExtension({ file, value }) || "txt";
  const fileName = resolveLyricSourceFileName({ file, value });
  const sourceUrl = getLyricsPath(value);

  try {
    const text = await resolveNormalizedLyricSourceText({ file, value });
    const blob = buildUtf8TextBlob(text, extension);
    openBlobInNewTab(blob, fileName);
  } catch (error) {
    if (!file && sourceUrl && error?.code === "cors_blocked") {
      openDirectUrlInNewTab(sourceUrl);
      return;
    }

    throw error;
  }
};

export const downloadLyricSourceFile = async ({ file = null, value = null } = {}) => {
  const extension = resolveLyricSourceExtension({ file, value }) || "txt";
  const fileName = resolveLyricSourceFileName({ file, value });
  const sourceUrl = getLyricsPath(value);

  try {
    const text = await resolveNormalizedLyricSourceText({ file, value });
    const blob = buildUtf8TextBlob(text, extension);
    triggerBlobDownload(blob, fileName);
  } catch (error) {
    if (!file && sourceUrl && error?.code === "cors_blocked") {
      triggerDirectUrlDownload(sourceUrl, fileName);
      return;
    }

    throw error;
  }
};
