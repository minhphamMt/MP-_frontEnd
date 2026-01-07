import { normalizeSongId } from "../../store/player.store";

export default function LikedSongsSection({
  songs = [],
  currentSong,
  isPlaying,
  likedSongIds = [],
  onPlay,
  onToggleLike,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
           <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
            Yêu thích
          </p>
          <h3 className="text-xl font-bold text-white">Bài hát đã thích</h3>
           <p className="text-sm text-white/60">
            Nghe lại những bài hát bạn đã thả tim
          </p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {songs.length} bài hát
        </span>
      </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="hidden grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] gap-4 border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-white/50 sm:grid">
          <span>Bài hát</span>
          <span>Album</span>
          <span className="text-right">Thời gian</span>
        </div>

        {!songs.length && (
           <p className="px-4 py-4 text-sm text-white/60">
            Bạn chưa thích bài hát nào. Hãy khám phá và thả tim để lưu tại đây.
          </p>
        )}
 <div className="divide-y divide-white/5">
          {songs.map((song, index) => {
           const songId = normalizeSongId(song);
            const isPlayingCurrent = normalizeSongId(currentSong) === songId;
            const isLiked = songId && likedSongIds.includes(songId);

            return (
              <div
                key={song.id || index}
                className={`group grid grid-cols-1 gap-3 px-4 py-3 text-sm transition sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] sm:items-center ${
                  isPlayingCurrent ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => onPlay?.(song)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
                        {isPlayingCurrent && isPlaying ? "⏸" : "▶"}
                      </span>
                    </button>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {song.title}
                    </p>
                    <p className="truncate text-xs text-white/60">
                      {song.artist_name || song.artist}
                    </p>
                  </div>
                </div>

                <div className="hidden min-w-0 text-xs text-white/70 sm:block">
                  <p className="truncate">
                    {song.album_title || song.album || "—"}
                  </p>
                </div>
             

              <div className="flex items-center justify-between gap-3 text-xs text-white/70 sm:justify-end">
                  <span className="truncate sm:hidden">
                    {song.album_title || song.album || "—"}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => songId && onToggleLike?.(songId)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition ${
                        isLiked
                          ? "border-rose-300/60 bg-rose-500/20 text-rose-200"
                          : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      ♥
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20">
                      ⋯
                    </button>
                    <span className="min-w-[3rem] text-right tabular-nums">
                      {song.duration || "--:--"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}