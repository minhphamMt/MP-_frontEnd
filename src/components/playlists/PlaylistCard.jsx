import { FiList, FiMusic } from "react-icons/fi";

export default function PlaylistCard({ playlist, onOpen }) {
  const cover = playlist?.songs?.[0]?.cover_url;
  const songCount = playlist?.songs?.length || 0;

  return (
    <button
      type="button"
      onClick={() => onOpen?.(playlist)}
      className="group relative w-40 shrink-0 overflow-hidden rounded-2xl border border-white/10
        bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-3 text-left
        shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur transition-all duration-300
        hover:shadow-[0_30px_80px_rgba(56,189,248,0.25)] sm:w-44 sm:p-4 lg:w-52"
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative w-full overflow-hidden rounded-xl">
        {cover ? (
          <img
            src={cover}
            alt={playlist?.title || playlist?.name || "Playlist"}
             className="h-36 w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.05]
            sm:h-40 lg:h-44"
          />
        ) : (
          <div className="flex h-36 w-full items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-4xl text-white/40 sm:h-40 lg:h-44">
            🎵
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </div>

      <div className="relative mt-3 space-y-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiList className="text-cyan-300" />
          Playlist
        </div>

       <h3 className="truncate text-sm font-semibold text-white drop-shadow-sm sm:text-base">
          {playlist?.title || playlist?.name || "Playlist"}
        </h3>

         <div className="flex items-center gap-2 text-xs text-white/70 sm:text-sm">
          <FiMusic className="shrink-0 text-violet-300" />
          <span>{songCount} bài hát</span>
        </div>
      </div>
    </button>
  );
}