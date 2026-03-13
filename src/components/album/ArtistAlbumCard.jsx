import { FiMusic, FiPlay, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import usePlayerStore from "../../store/player.store";
import FollowArtistButton from "../artist/FollowArtistButton";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";
import { getArtistLabel } from "../../utils/artist";

export default function ArtistAlbumCard({
  artist,
  variant = "grid",
  density = "cozy",
}) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const isRail = variant === "rail";
  const isLibrary = variant === "library";
  const isCompact = density === "compact";
  const songCount =
    artist?.song_count ?? artist?.track_count ?? artist?.songs_count ?? artist?.songs?.length ?? 0;

  const handlePlayArtist = async (e) => {
    e.stopPropagation();

    try {
      const res = await api.get("/songs/art", {
        params: { artist_id: artist.artist_id },
      });

      const payload = res?.data?.data || {};
      const artistData = payload.artist;
      const songList = payload.songs || [];

      if (!songList.length) return;

      const songs = songList.map((s) => ({
        id: s.id,
        title: s.title,
        artist_name: getArtistLabel(s, artistData?.name || artist.artist_name || ""),
        artists: s.artists,
        duration: s.duration,
        cover_url: s.cover_url,
        audio_url: `${import.meta.env.VITE_API_BASE_URL}${s.audio_path}`,
      }));

      playSong(songs[0], songs);
    } catch (err) {
      console.error("Play artist error:", err);
    }
  };

  return (
    <div
      data-card
      onClick={() => navigate(`/artist/${artist.artist_id}`)}
      className={`group relative w-full overflow-hidden p-3 transition-all duration-300 active:scale-[0.98] ${
        isLibrary
          ? `${isCompact ? "rounded-[18px]" : "rounded-lg"} border border-white/10 bg-[#181818]`
          : "user-surface"
      } ${isRail ? "" : "sm:p-4"}`}
    >
      <div
        className={`relative w-full overflow-hidden ${
          isLibrary
            ? `aspect-square ${isCompact ? "rounded-[14px]" : "rounded-lg"}`
            : "aspect-square rounded-xl"
        }`}
      >
        <OptimizedImage
          src={resolveAssetUrl(artist.cover_url)}
          alt={artist.artist_name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.05]"
        />

        {!isLibrary && (
          <div className="pointer-events-none absolute inset-0 bg-black/35 opacity-0 transition duration-300 md:group-hover:opacity-100" />
        )}

        <button
          onClick={handlePlayArtist}
          className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 md:group-hover:opacity-100"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-300 text-lg text-black shadow-lg shadow-emerald-400/40 transition-transform duration-300 md:group-hover:scale-110">
            <FiPlay />
          </span>
        </button>
      </div>

      <div
        className={`relative ${isCompact ? "mt-2.5 space-y-1" : "mt-3 space-y-1"} ${
          isRail ? "text-left" : "sm:mt-4"
        }`}
      >
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiUsers className="text-emerald-300" />
          Nghệ sĩ
        </div>

        <h3
          className={`truncate font-semibold text-white ${
            isCompact ? "text-[13px] sm:text-sm" : "text-sm sm:text-base"
          }`}
        >
          {artist.artist_name}
        </h3>

        <div
          className={`flex items-center justify-between gap-2 text-white/70 ${
            isCompact ? "text-[11px] sm:text-xs" : "text-xs"
          }`}
        >
          <div className="flex items-center gap-1">
            <FiMusic className="shrink-0 text-white/60" />
            <span>{songCount} bài hát</span>
          </div>
          {!isLibrary && (
            <FollowArtistButton artist={artist} size="sm" className="!px-2 !py-1 text-[10px]" />
          )}
        </div>
      </div>
    </div>
  );
}
