import { FiEdit2, FiPlay, FiShuffle, FiTrash2 } from "react-icons/fi";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function PlaylistDetailHeader({ playlist, onPlay, onShuffle, onRename, onDelete, renaming }) {
  const cover = resolveAssetUrl(playlist?.songs?.[0]?.cover_url);
  const songCount = playlist?.songs?.length || 0;

  return (
    <div className="user-page-shell relative overflow-hidden p-6">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-xl shadow-black/40 sm:h-32 sm:w-32">
            {cover ? (
              <OptimizedImage src={cover} alt={playlist?.title} className="h-full w-full object-cover transition duration-500 md:hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl text-white/30">♪</div>
            )}
          </div>

          <div className="space-y-1">
            <p className="user-heading-label">Thư viện</p>
            <h1 className="max-w-[28rem] truncate text-2xl font-extrabold text-white sm:text-3xl">
              {playlist?.title || "Playlist"}
            </h1>
            <p className="text-sm text-white/60">{songCount} bài hát</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={() => onShuffle?.()} className="user-btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white/85">
            <FiShuffle className="text-emerald-300" />
            Ngẫu nhiên
          </button>

          <button onClick={() => onPlay?.(playlist?.songs?.[0], playlist?.songs)} className="user-btn-primary flex items-center gap-2 px-5 py-2 text-sm font-semibold">
            <FiPlay />
            Phát tất cả
          </button>

          <button
            onClick={() => onRename?.()}
            disabled={renaming}
            className="user-btn-secondary flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white/85 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiEdit2 className="text-emerald-300" />
            Đổi tên
          </button>

          <button
            onClick={() => onDelete?.()}
            className="flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition md:hover:border-rose-200/60 md:hover:bg-rose-500/25"
          >
            <FiTrash2 className="text-rose-200" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
