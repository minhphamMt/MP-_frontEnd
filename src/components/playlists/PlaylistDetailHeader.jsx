import { FiEdit2, FiPlay, FiShuffle, FiTrash2 } from "react-icons/fi";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function PlaylistDetailHeader({
  playlist,
  onPlay,
  onShuffle,
  onRename,
  onDelete,
  renaming,
}) {
  const cover = resolveAssetUrl(playlist?.songs?.[0]?.cover_url);
  const songCount = playlist?.songs?.length || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
      {/* BACKDROP GLOW */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
         <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-xl shadow-black/40 sm:h-32 sm:w-32">
            {cover ? (
              <OptimizedImage
                src={cover}
                alt={playlist?.title}
                className="h-full w-full object-cover transition duration-500 md:hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl text-white/30">
                🎵
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thư viện
            </p>
           <h1 className="max-w-[28rem] truncate text-2xl font-extrabold text-white sm:text-3xl">
              {playlist?.title || "Playlist"}
            </h1>
            <p className="text-sm text-white/60">{songCount} bài hát</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* SHUFFLE */}
          <button
            onClick={() => onShuffle?.()}
            className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 shadow-md shadow-black/30 backdrop-blur transition md:hover:border-cyan-300/40 md:hover:bg-white/15 md:hover:text-white"
          >
             <FiShuffle className="text-cyan-200" />
            Ngẫu nhiên
          </button>

          {/* PLAY */}
          <button
            onClick={() => onPlay?.(playlist?.songs?.[0], playlist?.songs)}
           className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition md:hover:brightness-110 md:hover:scale-[1.03] active:scale-[0.97]"
          >
            <FiPlay />
            Phát tất cả
          </button>

          {/* RENAME */}
          <button
            onClick={() => onRename?.()}
            disabled={renaming}
            className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 shadow-md shadow-black/30 backdrop-blur transition md:hover:border-violet-300/40 md:hover:bg-white/15 md:hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiEdit2 className="text-violet-200" />
            Đổi tên
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete?.()}
            className="group flex items-center gap-2 rounded-full border border-rose-300/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 shadow-md shadow-black/30 transition md:hover:bg-rose-500/25 md:hover:border-rose-200/60"
          >
           <FiTrash2 className="text-rose-200" />
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
