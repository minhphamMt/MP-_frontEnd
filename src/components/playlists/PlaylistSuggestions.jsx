
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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Gợi ý</p>
          <h3 className="text-xl font-bold text-white">Bài hát gợi ý</h3>
          <p className="text-sm text-white/60">Thêm nhanh sau khi tạo playlist</p>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
        >
          Làm mới
        </button>
      </div>

      <div className="mt-4 divide-y divide-white/5">
        {loading && (
          <p className="py-3 text-sm text-white/60">Đang tải gợi ý...</p>
        )}

        {!loading && !songs.length && (
          <p className="py-3 text-sm text-white/60">Chưa có gợi ý khả dụng.</p>
        )}

        {songs.map((song) => (
          <div
            key={song.id}
            className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={song.cover_url}
                alt={song.title}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                <p className="truncate text-xs text-white/60">{song.artist_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPlay?.(song)}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"
              >
                ▶ Nghe thử
              </button>
              <button
                onClick={() => onAdd?.(song)}
                disabled={saving}
                className="rounded-full bg-green-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-md shadow-green-400/40 hover:bg-green-300 disabled:opacity-60"
              >
                Thêm vào playlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}