import { FiHeart, FiPause, FiPlay, FiRadio } from "react-icons/fi";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";

export default function SongCard({ song, queue }) {
  const {
    playSong,
    pause,
    resume,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  const isActive = currentSong?.id === song.id;
  const normalizedId = normalizeSongId(song);
  const isLiked = normalizedId !== null && likedSongIds.includes(normalizedId);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isActive) {
      isPlaying ? pause() : resume();
    } else {
      playSong(song, queue);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(song.id);
  };

  return (
    <div
      onClick={() => playSong(song, queue)}
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-4 transition shadow-[0_18px_50px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_22px_60px_rgba(0,0,0,0.5)] ${
        isActive ? "ring-1 ring-cyan-300/70" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={handlePlay}
          className="relative shrink-0 overflow-hidden rounded-xl"
        >
          <img
            src={song.cover_url}
            className="h-16 w-16 rounded-xl object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
          <span
            className={`absolute inset-0 flex items-center justify-center text-white transition ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-lg shadow-lg shadow-cyan-500/40">
              {isActive && isPlaying ? <FiPause /> : <FiPlay />}
            </span>
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
            <FiRadio className="text-cyan-300" />
            Đề xuất
          </div>
          <div className="truncate text-lg font-semibold text-white drop-shadow-sm">
            {song.title}
          </div>
          <div className="truncate text-sm text-white/70">{song.artist_name}</div>
        </div>

        <button
          onClick={handleLike}
          className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm transition hover:border-white/30 hover:bg-white/10 ${
            isLiked ? "text-rose-300" : "text-white/60"
          }`}
        >
          <FiHeart />
        </button>
      </div>
    </div>
  );
}