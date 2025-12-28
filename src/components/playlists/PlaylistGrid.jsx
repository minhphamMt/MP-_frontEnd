import { normalizeSongId } from "../../store/player.store";

export default function PlaylistGrid({
  playlists = [],
  loading = false,
  onOpen,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-900/60 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Playlist</p>
          <h3 className="text-xl font-bold text-white">Playlist của bạn</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {playlists.length} playlist
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {loading && <p className="text-sm text-white/60">Đang tải...</p>}

        {!loading && !playlists.length && (
          <p className="text-sm text-white/60">Chưa có playlist nào.</p>
        )}

        {playlists.map((pl) => {
          const cover = pl.songs?.[0]?.cover_url;
          const songCount = pl.songs?.length || 0;
          const firstSongId = normalizeSongId(pl.songs?.[0]);

          return (
            <button
              key={pl.id || firstSongId}
              type="button"
              onClick={() => onOpen?.(pl)}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg transition hover:border-white/20"
            >
              <div className="aspect-square w-full">
                {cover ? (
                  <img
                    src={cover}
                    alt={pl.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl text-white/40">🎵</div>
                )}
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg">
                  Xem chi tiết
                </span>
              </div>

              <div className="p-3 text-left">
                <p className="truncate text-sm font-semibold text-white">
                  {pl.title || "Playlist"}
                </p>
                <p className="text-xs text-white/60">{songCount} bài hát</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}