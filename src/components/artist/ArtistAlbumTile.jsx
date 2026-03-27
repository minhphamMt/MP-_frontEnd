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

export default function ArtistAlbumTile({
  album,
  onEdit,
  onDelete,
  onView,
  theme = "artist",
}) {
  const songCount = album?.song_count ?? album?.track_count ?? album?.songs?.length ?? 0;
  const coverUrl = resolveAssetUrl(album?.cover_url || album?.cover);
  const statusLabel = statusLabelMap[album?.status] || album?.status || "";
  const isAdminTheme = theme === "admin";
  const cardClassName = isAdminTheme
    ? "border-white/[0.04] bg-[#151617] md:hover:-translate-y-1 md:hover:border-white/[0.08] md:hover:bg-[#18191a] md:hover:shadow-[0_22px_48px_rgba(0,0,0,0.28)]"
    : "border-sky-200/[0.1] bg-[#121b28] md:hover:-translate-y-1 md:hover:border-sky-300/20 md:hover:bg-[#152031] md:hover:shadow-[0_24px_54px_rgba(3,8,20,0.34)]";
  const fallbackCoverClassName = isAdminTheme
    ? "bg-[#202325]"
    : "bg-[linear-gradient(135deg,rgba(56,189,248,0.22),rgba(59,130,246,0.14),rgba(5,10,18,0.96))]";
  const metaBadgeClassName = isAdminTheme
    ? "rounded-full border border-white/[0.06] bg-[#1a1b1c] px-3 py-1 text-white/66"
    : "rounded-full border border-sky-200/[0.12] bg-sky-400/[0.07] px-3 py-1 text-slate-100/72";
  const statusClassName =
    album?.status === "approved"
      ? isAdminTheme
        ? "rounded-full border border-emerald-400/16 bg-[#18211c] px-3 py-1 text-emerald-100"
        : "rounded-full border border-sky-300/30 bg-sky-400/12 px-3 py-1 text-sky-100"
      : metaBadgeClassName;
  const secondaryActionClassName = isAdminTheme
    ? "inline-flex min-w-0 items-center justify-center gap-2 rounded-full border border-white/[0.06] bg-[#1a1b1c] px-3 py-2 text-sm text-white/80 transition md:hover:border-white/[0.1] md:hover:bg-[#1d1e1f]"
    : "artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm";
  const deleteActionClassName = isAdminTheme
    ? "inline-flex min-w-0 items-center justify-center gap-2 rounded-full bg-[#24191b] px-3 py-2 text-sm text-rose-100 ring-1 ring-inset ring-rose-300/10 shadow-[0_10px_20px_rgba(0,0,0,0.16)] transition md:hover:bg-[#2c1d20] md:hover:text-white md:hover:ring-rose-300/18"
    : "inline-flex items-center gap-2 rounded-full bg-[#2a171b] px-4 py-2 text-sm text-rose-100 ring-1 ring-inset ring-rose-300/10 shadow-[0_10px_22px_rgba(7,10,18,0.18)] transition md:hover:bg-[#341d22] md:hover:text-white md:hover:ring-rose-300/16";
  const actionLayoutClassName = isAdminTheme
    ? "grid grid-cols-3 gap-2"
    : "flex flex-wrap gap-2";
  const mediaFrameClassName = isAdminTheme
    ? "rounded-[22px] border border-white/[0.06] bg-[#191b1d]/92 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_12px_26px_rgba(0,0,0,0.18)]"
    : "rounded-[22px] border border-sky-200/[0.12] bg-[#111b2a]/92 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),0_14px_30px_rgba(3,8,20,0.24)]";

  return (
    <article
      className={`artist-album-card group flex h-full flex-col overflow-hidden rounded-[22px] border shadow-[0_16px_34px_rgba(0,0,0,0.22)] transition ${cardClassName}`}
    >
      <div className="relative">
        {coverUrl ? (
          <div className="relative h-44 w-full overflow-hidden bg-[#0d131d] sm:h-52">
            <OptimizedImage
              src={coverUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl transition duration-500 md:group-hover:scale-[1.14]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,18,0.08),rgba(7,10,18,0.22))]" />
            <div className="relative flex h-full items-center justify-center p-4 sm:p-5">
              <div
                className={`relative flex h-full w-full items-center justify-center overflow-hidden transition duration-500 md:group-hover:scale-[1.015] ${mediaFrameClassName}`}
              >
                <OptimizedImage
                  src={coverUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-2xl transition duration-500 md:group-hover:scale-[1.14]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_52%),linear-gradient(180deg,rgba(10,14,20,0.08),rgba(10,14,20,0.2))]" />
                <OptimizedImage
                  src={coverUrl}
                  alt={album?.title || "Album"}
                  className="relative z-[1] max-h-full max-w-full rounded-[18px] object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,0.28)] transition duration-500 md:group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={`flex h-44 w-full items-center justify-center sm:h-52 ${fallbackCoverClassName}`}>
            <FiMusic className="text-3xl text-white/50" />
          </div>
        )}
        <div
          className={`pointer-events-none absolute inset-0 ${
            isAdminTheme ? "bg-black/20" : "bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          }`}
        />
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
            <span className={metaBadgeClassName}>
              Zing ID: {album.zing_album_id}
            </span>
          )}
          {statusLabel && <span className={statusClassName}>{statusLabel}</span>}
        </div>

        <div className={actionLayoutClassName}>
          <button
            type="button"
            onClick={onView}
            className={secondaryActionClassName}
          >
            <FiEye />
            Xem chi tiết
          </button>
          <button
            type="button"
            onClick={onEdit}
            className={secondaryActionClassName}
          >
            <FiEdit2 />
            Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className={deleteActionClassName}
          >
            <FiTrash2 />
            Xóa mềm
          </button>
        </div>
      </div>
    </article>
  );
}
