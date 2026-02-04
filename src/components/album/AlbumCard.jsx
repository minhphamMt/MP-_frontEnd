import { FiDisc, FiHeart, FiMusic, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAlbumById } from "../../api/album.api";
import useAlbumLikeStore, {
  normalizeAlbumId,
} from "../../store/album-like.store";
import usePlayerStore from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";

export default function AlbumCard({ album, variant = "rail" }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((s) => s.toggleAlbumLike);
  const albumId = normalizeAlbumId(album);
  const isLiked = albumId && likedAlbumIds.includes(albumId);
  const isRail = variant === "rail";
  const isLibrary = variant === "library";

  const handlePlayAlbum = async (e) => {
    e.stopPropagation();

    try {
      const res = await getAlbumById(album.id);
      const data = res?.data?.data;
      if (!data || !data.songs?.length) return;

      const songs = data.songs.map((s) => ({
        id: s.id,
        title: s.title,
        artist_name: s.artist_name || s.artist?.name || "",
        duration: s.duration,
        cover_url: s.cover_url,
        audio_url: `${import.meta.env.VITE_API_BASE_URL}${s.audio_path}`,
      }));

      playSong(songs[0], songs);
    } catch (err) {
      console.error("Play album error:", err);
    }
  };

  return (
    <div
      data-card
      onClick={() => navigate(`/album/${album.id}`)}
      className={`group relative cursor-pointer overflow-hidden transition-all duration-300
        ${
          isLibrary
            ? "rounded-lg border border-transparent bg-[#181818] p-4 hover:bg-[#242424]"
            : "rounded-xl border border-white/10 bg-[#181818] p-3 hover:bg-[#242424]"
        }
        ${
          isRail
            ? "w-44 shrink-0 sm:w-60 sm:p-4 lg:w-64"
            : "w-full sm:p-4"
        }`}
    >

      {/* COVER */}
         <div
  className={`relative w-full overflow-hidden aspect-square ${
    isLibrary ? "rounded-md" : "rounded-xl"
  }`}
>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAlbumLike(albumId);
          }}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
            isLiked
              ? "border-[#1db954]/60 bg-[#1db954]/15 text-[#1db954]"
              : isLibrary
                ? "border-white/10 bg-black/40 text-white/70 hover:bg-black/60"
                : "border-white/20 bg-black/40 text-white/70 hover:bg-black/60"
          }`}
          aria-label={isLiked ? "Bỏ thích album" : "Thích album"}
        >
          <FiHeart />
        </button>
        <img
  src={resolveAssetUrl(album.cover_url)}
  alt={album.title}
  className={`
    absolute inset-0
    h-full w-full
    object-cover
    transition-transform duration-500
    group-hover:scale-[1.05]
  `}
/>


        {/* overlay gradient */}
        {!isLibrary && (
          <div
            className="pointer-events-none absolute inset-0 
            bg-gradient-to-t from-black/70 via-black/30 to-transparent 
            opacity-0 transition duration-300 
            group-hover:opacity-100"
          />
        )}

        {/* PLAY BUTTON */}
        <button
          onClick={handlePlayAlbum}
          className={`absolute ${
            isLibrary ? "bottom-3 right-3" : "inset-0 flex items-center justify-center"
          } opacity-0 transition duration-300 group-hover:opacity-100`}
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition-transform duration-300 group-hover:scale-110 ${
              isLibrary
                 ? "h-11 w-11 bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40"
                : "bg-[#1db954] text-black shadow-lg shadow-[#1db954]/40"
            }`}
          >
            <FiPlay />
          </span>
        </button>
      </div>

      {/* INFO */}
      <div className="relative mt-3 space-y-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
           <FiDisc className="text-[#1db954]" />
          Album
        </div>

          <h3 className="truncate text-sm font-semibold text-white sm:text-base">
          {album.title}
        </h3>

        <div className="flex items-center gap-2 text-xs text-white/70 sm:text-sm">
           <FiMusic className="shrink-0 text-white/60" />
          <span className="truncate">
            {album.artist_name || album.artist?.name || ""}
          </span>
        </div>
      </div>
    </div>
  );
}
