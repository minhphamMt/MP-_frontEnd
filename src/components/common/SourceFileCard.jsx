import { useMemo } from "react";
import { FiFile, FiImage, FiMusic, FiUser } from "react-icons/fi";
import { getAssetFileName } from "../../utils/asset";

const ICON_MAP = {
  audio: FiMusic,
  avatar: FiUser,
  image: FiImage,
  file: FiFile,
};

export default function SourceFileCard({
  variant = "admin",
  type = "file",
  file = null,
  url = "",
  emptyLabel = "Chưa có file",
  helperText = "",
  existingText = "Đang dùng file hiện tại",
  pendingText = "File mới sẽ được áp dụng khi lưu",
  className = "",
}) {
  const fileName = useMemo(() => {
    if (file?.name) return file.name;
    return getAssetFileName(url) || "";
  }, [file, url]);

  const hasSource = Boolean(file || url);
  const Icon = ICON_MAP[type] || FiFile;
  const cardClassName =
    variant === "artist" ? "artist-source-file-card" : "admin-source-file-card";

  const detailText = hasSource
    ? file
      ? pendingText
      : existingText
    : helperText || "Chưa có file được lưu";

  return (
    <div className={`${cardClassName} ${className}`.trim()}>
      <div className={`${cardClassName}-main`}>
        <div className={`${cardClassName}-icon`}>
          <Icon />
        </div>
        <div className={`${cardClassName}-content`}>
          <strong>{fileName || emptyLabel}</strong>
          <span>{detailText}</span>
        </div>
      </div>
    </div>
  );
}
