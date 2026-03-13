import { FiHeart, FiMusic, FiPause, FiPlay, FiTrash2 } from "react-icons/fi";

import ArtistNames from "../artist/ArtistNames";
import { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDuration } from "../../utils/song";
import OptimizedImage from "../common/OptimizedImage";
import { SongDetailIconButton, SongDetailLink } from "../song/SongDetailLink";

export default function PlaylistSongsTable({
  songs = [],
  currentSong,
  isPlaying,
  likedSongIds = [],
  onPlay,
  onRemove,
  onToggleLike,
}) {
  if (!songs.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center text-sm text-white/60">
        Playlist này chưa có bài hát nào. Hãy thêm vài bài để bắt đầu nghe.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#121212]">
      <div className="hidden grid-cols-[56px_minmax(0,2.3fr)_minmax(0,1.1fr)_88px_104px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/45 lg:grid">
        <span className="text-center">#</span>
        <span>Bài hát</span>
        <span>Nghệ sĩ</span>
        <span className="text-center">Thời gian</span>
        <span className="text-right">Tác vụ</span>
      </div>

      <div className="divide-y divide-white/8">
        {songs.map((song, index) => {
          const songId = normalizeSongId(song);
          const isActive = normalizeSongId(currentSong) === songId;
          const isLiked = songId && likedSongIds.includes(songId);

          return (
            <article
              key={song.id || `${song.title}-${index}`}
              onClick={() => onPlay?.(song)}
              className={`group grid min-w-0 cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition lg:grid-cols-[56px_minmax(0,2.3fr)_minmax(0,1.1fr)_88px_104px] ${
                isActive ? "bg-emerald-400/10" : "md:hover:bg-white/[0.04]"
              }`}
            >
              <div className="hidden items-center justify-center lg:flex">
                {isActive ? (
                  isPlaying ? (
                    <FiPause className="text-base text-emerald-300" />
                  ) : (
                    <FiPlay className="text-base text-emerald-300" />
                  )
                ) : (
                  <span className="text-sm font-semibold text-white/55">
                    {index + 1}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  {song.cover_url ? (
                    <OptimizedImage
                      src={resolveAssetUrl(song.cover_url)}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-white/35">
                      <FiMusic />
                    </div>
                  )}

                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-black/45 transition ${
                      isActive ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
                    }`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300 text-black shadow-[0_8px_18px_rgba(52,211,153,0.35)]">
                      {isActive && isPlaying ? (
                        <FiPause className="text-sm" />
                      ) : (
                        <FiPlay className="ml-0.5 text-sm" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <SongDetailLink
                    song={song}
                    className={`truncate text-sm font-semibold transition md:hover:text-emerald-300 sm:text-[15px] ${
                      isActive ? "text-emerald-300" : "text-white"
                    }`}
                  >
                    {song.title}
                  </SongDetailLink>

                  <div className="mt-1 truncate text-xs text-white/60 lg:hidden">
                    <ArtistNames
                      item={song}
                      stopPropagation
                      fallback="Đang cập nhật nghệ sĩ"
                      linkClassName="transition md:hover:text-emerald-300"
                    />
                  </div>

                  <div className="mt-1 truncate text-[11px] text-white/40 lg:hidden">
                    {formatDuration(song.duration)}
                  </div>
                </div>
              </div>

              <div className="hidden min-w-0 text-sm text-white/60 lg:block">
                <ArtistNames
                  item={song}
                  stopPropagation
                  fallback="Đang cập nhật nghệ sĩ"
                  linkClassName="truncate transition md:hover:text-emerald-300"
                />
              </div>

              <div className="hidden text-center text-sm text-white/50 lg:block">
                {formatDuration(song.duration)}
              </div>

              <div className="flex items-center justify-end gap-2">
                <SongDetailIconButton song={song} />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (songId) onToggleLike?.(songId);
                  }}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
                    isLiked
                      ? "border-rose-400/50 bg-rose-400/10 text-rose-300"
                      : "border-white/15 text-white/65 md:hover:bg-white/[0.1]"
                  }`}
                  aria-label={isLiked ? "Bỏ thích bài hát" : "Thích bài hát"}
                >
                  <FiHeart />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove?.(song);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/65 transition md:hover:border-rose-400/50 md:hover:bg-rose-500/10 md:hover:text-rose-300"
                  aria-label="Gỡ bài hát khỏi playlist"
                >
                  <FiTrash2 />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
