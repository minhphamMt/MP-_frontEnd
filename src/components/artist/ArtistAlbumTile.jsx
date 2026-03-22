import { FiCalendar, FiEdit2, FiEye, FiMusic, FiTrash2 } from "react-icons/fi";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

const formatReleaseDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const statusLabelMap = {
  approved: "Đã duyệt",
  pending: "Chờ duyệt",
  draft: "Nháp",
  rejected: "Từ chối",
};

export default function ArtistAlbumTile({ album, onEdit, onDelete, onView }) {
  const songCount = album?.song_count ?? album?.track_count ?? album?.songs?.length ?? 0;
  const coverUrl = resolveAssetUrl(album?.cover_url || album?.cover);
  const statusLabel = statusLabelMap[album?.status] || album?.status || "";
  const statusClassName =
    album?.status === "approved"
      ? "rounded-full border border-sky-300/30 bg-sky-400/12 px-3 py-1 text-sky-100"
      : "rounded-full border border-sky-200/[0.14] bg-sky-400/[0.08] px-3 py-1 text-slate-100/72";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-sky-200/[0.1] bg-[#0f1727]/88 shadow-[0_20px_60px_rgba(2,6,18,0.38)] transition md:hover:-translate-y-1 md:hover:border-sky-300/28 md:hover:bg-[#142038]">
      <div className="relative">
        {coverUrl ? (
          <OptimizedImage
            src={coverUrl}
            alt={album?.title || "Album"}
            className="h-44 w-full bg-black/40 object-cover sm:h-52"
            loading="lazy"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-[linear-gradient(135deg,rgba(56,189,248,0.22),rgba(59,130,246,0.14),rgba(5,10,18,0.96))] sm:h-52">
            <FiMusic className="text-3xl text-white/50" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-xs text-white/85">
          <FiMusic />
          <span>{songCount} bài hát</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">
            {album?.title || "Album chưa đặt tên"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/65">
            <FiCalendar className="text-white/45" />
            <span>{formatReleaseDate(album?.release_date)}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs">
          {album?.zing_album_id && (
            <span className="rounded-full border border-sky-200/[0.12] bg-sky-400/[0.07] px-3 py-1 text-slate-100/72">
              Zing ID: {album.zing_album_id}
            </span>
          )}
          {statusLabel && <span className={statusClassName}>{statusLabel}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onView}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiEye />
            Xem chi tiết
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <FiEdit2 />
            Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="artist-btn-danger inline-flex items-center gap-2 rounded-full border border-rose-400/35 bg-rose-500/12 px-4 py-2 text-sm text-rose-100 transition md:hover:border-rose-300/60 md:hover:bg-rose-500/22"
          >
            <FiTrash2 />
            Xóa mềm
          </button>
        </div>
      </div>
    </article>
  );
}
