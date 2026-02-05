import { FiList, FiMusic } from "react-icons/fi";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function PlaylistCard({ playlist, onOpen, variant = "grid" }) {
  const cover = resolveAssetUrl(playlist?.songs?.[0]?.cover_url);
  const songCount = playlist?.songs?.length || 0;
  const isLibrary = variant === "library";

  return (
    <button
      type="button"
      data-card
      onClick={() => onOpen?.(playlist)}
      className={`group relative w-full overflow-hidden text-left transition-all duration-300 sm:w-60 sm:shrink-0 sm:p-4 lg:w-64 ${
        isLibrary
          ? "rounded-lg border border-transparent bg-[#181818] p-4 shadow-none hover:bg-[#242424]"
          : "rounded-xl border border-white/10 bg-[#181818] p-3 hover:bg-[#242424]"
      }`}
    >
      <div
        className={`relative w-full overflow-hidden ${
          isLibrary ? "rounded-md" : "rounded-xl"
        }`}
      >
        {cover ? (
          <OptimizedImage
            src={cover}
            alt={playlist?.title || playlist?.name || "Playlist"}
            className={`h-36 w-full object-cover transition-transform duration-500 group-hover:scale-[1.05] sm:h-44 lg:h-52 ${
              isLibrary ? "rounded-md" : "rounded-xl"
            }`}
          />
        ) : (
          <div
            className={`flex h-36 w-full items-center justify-center text-4xl text-white/40 sm:h-44 lg:h-52 ${
              isLibrary
                ? "rounded-md bg-[#2a2a2a]"
                : "rounded-xl bg-gradient-to-br from-slate-700 to-slate-900"
            }`}
          >
            🎵
          </div>
        )}

        {!isLibrary && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        )}
      </div>

      <div className="relative mt-3 space-y-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiList className="text-cyan-300" />
          Playlist
        </div>

        <h3 className="truncate text-sm font-semibold text-white sm:text-base">
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
