import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export const MUSIC_UPLOAD_FOLDER = "uploads/music";
export const COVER_UPLOAD_FOLDER = "uploads/covers";
export const AVATAR_UPLOAD_FOLDER = "uploads/avatars";

const sanitizeFileName = (name = "file") => {
  const safeName = `${name}`
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  return safeName || "file";
};

const generateUploadFileName = (name) => {
  const uniqueSuffix =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `${Date.now()}-${uniqueSuffix}-${sanitizeFileName(name)}`;
};

export const uploadFileToFirebase = async (file, folder) => {
  if (!file || !folder) return null;

  const normalizedFolder = `${folder}`.replace(/^\/+|\/+$/g, "");
  const fileRef = ref(storage, `${normalizedFolder}/${generateUploadFileName(file.name)}`);

  await uploadBytes(fileRef, file, file.type ? { contentType: file.type } : undefined);
  return getDownloadURL(fileRef);
};
