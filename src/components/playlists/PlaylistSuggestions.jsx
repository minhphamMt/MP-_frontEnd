import { resolveAssetUrl } from "../../utils/asset";

export default function PlaylistSuggestions({
  songs = [],
  loading = false,
  onRefresh,
  onPlay,
  onAdd,
  saving = false,
}) {
  if (!songs.length && !loading) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-green-400/15 blur-3xl" />

      {/* HEADER */}
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Gợi ý
          </p>
          <h3 className="text-xl font-bold text-white">Bài hát gợi ý</h3>
          <p className="text-sm text-white/60">
            Thêm nhanh sau khi tạo playlist
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition
                     hover:bg-white/20 hover:scale-[1.05] active:scale-[0.97]"
        >
          ⟳ Làm mới
        </button>
      </div>

      {/* LIST */}
      <div className="relative z-10 mt-5 divide-y divide-white/10">
        {/* LOADING */}
        {loading && (
          <div className="py-4 text-sm text-white/60">
            Đang tải gợi ý...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !songs.length && (
          <div className="py-4 text-sm text-white/60">
            Chưa có gợi ý khả dụng.
          </div>
        )}

        {/* ITEMS */}
        {songs.map((song) => (
          <div
            key={song.id}
            className="group flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between transition
                       hover:bg-white/5 rounded-xl px-2"
          >
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <img
                  src={resolveAssetUrl(song.cover_url)}
                  alt={song.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                {/* PLAY OVERLAY */}
                <button
                  onClick={() => onPlay?.(song)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
                    ▶
                  </span>
                </button>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {song.title}
                </p>
                <p className="truncate text-xs text-white/60">
                  {song.artist_name}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap items-center gap-2">
              {/* PLAY (MOBILE) */}
              <button
                onClick={() => onPlay?.(song)}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition
                           hover:bg-white/20 sm:hidden"
              >
                ▶ Nghe thử
              </button>

              {/* ADD */}
              <button
                onClick={() => onAdd?.(song)}
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900
                           shadow-lg shadow-green-400/30 transition
                           hover:brightness-110 hover:scale-[1.05] active:scale-[0.97]
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                + Thêm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
