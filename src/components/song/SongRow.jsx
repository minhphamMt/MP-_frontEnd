import { FiPlay, FiPause } from "react-icons/fi";
import { Link } from "react-router-dom";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { formatDuration } from "../../utils/song";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";
import ArtistNames from "../artist/ArtistNames";
import { SongDetailLink } from "./SongDetailLink";

export default function SongRow({ song, queue }) {
  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const isActive = normalizeSongId(currentSong) === normalizeSongId(song);

  const handlePlay = (e) => {
    e.stopPropagation();
    playSong(song, queue);
  };

  return (
    <div
      onClick={handlePlay}
      className={`group relative flex w-full min-w-0 max-w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl px-3 py-2 transition-all duration-200 sm:gap-4 ${
        isActive ? "bg-emerald-400/10 ring-1 ring-emerald-300/40" : "md:hover:bg-white/[0.06]"
      }`}
    >
      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg">
        <OptimizedImage
          src={resolveAssetUrl(song.cover_url)}
          alt={song.title}
          className="h-full w-full object-cover transition duration-300 md:group-hover:scale-105"
        />
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/45 transition ${
            isActive ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-black shadow-md">
            {isActive && isPlaying ? <FiPause size={14} /> : <FiPlay size={14} className="ml-0.5" />}
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className={`truncate text-sm font-semibold transition ${isActive ? "text-emerald-300" : "text-white"}`}>
          <SongDetailLink
            song={song}
            className="block w-full truncate transition md:hover:text-emerald-300 md:hover:underline"
          >
            {song.title}
          </SongDetailLink>
        </div>
        <div className="flex min-w-0 max-w-full items-center gap-1 overflow-hidden text-xs text-white/60">
          <ArtistNames
            item={song}
            stopPropagation
            className="min-w-0 truncate text-white/70"
            linkClassName="min-w-0 truncate text-white/70 transition md:hover:text-emerald-300 md:hover:underline"
          />

          {song.album_id && song.album_title && (
            <>
              <span className="flex-shrink-0 opacity-40">.</span>
              <Link
                to={`/album/${song.album_id}`}
                onClick={(e) => e.stopPropagation()}
                className="min-w-0 truncate text-white/70 transition md:hover:text-emerald-300 md:hover:underline"
              >
                {song.album_title}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="hidden flex-shrink-0 text-xs text-white/50 tabular-nums sm:block">{formatDuration(song.duration)}</div>
    </div>
  );
}
