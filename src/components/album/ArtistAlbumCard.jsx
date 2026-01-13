import { FiMusic, FiPlay, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import usePlayerStore from "../../store/player.store";
import FollowArtistButton from "../artist/FollowArtistButton";

export default function ArtistAlbumCard({ artist, variant = "grid" }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const isRail = variant === "rail";

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
        artist_name: artistData?.name || artist.artist_name,
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
      className={`
        group relative cursor-pointer
        w-full overflow-hidden rounded-2xl
        border border-white/10
        bg-gradient-to-br from-white/5 via-white/0 to-white/5
        backdrop-blur
        transition-all duration-300
        active:scale-[0.98]
        ${isRail ? "p-2 shadow-[0_10px_28px_rgba(0,0,0,0.30)]" : "p-3 shadow-[0_12px_36px_rgba(0,0,0,0.35)]"}
        hover:shadow-[0_20px_50px_rgba(56,189,248,0.18)]
      `}
    >
      {/* glow (giảm bớt cho rail để không “bệt/loá”) */}
      {!isRail && (
        <>
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl" />
        </>
      )}

      {/* AVATAR */}
      <div
        className={`
          relative mx-auto overflow-hidden rounded-full
          ${isRail ? "w-16" : "w-20 sm:w-28 lg:w-36"}
        `}
      >
        <img
          src={artist.cover_url}
          alt={artist.artist_name}
          className={`
            rounded-full object-cover
            transition-transform duration-500 group-hover:scale-[1.06]
            ${isRail ? "h-16 w-16" : "h-20 w-20 sm:h-28 sm:w-28 lg:h-36 lg:w-36"}
          `}
        />

        {/* overlay */}
        <div
          className="
            pointer-events-none absolute inset-0 rounded-full
            bg-gradient-to-t from-black/70 via-black/30 to-transparent
            opacity-0 transition duration-300
            group-hover:opacity-100
          "
        />

        {/* PLAY BUTTON */}
        <button
          onClick={handlePlayArtist}
          className="
            absolute inset-0 flex items-center justify-center
            opacity-0 transition duration-300
            group-hover:opacity-100
          "
        >
          <span
            className={`
              flex items-center justify-center rounded-full
              bg-gradient-to-br from-cyan-400 to-violet-500
              text-[#0c0914]
              shadow-lg shadow-violet-400/40
              transition-transform duration-300 group-hover:scale-110
              ${isRail ? "h-9 w-9 text-base" : "h-10 w-10 sm:h-12 sm:w-12 text-lg sm:text-xl"}
            `}
          >
            <FiPlay />
          </span>
        </button>
      </div>

      {/* INFO */}
      <div className={`relative text-center ${isRail ? "mt-2 space-y-0.5" : "mt-3 sm:mt-4 space-y-1"}`}>
        <div className={`flex items-center justify-center gap-2 uppercase text-white/50 ${isRail ? "text-[9px] tracking-[0.18em]" : "text-[10px] sm:text-[11px] tracking-[0.2em]"}`}>
          <FiUsers className="text-cyan-300" />
          Nghệ sĩ
        </div>

        <h3 className={`truncate font-semibold text-white drop-shadow-sm ${isRail ? "text-[11px]" : "text-xs sm:text-sm lg:text-base"}`}>
          {artist.artist_name}
        </h3>

        {/* rail: để gọn, bỏ dòng bài hát */}
        {!isRail && (
          <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-white/70">
            <FiMusic className="text-violet-300" />
            <span>{artist.song_count ?? 0} bài hát</span>
          </div>
        )}

        <div className={`flex justify-center ${isRail ? "pt-1" : "pt-2"}`}>
          <FollowArtistButton artist={artist} size="sm" />
        </div>
      </div>
    </div>
  );
}
