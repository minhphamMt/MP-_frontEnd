import { FiHeart, FiPause, FiPlay, FiRadio } from "react-icons/fi";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";
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
        group relative overflow-hidden rounded-2xl border border-[#242424]
        bg-[#181818] p-3 shadow-[0_16px_45px_rgba(0,0,0,0.35)] sm:p-4
        transition-all duration-200 
        ${isActive ? "ring-1 ring-[#1db954]/60" : ""}
      `}
    >
      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* Cover + Play */}
        <button
          onClick={handlePlay}
          className="relative shrink-0 overflow-hidden rounded-xl"
        >
          <img
            src={song.cover_url}
            alt={song.title}
             className="h-14 w-14 rounded-xl object-cover transition duration-300 group-hover:scale-110 sm:h-16 sm:w-16"
          />

          <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />

          <span
            className={`absolute inset-0 flex items-center justify-center transition ${
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-base text-black shadow-lg shadow-[#1db954]/40 sm:h-10 sm:w-10 sm:text-lg">
              {isActive && isPlaying ? <FiPause /> : <FiPlay />}
            </span>
          </span>
        </button>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/50 sm:text-[11px] sm:tracking-[0.2em]">
            <FiRadio className="text-[#1db954]" />
            Gợi ý
          </div>

          <div
            className={`truncate text-base font-semibold drop-shadow-sm sm:text-lg ${
              isActive ? "text-[#1ed760]" : "text-white"
            }`}
          >
            {song.title}
          </div>

          <div className="truncate text-xs text-white/70 sm:text-sm">
            {song.artist_name}
          </div>
        </div>

        {/* Like */}
         <AddToPlaylistButton
          song={song}
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[13px] text-white/70 transition hover:border-white/20 hover:bg-white/10 sm:h-9 sm:w-9 sm:text-sm"
        />
        <button
          onClick={handleLike}
          className={`
           flex h-8 w-8 items-center justify-center rounded-full
            border border-white/10 bg-white/5 text-[13px] sm:h-9 sm:w-9 sm:text-sm
            transition hover:border-white/30 hover:bg-white/10
            ${isLiked ? "text-emerald-300" : "text-white/60"}
          `}
          title={isLiked ? "Bỏ thích" : "Yêu thích"}
        >
          <FiHeart />
        </button>
      </div>
    </div>
  );
}
