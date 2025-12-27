import { Link } from "react-router-dom";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration, fetchPlayableSong } from "../../utils/song";
import { getSongById } from "../../api/song.api";

export default function SongTable({
  title,
  subtitle,
  songs,
  loading,
  onRefresh,
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
      return itemId && itemId === normalizedId ? { ...item, ...playable } : item;
    });

    if (normalizeSongId(currentSong) === normalizedId) {
      isPlaying ? pause() : resume();
    } else {
       playSong(playable, updatedQueue);
    }
  };

  const playAll = () => {
    if (songs.length) {
       handlePlaySong(songs[0], songs);
    }
  };

  const renderHeader = () => (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/60">Bảng xếp hạng</p>
        <h2 className="text-2xl font-extrabold text-white drop-shadow-sm">{title}</h2>
        {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 text-xs font-semibold rounded-full bg-white/10 text-white/80 hover:bg-white/20 border border-white/20"
          >
            Làm mới
          </button>
        )}
        <button
          onClick={playAll}
          className="px-4 py-2 text-xs font-semibold rounded-full bg-green-400 text-slate-900 hover:bg-green-300 shadow-md shadow-green-400/30"
        >
          ▶ Phát tất cả
        </button>
      </div>
    </div>
  );

  const renderEmpty = (message) => (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-purple-900/60 p-6 shadow-2xl shadow-purple-900/20">
      {renderHeader()}
      <div className="mt-6 text-sm text-white/60">{message}</div>
    </div>
  );

  if (loading) {
    return renderEmpty("Đang tải dữ liệu...");
  }

  if (!songs.length) {
    return renderEmpty("Không có bài hát để hiển thị.");
  }

  const rankingBadge = (order) => {
    if (order === 1) return "text-3xl font-black text-amber-300 drop-shadow";
    if (order === 2) return "text-3xl font-black text-sky-200 drop-shadow";
    if (order === 3) return "text-3xl font-black text-rose-200 drop-shadow";
    return "text-lg font-semibold text-white/60";
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-purple-900/60 p-6 shadow-2xl shadow-purple-900/30 backdrop-blur">
      {renderHeader()}

      <div className="mt-6 rounded-2xl bg-white/5 border border-white/5">
        <div className="grid grid-cols-[60px_1fr_200px_90px] items-center px-4 py-3 text-[11px] uppercase tracking-widest text-white/50">
          <span className="text-center">#</span>
          <span>Bài hát</span>
          <span className="text-center">Hành động</span>
          <span className="text-right">Thời gian</span>
        </div>

        <div className="divide-y divide-white/5">
          {songs.map((song, index) => {
            const songId = normalizeSongId(song);
             const isActive = normalizeSongId(currentSong) === songId;
            const isLiked = songId && likedSongIds.includes(songId);
            const order = song.rank ?? index + 1;
            const isPlayable = Boolean(song.audio_url || songId);

            return (
              <div
                key={song.id || index}
                onClick={() => handlePlaySong(song, songs)}
                className={`grid grid-cols-[60px_1fr_200px_90px] items-center gap-3 px-4 py-3 transition duration-150 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-white/10 via-white/5 to-transparent"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-center">
                  <span className={rankingBadge(order)}>{order}</span>
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="w-12 h-12 rounded-lg object-cover shadow-lg shadow-black/30"
                    />

                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm">
                        <span className="text-sm">{isPlaying ? "⏸" : "▶"}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`truncate font-semibold ${
                        isActive ? "text-green-300" : "text-white"
                      }`}
                    >
                      {song.title}
                    </p>
                    <p className="text-xs text-white/60 truncate flex items-center gap-1">
                      <span className="truncate">{song.artist_name}</span>
                      {song.album_id && song.album_title && (
                        <>
                          <span className="shrink-0">•</span>
                          <Link
                            to={`/album/${song.album_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:underline truncate"
                          >
                            {song.album_title}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaySong(song, songs);
                    }}
                    disabled={!isPlayable}
                   className={`h-9 w-9 rounded-full border border-white/15 bg-white/10 text-sm shadow hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                      !isPlayable ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isActive && isPlaying ? "⏸" : "▶"}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(song);
                    }}
                    className="h-9 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/15"
                  >
                    ➕ Queue
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (songId) toggleLike(songId);
                    }}
                    className={`h-9 w-9 rounded-full flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/15 ${
                      isLiked ? "text-rose-300 border-rose-300/40" : "text-white"
                    }`}
                  >
                    ♥
                  </button>
                </div>

                <div className="text-right text-sm text-white/60">
                  {formatDuration(song.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}