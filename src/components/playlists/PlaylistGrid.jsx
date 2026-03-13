import { FiList, FiMusic } from "react-icons/fi";

import { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function PlaylistGrid({
  playlists = [],
  onOpen,
  layout = "grid",
  variant = "default",
}) {
  const isRowLayout = layout === "row";
  const isLibrary = variant === "library";

  return (
    <div
      className={
        isRowLayout
          ? "scrollbar-hidden flex gap-4 overflow-x-auto pb-2 sm:gap-5"
          : isLibrary
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
            : "grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5"
      }
    >
      {playlists.map((playlist) => {
        const cover = resolveAssetUrl(playlist?.songs?.[0]?.cover_url);
        const songCount = playlist?.songs?.length || 0;
        const firstSongId = normalizeSongId(playlist?.songs?.[0]);

        return (
          <button
            key={playlist?.id || firstSongId}
            type="button"
            data-card
            onClick={() => onOpen?.(playlist)}
            className={`group relative overflow-hidden text-left transition focus:outline-none ${
              isRowLayout ? "w-44 shrink-0 sm:w-52" : "w-full"
            } ${
              isLibrary
                ? "rounded-[20px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] p-3"
                : "user-surface p-3 sm:p-4"
            }`}
          >
            {cover ? (
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 md:group-hover:opacity-100"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.48)), url(${cover})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />
            ) : null}

            <div className="relative">
              <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-white/10 bg-[#181818]">
                {cover ? (
                  <OptimizedImage
                    src={cover}
                    alt={playlist?.title || playlist?.name || "Playlist"}
                    className="h-full w-full object-cover transition duration-500 md:group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#232323] text-4xl text-white/35">
                    ♪
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 rounded-full border border-white/12 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 backdrop-blur">
                  Playlist
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition md:group-hover:opacity-100">
                  <span className="rounded-full bg-emerald-300 px-3.5 py-1.5 text-xs font-semibold text-black shadow-[0_10px_24px_rgba(52,211,153,0.35)]">
                    Mở playlist
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
                  <FiList className="text-white/60" />
                  <span>Bộ sưu tập</span>
                </div>

                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold text-white sm:text-[15px]">
                  {playlist?.title || playlist?.name || "Playlist"}
                </h3>

                <div className="flex items-center gap-2 text-xs text-white/62 sm:text-sm">
                  <FiMusic className="shrink-0 text-white/55" />
                  <span>{songCount} bài hát</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
