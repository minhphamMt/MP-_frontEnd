import { Link } from "react-router-dom";
import { FiPlay, FiPause } from "react-icons/fi";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration } from "../../utils/song";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

export default function SongRow({ song, queue }) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const isActive =
    normalizeSongId(currentSong) === normalizeSongId(song);

  const handlePlay = (e) => {
    e.stopPropagation();
    playSong(song, queue);
  };

  return (
    <div
      onClick={handlePlay}
      className={`
        group relative flex w-full min-w-0 max-w-full items-center
        gap-3 sm:gap-4
        rounded-xl px-3 py-2
        cursor-pointer
        transition-all duration-200
        hover:bg-[#2a2a2a]
        ${isActive ? "bg-[#242424] ring-1 ring-emerald-400/40" : ""}
      `}
    >
      {/* Cover */}
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg">
        <OptimizedImage
          src={resolveAssetUrl(song.cover_url)}
          alt={song.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* Overlay play/pause */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            bg-black/40 backdrop-blur-sm transition
            ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
          `}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-black shadow-md">
            {isActive && isPlaying ? (
              <FiPause size={14} />
            ) : (
              <FiPlay size={14} className="ml-0.5" />
            )}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 overflow-hidden">
        {/* Title */}
        <div
          className={`truncate text-sm font-semibold transition ${
            isActive ? "text-emerald-300" : "text-white"
          }`}
        >
          {song.title}
        </div>

        {/* Artist + Album */}
        <div className="flex min-w-0 items-center gap-1 text-xs text-white/60">
          <span className="truncate">{song.artist_name}</span>

          {song.album_id && song.album_title && (
            <>
              <span className="flex-shrink-0 opacity-40">•</span>
              <Link
                to={`/album/${song.album_id}`}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 truncate text-white/70 hover:text-emerald-300 hover:underline transition"
              >
                {song.album_title}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Duration (ẩn trên mobile) */}
      <div className="hidden flex-shrink-0 text-xs text-white/50 tabular-nums sm:block">
        {formatDuration(song.duration)}
      </div>
    </div>
  );
}
