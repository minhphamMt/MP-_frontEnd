import { FiDisc, FiHeart, FiMusic, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAlbumById } from "../../api/album.api";
import { useEnsureLikedAlbumsLoaded } from "../../hooks/useEnsureLibraryState";
import useAlbumLikeStore, { normalizeAlbumId } from "../../store/album-like.store";
import usePlayerStore from "../../store/player.store";
import { resolveAssetUrl } from "../../utils/asset";
import { getAlbumPath } from "../../utils/entityPath";
import OptimizedImage from "../common/OptimizedImage";
import { getArtistLabel, getPrimaryArtistId, normalizeArtists } from "../../utils/artist";
import { toPlayableSong } from "../../utils/song";
import ArtistNames from "../artist/ArtistNames";

export default function AlbumCard({ album, variant = "rail", density = "cozy" }) {
  useEnsureLikedAlbumsLoaded();
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((s) => s.toggleAlbumLike);
  const albumId = normalizeAlbumId(album);
  const isLiked = albumId && likedAlbumIds.includes(albumId);
  const isRail = variant === "rail";
  const isLibrary = variant === "library";
  const isCompact = density === "compact";

  const handlePlayAlbum = async (e) => {
    e.stopPropagation();

    try {
      const res = await getAlbumById(album.id);
      const data = res?.data?.data;
      if (!data || !data.songs?.length) return;

      const songs = data.songs.map((s) => {
        const fallbackArtists = normalizeArtists({
          artist_id: s.artist_id || s.artist?.id || data.artist_id || data.artist?.id,
          artist_name: s.artist_name || s.artist?.name || data.artist_name || data.artist?.name || "",
        });
        const artists = normalizeArtists({ ...s, artists: s.artists || fallbackArtists });

        return toPlayableSong({
          ...s,
          artist_name: getArtistLabel({ ...s, artists }, ""),
          artist_id: getPrimaryArtistId({ ...s, artists }),
          artists,
          album_id: s.album_id ?? data.id,
          album_title: s.album_title ?? data.title,
        });
      });

      playSong(songs[0], songs);
    } catch (err) {
      console.error("Play album error:", err);
    }
  };

  return (
    <div
      data-card
      onClick={() => navigate(getAlbumPath(album) || "/albums")}
      className={`group relative cursor-pointer overflow-hidden p-3 transition-all duration-300 ${isRail ? "w-44 shrink-0 sm:w-60 sm:p-4 lg:w-64" : "w-full sm:p-4"} ${
        isLibrary
          ? `${isCompact ? "rounded-[18px]" : "rounded-lg"} border border-white/10 bg-[#181818]`
          : "user-surface"
      }`}
    >
      <div
        className={`relative aspect-square w-full overflow-hidden ${
          isLibrary ? (isCompact ? "rounded-[14px]" : "rounded-md") : "rounded-xl"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAlbumLike(albumId);
          }}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
            isLiked
              ? "border-rose-300/70 bg-rose-300/20 text-rose-200"
              : "border-white/20 bg-black/35 text-white/75 md:hover:bg-black/55"
          }`}
          aria-label={isLiked ? "Bỏ thích album" : "Thích album"}
        >
          <FiHeart />
        </button>
        <OptimizedImage
          src={resolveAssetUrl(album.cover_url)}
          alt={album.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.05]"
        />

        {!isLibrary && (
          <div className="pointer-events-none absolute inset-0 bg-black/35 opacity-0 transition duration-300 md:group-hover:opacity-100" />
        )}

        <button
          onClick={handlePlayAlbum}
          className={`absolute ${isLibrary ? "bottom-3 right-3" : "inset-0 flex items-center justify-center"} opacity-0 transition duration-300 md:group-hover:opacity-100`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-300 text-xl text-black shadow-lg shadow-emerald-400/35 transition-transform duration-300 md:group-hover:scale-110">
            <FiPlay />
          </span>
        </button>
      </div>

      <div className={`relative ${isCompact ? "mt-2.5 space-y-1" : "mt-3 space-y-1"}`}>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiDisc className="text-emerald-300" />
          Album
        </div>

        <h3
          className={`truncate font-semibold text-white ${
            isCompact ? "text-[13px] sm:text-sm" : "text-sm sm:text-base"
          }`}
        >
          {album.title}
        </h3>

        <div
          className={`flex items-center gap-2 text-white/70 ${
            isCompact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"
          }`}
        >
          <FiMusic className="shrink-0 text-white/60" />
          <ArtistNames
            item={album}
            className="truncate"
            linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
            fallback={album.artist_name || album.artist?.name || ""}
          />
        </div>
      </div>
    </div>
  );
}
