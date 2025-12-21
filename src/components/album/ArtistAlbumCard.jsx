import { useNavigate } from "react-router-dom";
import usePlayerStore from "../../store/player.store";
import api from "../../api/axios";

export default function ArtistAlbumCard({ artist }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const handlePlayArtist = async (e) => {
    e.stopPropagation(); // ❗ không cho navigate

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
      className="w-40 shrink-0 cursor-pointer group"
      onClick={() => navigate(`/artist/${artist.artist_id}`)}
    >
      {/* COVER */}
      <div className="relative w-40 h-40 rounded-full overflow-hidden mb-2">
        <img
          src={artist.cover_url}
          alt={artist.artist_name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />

        {/* ▶ PLAY BUTTON */}
        <button
          onClick={handlePlayArtist}
          className="absolute inset-0 flex items-center justify-center
                     bg-black/40 opacity-0 group-hover:opacity-100
                     transition"
        >
          <div className="w-12 h-12 rounded-full bg-green-500
                          flex items-center justify-center text-xl">
            ▶
          </div>
        </button>
      </div>

      {/* INFO */}
      <div className="text-sm font-semibold truncate">
        {artist.artist_name}
      </div>
      <div className="text-xs text-white/60">
        {artist.song_count} bài hát
      </div>
    </div>
  );
}
