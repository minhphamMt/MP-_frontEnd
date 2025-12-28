export default function PlaylistDetailHeader({
  playlist,
  onPlay,
  onShuffle,
  onRename,
  onDelete,
  renaming,
}) {
  const cover = playlist?.songs?.[0]?.cover_url;

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-purple-900 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-28 w-28 overflow-hidden rounded-2xl shadow-lg shadow-black/40">
            {cover ? (
              <img src={cover} alt={playlist.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/5 text-3xl text-white/30">🎵</div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Thư viện</p>
            <h1 className="text-3xl font-bold text-white">{playlist?.title}</h1>
            <p className="text-sm text-white/70">{playlist?.songs?.length || 0} bài hát</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onShuffle?.()}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            🔀 Phát ngẫu nhiên
          </button>
          <button
            onClick={() => onPlay?.(playlist?.songs?.[0], playlist?.songs)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-md"
          >
            ▶ Phát tất cả
          </button>
          <button
            onClick={() => onRename?.()}
            disabled={renaming}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
          >
            ✎ Đổi tên
          </button>
          <button
            onClick={() => onDelete?.()}
            className="rounded-full border border-rose-300/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 hover:bg-rose-500/30"
          >
            ✕ Xóa
          </button>
        </div>
      </div>
    </div>
  );
}