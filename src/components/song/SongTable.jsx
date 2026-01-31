import { Link } from "react-router-dom";
import { FiHeart, FiPause, FiPlay } from "react-icons/fi";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration, fetchPlayableSong } from "../../utils/song";
import { getSongById } from "../../api/song.api";
import { resolveAssetUrl } from "../../utils/asset";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";

export default function SongTable({
  title,
  subtitle,
  songs,
  loading,
  onRefresh,
  headerActions,
}) {
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const handlePlaySong = async (song, queue) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = queue.map((item) => {
      const itemId = normalizeSongId(item);
      return itemId && itemId === normalizedId
        ? { ...item, ...playable }
        : item;
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
        {subtitle && (
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-300 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)]" />
          <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {headerActions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="rounded-full border border-white/10 bg-[#1f1f1f] px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-[#2a2a2a]"
          >
            Làm mới
          </button>
        )}
        <button
          onClick={playAll}
          className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
        >
          ▶ Phát tất cả
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#181818] p-6 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#181818] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        {renderHeader()}
        <div className="mt-4 text-sm text-white/60">
          Không có bài hát để hiển thị.
        </div>
      </div>
    );
  }

  const rankingStyle = (order) => {
    if (order === 1) return "text-xl font-black text-amber-300 sm:text-2xl";
    if (order === 2) return "text-xl font-black text-sky-200 sm:text-2xl";
    if (order === 3) return "text-xl font-black text-rose-200 sm:text-2xl";
    return "text-sm font-semibold text-white/60";
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-[#181818] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
      {renderHeader()}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5 bg-[#121212] scrollbar-muted">
        <div className="min-w-0 lg:min-w-[640px]">
          {/* Header */}
          <div className="hidden grid-cols-[48px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-white/50 lg:grid">
            <span className="text-center">#</span>
            <span>Bài hát</span>
            <span>Album</span>
            <span className="text-right">Thời gian</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/5">
            {songs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isActive = normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);
              const order = song.rank ?? index + 1;

              return (
                <div
                  key={song.id || index}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 text-sm transition lg:grid-cols-[48px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)] ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-400/10 to-transparent"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="hidden justify-center lg:flex">
                    <span className={rankingStyle(order)}>{order}</span>
                  </div>

                  {/* Song info */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md sm:h-12 sm:w-12">
                        <img
                        src={resolveAssetUrl(song.cover_url)}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handlePlaySong(song, songs)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-[0_8px_16px_rgba(29,185,84,0.35)]">
                          {isActive && isPlaying ? (
                            <FiPause className="text-sm" />
                          ) : (
                            <FiPlay className="ml-0.5 text-sm" />
                          )}
                        </span>
                      </button>
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`truncate font-medium ${
                          isActive ? "text-cyan-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="truncate text-xs text-white/60">
                        {song.artist_name}
                      </div>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="hidden truncate text-xs text-white/70 lg:block">
                    {song.album_id && song.album_title ? (
                      <Link
                        to={`/album/${song.album_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {song.album_title}
                      </Link>
                    ) : (
                      song.album_title || "—"
                    )}
                  </div>

                  {/* Duration */}
                  <div className="hidden items-center justify-end gap-4 text-xs text-white/70 lg:flex">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-9 w-9 !border-white/20 !bg-white/5 hover:!bg-white/15"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(songId);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                          : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
                      }`}
                    >
                      <FiHeart className="text-[16px]" />
                    </button>
                    <span className="tabular-nums">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center justify-end gap-2 lg:hidden">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-8 w-8 !border-white/20 !bg-white/5 hover:!bg-white/15"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(songId);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
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
    </div>
  );
}