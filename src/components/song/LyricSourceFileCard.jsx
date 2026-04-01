import { useMemo, useState } from "react";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import {
  downloadLyricSourceFile,
  getLyricSourceExtension,
  getLyricSourceFileName,
  getLyricSourceState,
  getLyricsPath,
  openLyricSourceFile,
} from "../../utils/lyrics";

export default function LyricSourceFileCard({
  item = null,
  file = null,
  variant = "admin",
  emptyLabel = "Chưa có lyric source",
  helperText = "",
  onError,
}) {
  const [pendingAction, setPendingAction] = useState("");

  const fileName = useMemo(() => {
    if (file?.name) return file.name;
    return getLyricSourceFileName(item) || "";
  }, [file, item]);

  const extension = useMemo(() => {
    if (file?.name) {
      return file.name.split(".").pop()?.toLowerCase() || "";
    }
    return getLyricSourceExtension(item);
  }, [file, item]);

  const sourceState = useMemo(() => getLyricSourceState(item), [item]);
  const hasSource = Boolean(file || getLyricsPath(item));
  const cardClassName =
    variant === "artist" ? "artist-lyric-file-card" : "admin-lyric-file-card";
  const resolvedEmptyLabel =
    sourceState.key === "db_only" ? "Đang dùng lyrics trong DB" : emptyLabel;
  const resolvedEmptyHelperText =
    sourceState.key === "db_only"
      ? "Không cần lyric source vì bài hát đã có lyrics trong DB"
      : helperText || "Chưa có file lyric source";

  const handleAction = async (action) => {
    if (!hasSource || pendingAction) return;

    try {
      setPendingAction(action);
      if (action === "open") {
        await openLyricSourceFile({ file, value: item });
        return;
      }

      await downloadLyricSourceFile({ file, value: item });
    } catch (error) {
      console.error(`Lyric source ${action} failed`, error);
      onError?.(
        error?.message ||
          (action === "open"
            ? "Không thể mở lyric source."
            : "Không thể tải lyric source.")
      );
    } finally {
      setPendingAction("");
    }
  };

  return (
    <div className={cardClassName}>
      <div className={`${cardClassName}-main`}>
        <div className={`${cardClassName}-icon`}>
          <FiFileText />
        </div>
        <div className={`${cardClassName}-content`}>
          <strong>{fileName || resolvedEmptyLabel}</strong>
          <span>
            {hasSource
              ? `${extension ? extension.toUpperCase() : "FILE"}${
                  helperText ? ` • ${helperText}` : ""
                }`
              : resolvedEmptyHelperText}
          </span>
        </div>
      </div>
      {hasSource ? (
        <div className={`${cardClassName}-actions`}>
          <button
            type="button"
            onClick={() => handleAction("open")}
            disabled={Boolean(pendingAction)}
            className={
              variant === "artist"
                ? "artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                : "admin-button admin-button-ghost"
            }
          >
            <FiExternalLink />
            {pendingAction === "open" ? "Đang mở..." : "Mở file"}
          </button>
          <button
            type="button"
            onClick={() => handleAction("download")}
            disabled={Boolean(pendingAction)}
            className={
              variant === "artist"
                ? "artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
                : "admin-button admin-button-ghost"
            }
          >
            <FiDownload />
            {pendingAction === "download" ? "Đang tải..." : "Tải file"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
