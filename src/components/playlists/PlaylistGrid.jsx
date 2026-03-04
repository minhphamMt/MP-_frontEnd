import { FiMusic } from "react-icons/fi";
import { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function PlaylistGrid({ playlists = [], onOpen, layout = "grid", variant = "default" }) {
  const isRowLayout = layout === "row";
  const isLibrary = variant === "library";

  return (
    <div
      className={
        isRowLayout
          ? "scrollbar-hidden flex gap-4 overflow-x-auto pb-2 sm:gap-5"
          : isLibrary
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
            : "grid min-[520px]:grid-cols-2 grid-cols-1 gap-4 sm:gap-5"
      }
    >
      {playlists.map((pl) => {
        const cover = resolveAssetUrl(pl.songs?.[0]?.cover_url);
        const songCount = pl.songs?.length || 0;
        const firstSongId = normalizeSongId(pl.songs?.[0]);

        return (
          <button
            key={pl.id || firstSongId}
            type="button"
            data-card
            onClick={() => onOpen?.(pl)}
            className={`group relative overflow-hidden text-left transition focus:outline-none ${
              isLibrary ? "rounded-lg border border-white/10 bg-[#181818] p-4" : "user-surface"
            } ${isRowLayout ? "w-40 shrink-0 p-3 sm:w-44 md:w-48" : "w-full p-3 sm:p-4"}`}
          >
            <div className={`relative aspect-square w-full overflow-hidden ${isLibrary ? "rounded-md" : "rounded-xl"}`}>
              {cover ? (
                <OptimizedImage
                  src={cover}
                  alt={pl.title}
                  className="h-full w-full object-cover transition duration-500 md:group-hover:scale-105"
                />
              ) : (
                <div className={`flex h-full w-full items-center justify-center text-4xl text-white/40 ${isLibrary ? "bg-[#232323]" : "bg-[#232323]"}`}>
                  ♪
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition md:group-hover:opacity-100">
                <div className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-black shadow-lg">
                  Mở playlist
                </div>
              </div>
            </div>

            {isLibrary ? (
              <div className="relative mt-3 space-y-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <FiMusic className="text-emerald-300" />
                  Playlist
                </div>
                <p className="truncate text-sm font-semibold text-white sm:text-base">{pl.title || "Playlist"}</p>
                <p className="text-xs text-white/70 sm:text-sm">{songCount} bài hát</p>
              </div>
            ) : (
              <div className="p-2 sm:p-3">
                <p className="truncate text-xs font-semibold text-white sm:text-sm">{pl.title || "Playlist"}</p>
                <p className="mt-0.5 text-[11px] text-white/60">{songCount} bài hát</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
