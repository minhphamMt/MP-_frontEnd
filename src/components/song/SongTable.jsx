import { Link } from "react-router-dom";
import { FiPlay, FiPause, FiHeart, FiList } from "react-icons/fi";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration, fetchPlayableSong } from "../../utils/song";
import { getSongById } from "../../api/song.api";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";

export default function SongTable({
  title,
  subtitle,
  songs,
  loading,
  onRefresh,
  headerActions,
  hideQueueAction = false,
  hidePlayOnMobile = false,
}) {
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
    addToQueue,
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
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
            {subtitle}
          </p>
        )}
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500 shadow-[0_0_12px_rgba(34,211,238,0.45)]" />
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
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
          >
            Làm mới
          </button>
        )}
        <button
          onClick={playAll}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:shadow-cyan-300/50"
        >
          ▶ Phát tất cả
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        {renderHeader()}
        <div className="mt-4 text-sm text-white/60">
          Không có bài hát để hiển thị.
        </div>
      </div>
    );
  }

  const rankingStyle = (order) => {
    if (order === 1) return "text-2xl font-black text-amber-300 sm:text-3xl";
    if (order === 2) return "text-2xl font-black text-sky-200 sm:text-3xl";
    if (order === 3) return "text-2xl font-black text-rose-200 sm:text-3xl";
    return "text-lg font-semibold text-white/60";
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c132d] via-[#130f27] to-[#0b1424] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur">
      {renderHeader()}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 scrollbar-muted">
        <div className="min-w-0 sm:min-w-[640px]">
          {/* Header */}
          <div className="hidden grid-cols-[64px_1fr_220px_90px] px-3 py-3 text-[11px] uppercase tracking-[0.18em] text-white/50 sm:grid sm:px-4">
            <span className="text-center">#</span>
            <span>Bài hát</span>
            <span className="text-center">Hành động</span>
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
                  onClick={() => handlePlaySong(song, songs)}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-3 transition sm:grid-cols-[64px_1fr_220px_90px] sm:gap-3 sm:px-4 ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-400/10 via-white/5 to-transparent"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className="hidden text-center sm:block">
                    <span className={rankingStyle(order)}>{order}</span>
                  </div>

                  {/* Song info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg sm:h-12 sm:w-12">
                      <img
                        src={song.cover_url}
                        alt={song.title}
                        className="h-full w-full object-cover transition group-hover:scale-110"
                      />
                      {isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                          {isPlaying ? <FiPause /> : <FiPlay />}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`truncate text-sm font-semibold sm:text-base ${
                          isActive ? "text-cyan-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="hidden truncate text-xs text-white/60 sm:block">
                        {song.artist_name}
                        {song.album_id && song.album_title && (
                          <>
                            {" • "}
                            <Link
                              to={`/album/${song.album_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="hover:underline"
                            >
                              {song.album_title}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                   <div className="flex items-center justify-end gap-2 sm:justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song, songs);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20 sm:h-9 sm:w-9 ${
                        hidePlayOnMobile ? "hidden sm:flex" : ""
                      }`}
                    >
                      {isActive && isPlaying ? <FiPause /> : <FiPlay />}
                    </button>

                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-8 w-8 !border-white/10 !bg-white/5 hover:!bg-white/15 sm:h-9 sm:w-9"
                    />

                    {!hideQueueAction && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(song);
                        }}
                         className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/15 sm:h-9 sm:w-9"
                      >
                        <FiList />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(songId);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition sm:h-9 sm:w-9 ${
                        isLiked
                          ? "border-rose-400/40 text-rose-300"
                          : "border-white/10 text-white/70 hover:bg-white/15"
                      }`}
                    >
                      <FiHeart />
                    </button>
                  </div>

                  {/* Duration */}
                  <div className="hidden text-right text-sm text-white/60 tabular-nums sm:block">
                    {formatDuration(song.duration)}
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
