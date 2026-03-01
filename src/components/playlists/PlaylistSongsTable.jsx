import { normalizeSongId } from "../../store/player.store";
import { FiHeart, FiPause, FiPlay, FiTrash2, FiMusic } from "react-icons/fi";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";
export default function PlaylistSongsTable({
  songs = [],
  currentSong,
  isPlaying,
  likedSongIds = [],
  onPlay,
  onRemove,
  onToggleLike,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#181818] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Danh sách
          </p>
          <h3 className="text-lg font-semibold text-white">
            Bài hát trong playlist
          </h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
          {songs.length} bài hát
        </span>
      </div>

      <div className="mt-4 overflow-x-auto scrollbar-muted">
        <div className="min-w-0 lg:min-w-[640px]">
          <div className="hidden grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-white/50 lg:grid">
            <span />
            <span>Bài hát</span>
            <span>Album</span>
            <span className="text-right">Thời gian</span>
          </div>

          {!songs.length && (
            <p className="px-4 py-4 text-sm text-white/60">
              Chưa có bài hát nào trong playlist này.
            </p>
          )}

          <div className="divide-y divide-white/5">
            {songs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isPlayingCurrent =
                normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);

              return (
                <div
                  key={song.id || index}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 text-sm transition lg:grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] ${
                    isPlayingCurrent
                      ? "bg-gradient-to-r from-cyan-400/10 to-transparent"
                      : "md:hover:bg-white/5"
                  }`}
                >
                  <div className="hidden justify-center lg:flex">
                    <FiMusic
                      className={`transition ${
                        isPlayingCurrent
                          ? "text-cyan-400"
                          : "text-white/40 md:group-hover:text-white"
                      }`}
                    />
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
                      <OptimizedImage
                        src={resolveAssetUrl(song.cover_url)}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => onPlay?.(song)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition md:group-hover:opacity-100"
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

                  <div className="hidden truncate text-xs text-white/70 lg:block">
                    {song.album_title || song.album || "—"}
                  </div>

                  <div className="hidden items-center justify-end gap-4 text-xs text-white/70 lg:flex">
                    <button
                      onClick={() => songId && onToggleLike?.(songId)}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                          : "border-white/20 text-white/60 md:hover:text-white md:hover:border-white/40"
                      }`}
                    >
                      <FiHeart className="text-[16px]" />
                    </button>
                    <button
                      onClick={() => onRemove?.(song)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition md:hover:border-red-400/60 md:hover:text-red-300"
                    >
                      <FiTrash2 className="text-[16px]" />
                    </button>
                    <span className="tabular-nums">{song.duration}</span>
                  </div>
                   <div className="flex items-center justify-end gap-2 lg:hidden">
                    <button
                      onClick={() => songId && onToggleLike?.(songId)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                          : "border-white/20 text-white/60 md:hover:text-white md:hover:border-white/40"
                      }`}
                    >
                      <FiHeart className="text-[14px]" />
                    </button>
                    <button
                      onClick={() => onRemove?.(song)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 transition md:hover:border-red-400/60 md:hover:text-red-300"
                    >
                      <FiTrash2 className="text-[14px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
