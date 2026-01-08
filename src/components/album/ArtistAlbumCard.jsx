import { FiMusic, FiPlay, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import usePlayerStore from "../../store/player.store";
import FollowArtistButton from "../artist/FollowArtistButton";

export default function ArtistAlbumCard({ artist }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const handlePlayArtist = async (e) => {
    e.stopPropagation();

    try {
      const res = await api.get("/songs/art", {
        params: { artist_id: artist.artist_id },
      });

       const payload = res?.data?.data || {};
      const artistData = payload.artist || null;
      const songList = payload.songs || [];

      if (!songList.length) return;

      const songs = songList.map((s) => ({
        id: s.id,
        title: s.title,
        artist_name: artistData?.name || "",
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
      onClick={() => navigate(`/artist/${artist.artist_id}`)}
      className="group relative w-44 shrink-0 cursor-pointer overflow-hidden rounded-2xl sm:w-52
      border border-white/10
      bg-gradient-to-br from-white/5 via-white/0 to-white/5
      p-4
      backdrop-blur
      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
      transition-all duration-300
     
      hover:shadow-[0_30px_80px_rgba(56,189,248,0.25)]"
    >
      {/* glow nền */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      {/* AVATAR */}
      <div className="relative mx-auto w-36 overflow-hidden rounded-full sm:w-44">
        <img
          src={artist.cover_url}
          alt={artist.artist_name}
          className="h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44
          transition-transform duration-500
          group-hover:scale-[1.06]"
        />

        {/* overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full
          bg-gradient-to-t from-black/70 via-black/30 to-transparent
          opacity-0 transition duration-300
          group-hover:opacity-100"
        />

        {/* PLAY BUTTON */}
        <button
          onClick={handlePlayArtist}
          className="absolute inset-0 flex items-center justify-center
          opacity-0 transition duration-300
          group-hover:opacity-100"
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full
            bg-gradient-to-br from-cyan-400 to-violet-500
            text-xl text-[#0c0914]
            shadow-lg shadow-violet-400/40
            transition-transform duration-300
            group-hover:scale-110"
          >
            <FiPlay />
          </span>
        </button>
      </div>

      {/* INFO */}
      <div className="relative mt-4 space-y-1 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiUsers className="text-cyan-300" />
          Nghệ sĩ
        </div>

        <h3 className="truncate text-base font-semibold text-white drop-shadow-sm">
          {artist.artist_name}
        </h3>

        <div className="flex items-center justify-center gap-2 text-sm text-white/70">
          <FiMusic className="text-violet-300" />
          <span>{artist.song_count} bài hát</span>
        </div>
         <div className="flex justify-center pt-2">
          <FollowArtistButton artist={artist} size="sm" />
        </div>
      </div>
    </div>
  );
}
