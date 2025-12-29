import { normalizeSongId } from "../../store/player.store";

export default function PlaylistSongsTable({
  songs = [],
  currentSong,
  isPlaying,
  likedSongIds = [],
  onPlay,
  onRemove,
  onToggleLike,
}) {
  console.log("bài hát trong danh sách phát:", songs);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

      {/* HEADER */}
      <div className="relative z-10 mb-5">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Danh sách
        </p>
        <h3 className="text-lg font-semibold text-white">
          Bài hát trong playlist
        </h3>
      </div>

      {/* SONG LIST */}
      <div className="relative z-10 divide-y divide-white/10">
        {songs.map((song, index) => {
          const songId = normalizeSongId(song);
          const isPlayingCurrent =
            normalizeSongId(currentSong) === songId;
          const isLiked = songId && likedSongIds.includes(songId);

          return (
            <div
              key={song.id || index}
              className={`group flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between transition
                ${
                  isPlayingCurrent
                    ? "bg-white/5"
                    : "hover:bg-white/5"
                } rounded-xl px-2`}
            >
              {/* LEFT */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  {/* PLAY OVERLAY */}
                  <button
                    onClick={() => onPlay?.(song)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg">
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

              {/* RIGHT */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                <span className="hidden sm:inline truncate max-w-[10rem]">
                  {song.album_title || song.album || ""}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{song.duration}</span>

                {/* PLAY (MOBILE) */}
                <button
                  onClick={() => onPlay?.(song)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 sm:hidden"
                >
                  {isPlayingCurrent && isPlaying ? "⏸" : "▶"}
                </button>

                {/* LIKE */}
                <button
                  onClick={() => songId && onToggleLike?.(songId)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition
                    ${
                      isLiked
                        ? "border-rose-300/60 bg-rose-500/20 text-rose-200"
                        : "border-white/15 bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                  ♥
                </button>

                {/* REMOVE */}
                <button
                  onClick={() => onRemove?.(song)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}

        {/* EMPTY */}
        {!songs.length && (
          <div className="py-6 text-center text-sm text-white/60">
            Chưa có bài hát nào trong playlist này.
          </div>
        )}
      </div>
    </div>
  );
}
