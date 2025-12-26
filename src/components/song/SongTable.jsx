import { Link } from "react-router-dom";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration } from "../../utils/song";

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

  const handlePlaySong = (song, queue) => {
    if (currentSong?.id === song.id) {
      isPlaying ? pause() : resume();
    } else {
      playSong(song, queue);
    }
  };

  const playAll = () => {
    if (songs.length) {
      playSong(songs[0], songs);
    }
  };

  if (loading) {
    return (
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="text-sm text-white/60">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!songs.length) {
    return (
      <div className="p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="font-semibold text-lg">{title}</div>
            {subtitle && <div className="text-sm text-white/60">{subtitle}</div>}
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
              >
                Làm mới
              </button>
            )}
          </div>
        </div>
        <div className="text-sm text-white/60">Không có bài hát để hiển thị.</div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-semibold text-lg">{title}</div>
          {subtitle && <div className="text-sm text-white/60">{subtitle}</div>}
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20"
            >
              Làm mới
            </button>
          )}
          <button
            onClick={playAll}
            className="px-3 py-1 text-xs rounded bg-green-500 font-semibold"
          >
            ▶ Phát tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[40px_1fr_180px] text-xs text-white/60 border-b border-white/10 pb-2">
        <div>#</div>
        <div>BÀI HÁT</div>
        <div className="text-right">HÀNH ĐỘNG</div>
      </div>

      <div className="space-y-2">
        {songs.map((song, index) => {
          const isActive = currentSong?.id === song.id;
          const songId = normalizeSongId(song);
          const isLiked = songId && likedSongIds.includes(songId);

          return (
            <div
              key={song.id || index}
              onClick={() => handlePlaySong(song, songs)}
              className={`grid grid-cols-[40px_1fr_180px] items-center text-sm p-2 rounded cursor-pointer transition ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <div className="text-center text-white/60">{index + 1}</div>

              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="w-11 h-11 rounded object-cover"
                  />

                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                      <span className="text-sm">{isPlaying ? "⏸" : "▶"}</span>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div
                    className={`font-medium truncate ${
                      isActive ? "text-green-400" : ""
                    }`}
                  >
                    {song.title}
                  </div>
                  <div className="text-xs text-white/60 truncate flex gap-1 items-center">
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
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlaySong(song, songs);
                  }}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                >
                  {isActive && isPlaying ? "⏸" : "▶"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToQueue(song);
                  }}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                >
                  ➕ Queue
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (songId) toggleLike(songId);
                  }}
                  className={`px-2 py-1 rounded bg-white/10 hover:bg-white/20 ${
                    isLiked ? "text-red-400" : "text-white"
                  }`}
                >
                  ♥
                </button>

                <span className="text-white/60 min-w-[44px] text-right">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}