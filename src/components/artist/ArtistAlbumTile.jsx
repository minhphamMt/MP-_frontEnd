import {
  FiCalendar,
  FiEdit2,
  FiEye,
  FiMusic,
  FiTrash2,
} from "react-icons/fi";

const formatReleaseDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

export default function ArtistAlbumTile({
  album,
  onEdit,
  onDelete,
  onView,
}) {
  const songCount =
    album?.song_count ?? album?.track_count ?? album?.songs?.length ?? 0;
  const coverUrl = album?.cover_url;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#181818]/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-white/20 hover:bg-[#202020]">
      <div className="relative">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={album?.title || "Album"}
            className="h-44 w-full object-cover sm:h-52"
            loading="lazy"
          />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black sm:h-52">
            <FiMusic className="text-3xl text-white/50" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
          <FiMusic />
          <span>{songCount} bài hát</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">
            {album?.title || "Album chưa đặt tên"}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <FiCalendar className="text-white/50" />
            <span>{formatReleaseDate(album?.release_date)}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-white/60">
          {album?.zing_album_id && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              Zing ID: {album.zing_album_id}
            </span>
          )}
          {album?.status && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              {album.status}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onView}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiEye />
            Xem chi tiết
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
          >
            <FiEdit2 />
            Chỉnh sửa
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 transition hover:border-rose-300/50 hover:bg-rose-500/20"
          >
            <FiTrash2 />
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}