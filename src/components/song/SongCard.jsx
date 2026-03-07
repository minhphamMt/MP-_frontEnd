import { useEnsureLikedSongsLoaded } from "../../hooks/useEnsureLibraryState";
import { FiHeart, FiPause, FiPlay, FiRadio } from "react-icons/fi";
import AddToPlaylistButton from "../playlists/AddToPlaylistButton";
import usePlayerStore, { normalizeSongId } from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";
import ArtistNames from "../artist/ArtistNames";

export default function SongCard({ song, queue }) {
  useEnsureLikedSongsLoaded();
  const { playSong, pause, resume, currentSong, isPlaying, likedSongIds, toggleLike } = usePlayerStore();

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
      className={`group user-surface relative cursor-pointer overflow-hidden p-3 sm:p-4 ${isActive ? "ring-1 ring-emerald-300/50" : ""}`}
    >
      <div className="relative flex items-center gap-3 sm:gap-4">
        <button onClick={handlePlay} className="relative shrink-0 overflow-hidden rounded-xl">
          <OptimizedImage
            src={resolveAssetUrl(song.cover_url)}
            alt={song.title}
            className="h-14 w-14 rounded-xl object-cover transition duration-300 md:group-hover:scale-110 sm:h-16 sm:w-16"
          />
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/45 opacity-0 transition md:group-hover:opacity-100" />
          <span
            className={`absolute inset-0 flex items-center justify-center transition ${
              isActive ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300 text-base text-black shadow-lg shadow-emerald-400/35 sm:h-10 sm:w-10 sm:text-lg">
              {isActive && isPlaying ? <FiPause /> : <FiPlay />}
            </span>
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/50 sm:text-[11px] sm:tracking-[0.2em]">
            <FiRadio className="text-emerald-300" />
            Gợi ý
          </div>
          <div className={`truncate text-base font-semibold sm:text-lg ${isActive ? "text-emerald-300" : "text-white"}`}>
            {song.title}
          </div>
          <div className="truncate text-xs text-white/70 sm:text-sm">
            <ArtistNames
              item={song}
              stopPropagation
              linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
            />
          </div>
        </div>

        <AddToPlaylistButton
          song={song}
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[13px] text-white/70 transition md:hover:border-white/30 md:hover:bg-white/14 sm:h-9 sm:w-9 sm:text-sm"
        />
        <button
          onClick={handleLike}
          className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[13px] transition md:hover:border-white/30 md:hover:bg-white/14 sm:h-9 sm:w-9 sm:text-sm ${
            isLiked ? "text-rose-300" : "text-white/60"
          }`}
          title={isLiked ? "Bỏ thích" : "Yêu thích"}
        >
          <FiHeart />
        </button>
      </div>
    </div>
  );
}
