import { FiHeart, FiMusic, FiPause, FiPlay } from "react-icons/fi";

import ArtistNames from "../artist/ArtistNames";
import AddToPlaylistButton from "./AddToPlaylistButton";
import { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import { formatDuration } from "../../utils/song";
import OptimizedImage from "../common/OptimizedImage";
import { SongDetailIconButton, SongDetailLink } from "../song/SongDetailLink";

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
  const visibleSongs =
    typeof limit === "number" ? songs.slice(0, limit) : songs;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="user-heading-label">Yêu thích</p>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
            Bài hát đã thích
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-white/65">
            Những bài hát bạn muốn giữ lại để mở nghe bất cứ lúc nào.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {showViewAll ? (
            <button
              type="button"
              onClick={onViewAll}
              className="user-btn-secondary px-4 py-2 text-sm font-semibold"
            >
              Xem tất cả
            </button>
          ) : null}
          <span className="user-chip rounded-full px-3 py-1 text-xs font-medium">
            {songs.length} bài hát
          </span>
        </div>
      </div>

      {!songs.length ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center text-sm text-white/60">
          Khi gặp một bài hát thật hợp gu, chỉ cần thả tim và nó sẽ nằm lại ở đây.
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#121212]">
          <div className="hidden grid-cols-[56px_minmax(0,2.3fr)_minmax(0,1.1fr)_88px_116px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/45 lg:grid">
            <span className="text-center">#</span>
            <span>Bài hát</span>
            <span>Album</span>
            <span className="text-center">Thời gian</span>
            <span className="text-right">Tác vụ</span>
          </div>

          <div className="divide-y divide-white/8">
            {visibleSongs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isPlayingCurrent = normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);

              return (
                <article
                  key={song.id || `${song.title}-${index}`}
                  onClick={() => onPlay?.(song)}
                  className={`group grid min-w-0 cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition lg:grid-cols-[56px_minmax(0,2.3fr)_minmax(0,1.1fr)_88px_116px] ${
                    isPlayingCurrent
                      ? "bg-emerald-400/10"
                      : "md:hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="hidden items-center justify-center lg:flex">
                    {isPlayingCurrent ? (
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
                      <OptimizedImage
                        src={resolveAssetUrl(song.cover_url)}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />

                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/45 transition ${
                          isPlayingCurrent
                            ? "opacity-100"
                            : "opacity-0 md:group-hover:opacity-100"
                        }`}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300 text-black shadow-[0_8px_18px_rgba(52,211,153,0.35)]">
                          {isPlayingCurrent && isPlaying ? (
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
                        className={`truncate text-sm font-semibold transition md:hover:text-emerald-300 md:hover:underline sm:text-[15px] ${
                          isPlayingCurrent ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </SongDetailLink>
                      <div className="mt-1 truncate text-xs text-white/60">
                        <ArtistNames
                          item={song}
                          stopPropagation
                          linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                          fallback="Đang cập nhật nghệ sĩ"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden min-w-0 text-sm text-white/60 lg:block">
                    <div className="flex items-center gap-2">
                      <FiMusic className="shrink-0 text-white/40" />
                      <span className="truncate">
                        {song.album_title || song.album || "Single"}
                      </span>
                    </div>
                  </div>

                  <div className="hidden text-center text-sm text-white/50 lg:block">
                    {formatDuration(song.duration)}
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-2">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-8 w-8 !border-white/20 !bg-white/[0.06] md:hover:!bg-white/[0.14]"
                    />
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
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
