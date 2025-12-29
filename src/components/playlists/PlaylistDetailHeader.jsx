export default function PlaylistDetailHeader({
  playlist,
  onPlay,
  onShuffle,
  onRename,
  onDelete,
  renaming,
}) {
  const cover = playlist?.songs?.[0]?.cover_url;
  const songCount = playlist?.songs?.length || 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.55)]">
      {/* BACKDROP GLOW */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-5">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl shadow-xl shadow-black/40">
            {cover ? (
              <img
                src={cover}
                alt={playlist?.title}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
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
            <h1 className="max-w-[28rem] truncate text-3xl font-extrabold text-white">
              {playlist?.title || "Playlist"}
            </h1>
            <p className="text-sm text-white/60">{songCount} bài hát</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* SHUFFLE */}
          <button
            onClick={() => onShuffle?.()}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition
                       hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97]"
          >
            🔀 Ngẫu nhiên
          </button>

          {/* PLAY */}
          <button
            onClick={() => onPlay?.(playlist?.songs?.[0], playlist?.songs)}
            className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-green-400/30 transition
                       hover:brightness-110 hover:scale-[1.05] active:scale-[0.97]"
          >
            ▶ Phát tất cả
          </button>

          {/* RENAME */}
          <button
            onClick={() => onRename?.()}
            disabled={renaming}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition
                       hover:bg-white/20 hover:scale-[1.03]
                       disabled:cursor-not-allowed disabled:opacity-60"
          >
            ✎ Đổi tên
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete?.()}
            className="rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 transition
                       hover:bg-rose-500/30 hover:scale-[1.03] active:scale-[0.97]"
          >
            ✕ Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
