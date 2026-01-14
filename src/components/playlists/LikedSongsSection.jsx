import { FiHeart, FiMusic, FiPause, FiPlay } from "react-icons/fi";
import AddToPlaylistButton from "./AddToPlaylistButton";
import { normalizeSongId } from "../../store/player.store";

export default function LikedSongsSection({
  songs = [],
  currentSong,
  isPlaying,
  likedSongIds = [],
  onPlay,
  onToggleLike,
  limit,
  showViewAll = false,
  onViewAll,
}) {
    const visibleSongs = typeof limit === "number" ? songs.slice(0, limit) : songs;

  return (
      <>
  {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-white">Bài hát đã thích</h3>
          <p className="text-sm text-white/60">
            Nghe lại những bài hát bạn đã thả tim
          </p>
        </div>

        <div className="flex items-center gap-3">
          {showViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-sm font-semibold text-white/70 transition hover:text-white"
            >
              Xem tất cả
            </button>
          )}
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            {songs.length} bài hát
          </span>
        </div>
      </div>

      {/* TABLE */}
        <div className="mt-4 overflow-x-auto scrollbar-muted">
        <div className="min-w-0 sm:min-w-[640px]">
          {/* TABLE HEADER */}
          <div
            className="hidden grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)]
      border-b border-white/10 px-4 py-3 text-[11px]
      uppercase tracking-[0.35em] text-white/50 sm:grid"
        >
            <span />
            <span>Bài hát</span>
            <span>Album</span>
            <span className="text-right">Thời gian</span>
          </div>

          {!songs.length && (
            <p className="px-4 py-4 text-sm text-white/60">
              Bạn chưa thích bài hát nào. Hãy khám phá và thả tim để lưu tại đây.
            </p>
          )}

          {/* SONG LIST */}
          <div className="divide-y divide-white/5">
            {visibleSongs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isPlayingCurrent = normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);

              return (
                <div
                  key={song.id || index}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 text-sm transition sm:grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)]
                ${
                  isPlayingCurrent
                    ? "bg-gradient-to-r from-cyan-400/10 to-transparent"
                    : "hover:bg-white/5"
                }`}
               >
                  {/* ICON 🎵 */}
                  <div className="hidden justify-center sm:flex">
                    <FiMusic
                      className={`transition ${
                        isPlayingCurrent
                          ? "text-cyan-400"
                          : "text-white/40 group-hover:text-white"
                      }`}
                    />
                    </div>

                  {/* SONG INFO */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
                      <img
                        src={song.cover_url}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => onPlay?.(song)}
                        className="absolute inset-0 flex items-center justify-center
                      bg-black/50 opacity-0 transition
                      group-hover:opacity-100"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-[0_8px_16px_rgba(29,185,84,0.35)]">
                          {isPlayingCurrent && isPlaying ? (
                            <FiPause className="text-sm" />
                          ) : (
                            <FiPlay className="ml-0.5 text-sm" />
                          )}
                        </span>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`truncate font-medium ${
                          isPlayingCurrent ? "text-cyan-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="truncate text-xs text-white/60">
                        {song.artist_name || song.artist}
                      </p>
                    </div>
                </div>

                  {/* ALBUM */}
                   <div className="hidden truncate text-xs text-white/70 sm:block">
                    {song.album_title || song.album || "—"}
                  </div>

                  {/* ACTIONS */}
                  <div className="hidden items-center justify-end gap-4 text-xs text-white/70 sm:flex">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-9 w-9 !border-white/20 !bg-white/5 hover:!bg-white/15"
                    />
                    <button
                      onClick={() => songId && onToggleLike?.(songId)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full
                    border transition-all duration-200
                    ${
                      isLiked
                        ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                        : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
                    }`}
                   >
                      <FiHeart className="text-[16px]" />
                    </button>

                    <span className="tabular-nums">
                      {song.duration || "--:--"}
                    </span>
                  </div>
                   <div className="flex shrink-0 items-center justify-end gap-2 sm:hidden">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-8 w-8 !border-white/20 !bg-white/5 hover:!bg-white/15"
                    />
                    <button
                      onClick={() => songId && onToggleLike?.(songId)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full
                    border transition-all duration-200
                    ${
                      isLiked
                        ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                        : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
                    }`}
                   >
                      <FiHeart className="text-[14px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

  </>
  );
}
