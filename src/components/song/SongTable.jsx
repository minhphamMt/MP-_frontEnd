import { Link } from "react-router-dom";
import { FiHeart, FiPause, FiPlay } from "react-icons/fi";
import { useEnsureLikedSongsLoaded } from "../../hooks/useEnsureLibraryState";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration, fetchPlayableSong } from "../../utils/song";
import { getSongById } from "../../api/song.api";
import { resolveAssetUrl } from "../../utils/asset";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";
import OptimizedImage from "../common/OptimizedImage";
import ArtistNames from "../artist/ArtistNames";
import { SongDetailIconButton, SongDetailLink } from "./SongDetailLink";

export default function SongTable({ title, subtitle, songs, loading, onRefresh, headerActions }) {
  useEnsureLikedSongsLoaded();
  const { playSong, pause, resume, currentSong, isPlaying, likedSongIds, toggleLike } = usePlayerStore();

  const handlePlaySong = async (song, queue) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = queue.map((item) => {
      const itemId = normalizeSongId(item);
      return itemId && itemId === normalizedId ? { ...item, ...playable } : item;
    });

    if (normalizeSongId(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
      playSong(playable, updatedQueue);
    }
  };

  const playAll = () => {
    if (songs.length) handlePlaySong(songs[0], songs);
  };

  const renderHeader = () => (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {subtitle && <p className="user-heading-label">{subtitle}</p>}
        <h2 className="mt-1 text-2xl font-black text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {headerActions}
        {onRefresh && (
          <button onClick={onRefresh} className="user-btn-secondary px-4 py-2 text-xs font-semibold">
            Làm mới
          </button>
        )}
        <button onClick={playAll} className="user-btn-primary px-5 py-2 text-xs font-semibold">
          Phát tất cả
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="user-page-shell p-6 text-sm text-white/60">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="user-page-shell p-6">
        {renderHeader()}
        <div className="mt-4 text-sm text-white/60">Không có bài hát để hiển thị.</div>
      </div>
    );
  }

  const rankingStyle = (order) => {
    if (order === 1) return "text-xl font-black text-amber-300 sm:text-2xl";
    if (order === 2) return "text-xl font-black text-emerald-200 sm:text-2xl";
    if (order === 3) return "text-xl font-black text-rose-200 sm:text-2xl";
    return "text-sm font-semibold text-white/60";
  };

  return (
    <div className="user-page-shell p-6">
      {renderHeader()}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-[#121212] scrollbar-muted">
        <div className="min-w-0 xl:min-w-[640px]">
          <div className="hidden grid-cols-[48px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-white/50 xl:grid">
            <span className="text-center">#</span>
            <span>Bài hát</span>
            <span>Album</span>
            <span className="text-right">Thời gian</span>
          </div>

          <div className="divide-y divide-white/10">
            {songs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isActive = normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);
              const order = song.rank ?? index + 1;
              return (
                <div
                  key={song.id || index}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 text-sm transition xl:grid-cols-[48px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] ${
                    isActive ? "bg-emerald-400/10" : "md:hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="hidden justify-center xl:flex">
                    <span className={rankingStyle(order)}>{order}</span>
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12">
                      <OptimizedImage src={resolveAssetUrl(song.cover_url)} alt={song.title} className="h-full w-full object-cover" />
                      <button
                        onClick={() => handlePlaySong(song, songs)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition md:group-hover:opacity-100"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-black shadow-[0_8px_16px_rgba(52,211,153,0.35)]">
                          {isActive && isPlaying ? <FiPause className="text-sm" /> : <FiPlay className="ml-0.5 text-sm" />}
                        </span>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <SongDetailLink
                        song={song}
                        className={`truncate font-medium transition md:hover:text-emerald-300 md:hover:underline ${
                          isActive ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </SongDetailLink>
                      <div className="truncate text-xs text-white/60">
                        <ArtistNames
                          item={song}
                          stopPropagation
                          linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden truncate text-xs text-white/70 xl:block">
                    {song.album_id && song.album_title ? (
                      <Link to={`/album/${song.album_id}`} onClick={(e) => e.stopPropagation()} className="md:hover:underline">
                        {song.album_title}
                      </Link>
                    ) : (
                      song.album_title || "-"
                    )}
                  </div>

                  <div className="hidden items-center justify-end gap-4 text-xs text-white/70 xl:flex">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-9 w-9 !border-white/20 !bg-white/[0.06] md:hover:!bg-white/[0.14]"
                    />
                    <SongDetailIconButton song={song} className="h-9 w-9 border-white/20" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(songId);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-rose-400/60 bg-rose-400/10 text-rose-300"
                          : "border-white/20 text-white/60 md:hover:border-white/40 md:hover:text-white"
                      }`}
                    >
                      <FiHeart className="text-[16px]" />
                    </button>
                    <span className="tabular-nums">{formatDuration(song.duration)}</span>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-2 xl:hidden">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-8 w-8 !border-white/20 !bg-white/[0.06] md:hover:!bg-white/[0.14]"
                    />
                    <SongDetailIconButton song={song} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(songId);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-rose-400/60 bg-rose-400/10 text-rose-300"
                          : "border-white/20 text-white/60 md:hover:border-white/40 md:hover:text-white"
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
    </div>
  );
}
