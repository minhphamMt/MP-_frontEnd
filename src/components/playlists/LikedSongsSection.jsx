import { normalizeSongId } from "../../store/player.store";

export default function LikedSongsSection({
  songs = [],
  currentSong,
  isPlaying,
  likedSongIds = [],
  onPlay,
  onToggleLike,
  
}) {
  console.log("bài hát đã thích:", songs);
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Yêu thích</p>
          <h3 className="text-xl font-bold text-white">Bài hát đã thích</h3>
          <p className="text-sm text-white/60">Nghe lại những bài hát bạn đã thả tim</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {songs.length} bài hát
        </span>
      </div>

      <div className="mt-4 divide-y divide-white/5">
        {!songs.length && (
          <p className="py-3 text-sm text-white/60">
            Bạn chưa thích bài hát nào. Hãy khám phá và thả tim để lưu tại đây.
          </p>
        )}

          {songs.map((song, index) => {
          const songId = normalizeSongId(song);
          const isPlayingCurrent = normalizeSongId(currentSong) === songId;
          const isLiked = songId && likedSongIds.includes(songId);
           
          return (
            <div
              key={song.id || index}
              className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{song.title}</p>
                  <p className="truncate text-xs text-white/60">{song.artist_name || song.artist}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-white/60">{song.album_title || song.album || ""}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/60">{song.duration}</span>
                <button
                  onClick={() => onPlay?.(song)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15"
                >
                  {isPlayingCurrent && isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  onClick={() => songId && onToggleLike?.(songId)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border ${
                    isLiked
                      ? "border-rose-300/60 bg-rose-500/20 text-rose-200"
                      : "border-white/15 bg-white/10 text-white"
                  } hover:bg-white/15`}
                >
                  ♥
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}