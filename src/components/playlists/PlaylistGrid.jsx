import { normalizeSongId } from "../../store/player.store";

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
           ? "flex gap-4 overflow-x-auto pb-2 sm:gap-5 scrollbar-hidden"
          : isLibrary
            ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:gap-5"
      }
    >
      {playlists.map((pl) => {
        const cover = pl.songs?.[0]?.cover_url;
        const songCount = pl.songs?.length || 0;
        const firstSongId = normalizeSongId(pl.songs?.[0]);

        return (
          <button
            key={pl.id || firstSongId}
            type="button"
            onClick={() => onOpen?.(pl)}
            className={`group relative overflow-hidden text-left transition focus:outline-none ${
              isLibrary
                ? "rounded-lg border border-transparent bg-[#181818] hover:bg-[#242424]"
                : "rounded-xl border border-white/10 bg-white/5 shadow-lg hover:border-white/20 hover:shadow-[0_25px_70px_rgba(0,0,0,0.6)]"
            } ${isRowLayout ? "w-40 shrink-0 sm:w-44 md:w-48" : "w-full"}`}
          >
            <div className="relative aspect-square w-full overflow-hidden">
              {cover ? (
                <img
                  src={cover}
                  alt={pl.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                 <div
                  className={`flex h-full w-full items-center justify-center text-4xl text-white/40 ${
                    isLibrary
                      ? "bg-[#2a2a2a]"
                      : "bg-gradient-to-br from-slate-700 to-slate-900"
                  }`}
                >
                  🎵
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <div
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
                    isLibrary
                      ? "bg-[#1db954] text-black"
                      : "bg-white text-slate-900"
                  }`}
                >
                  Mở playlist
                </div>
              </div>
            </div>

            <div className={`p-2 ${isLibrary ? "sm:p-2" : "sm:p-3"}`}>
              <p className="truncate text-xs font-semibold text-white sm:text-sm">
                {pl.title || "Playlist"}
              </p>
              <p className="mt-0.5 text-[11px] text-white/60">
                {songCount} bài hát
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}