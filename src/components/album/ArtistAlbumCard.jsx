import { FiMusic, FiPlay, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import usePlayerStore from "../../store/player.store";

export default function ArtistAlbumCard({ artist }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const handlePlayArtist = async (e) => {
    e.stopPropagation();

    try {
      const res = await api.get("/songs/art", {
        params: { artist_id: artist.artist_id },
      });

      const data = res?.data?.data || [];
      if (!data.length) return;

      const songs = data.map((s) => ({
        id: s.id,
        title: s.title,
        artist_name: s.artist_name || s.artist?.name || "",
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
      className="group relative w-48 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-[1.01] hover:border-white/15"
      onClick={() => navigate(`/artist/${artist.artist_id}`)}
    >
      <div className="relative w-full overflow-hidden rounded-full">
        <img
          src={artist.cover_url}
          alt={artist.artist_name}
          className="h-44 w-44 rounded-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        <button
          onClick={handlePlayArtist}
          className="absolute inset-0 flex items-center justify-center text-white opacity-0 transition duration-300 group-hover:opacity-100"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xl shadow-lg shadow-violet-400/40">
            <FiPlay />
          </span>
        </button>
      </div>

      <div className="mt-3 space-y-1 text-center">
        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/50">
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
      </div>
    </div>
  );
}