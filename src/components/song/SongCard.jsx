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

  const normalizedId = normalizeSongId(song);
  const isActive = normalizeSongId(currentSong) === normalizedId;
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
      className={`
        group relative overflow-hidden rounded-2xl border border-white/10
        bg-gradient-to-br from-white/5 via-white/0 to-white/5
        p-4 shadow-[0_18px_55px_rgba(0,0,0,0.45)]
        transition-all duration-200 
        ${isActive ? "ring-1 ring-cyan-300/60" : ""}
      `}
    >
      {/* glow background */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="relative flex items-center gap-4">
        {/* Cover + Play */}
        <button
          onClick={handlePlay}
          className="relative shrink-0 overflow-hidden rounded-xl"
        >
          <img
            src={song.cover_url}
            alt={song.title}
            className="h-16 w-16 rounded-xl object-cover transition duration-300 group-hover:scale-110"
          />

          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />

          <span
            className={`absolute inset-0 flex items-center justify-center transition ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-lg text-white shadow-lg shadow-cyan-400/40">
              {isActive && isPlaying ? <FiPause /> : <FiPlay />}
            </span>
          </span>
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
            <FiRadio className="text-cyan-300" />
            Gợi ý
          </div>

          <div
            className={`truncate text-lg font-semibold drop-shadow-sm ${
              isActive ? "text-cyan-200" : "text-white"
            }`}
          >
            {song.title}
          </div>

          <div className="truncate text-sm text-white/70">
            {song.artist_name}
          </div>
        </div>

        {/* Like */}
        <button
          onClick={handleLike}
          className={`
            flex h-9 w-9 items-center justify-center rounded-full
            border border-white/10 bg-white/5 text-sm
            transition hover:border-white/30 hover:bg-white/10
            ${isLiked ? "text-rose-300" : "text-white/60"}
          `}
          title={isLiked ? "Bỏ thích" : "Yêu thích"}
        >
          <FiHeart />
        </button>
      </div>
    </div>
  );
}
