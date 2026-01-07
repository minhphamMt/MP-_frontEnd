import { normalizeSongId } from "../../store/player.store";

export default function PlaylistGrid({
  playlists = [],
  loading = false,
  onOpen,
  totalCount,
}) {
  const displayCount =
  typeof totalCount === "number" ? totalCount : playlists.length;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Playlist
          </p>
          <h3 className="text-xl font-bold text-white">Playlist của bạn</h3>
        </div>

        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            {displayCount} playlist
        </span>
      </div>

      {/* GRID */}
       <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {/* LOADING */}
        {loading && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            Đang tải playlist...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !playlists.length && (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
            Bạn chưa tạo playlist nào.
          </div>
        )}

        {/* PLAYLIST ITEMS */}
        {!loading &&
          playlists.map((pl) => {
            const cover = pl.songs?.[0]?.cover_url;
            const songCount = pl.songs?.length || 0;
            const firstSongId = normalizeSongId(pl.songs?.[0]);

            return (
              <button
                key={pl.id || firstSongId}
                type="button"
                onClick={() => onOpen?.(pl)}
                 className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left shadow-lg transition
                            hover:border-white/20 hover:shadow-[0_25px_70px_rgba(0,0,0,0.6)]
                           focus:outline-none"
              >
                {/* COVER */}
                <div className="relative aspect-square w-full overflow-hidden">
                  {cover ? (
                    <img
                      src={cover}
                      alt={pl.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900 text-4xl text-white/40">
                      🎵
                    </div>
                  )}

                  {/* OVERLAY */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                    <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
                      Mở playlist
                    </div>
                  </div>
                </div>

                {/* INFO */}
                 <div className="p-2">
                  <p className="truncate text-xs font-semibold text-white">
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
    </div>
  );
}
