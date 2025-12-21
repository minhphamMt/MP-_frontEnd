import { useNavigate } from "react-router-dom";
import usePlayerStore from "../../store/player.store";
import { getAlbumById } from "../../api/album.api";

export default function AlbumCard({ album }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

  const handlePlayAlbum = async (e) => {
    e.stopPropagation(); // ❗ không cho click lan sang navigate

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
      className="w-40 shrink-0 cursor-pointer group"
      onClick={() => navigate(`/album/${album.id}`)}
    >
      {/* COVER */}
      <div className="relative w-40 h-40 rounded-lg overflow-hidden mb-2">
        <img
          src={album.cover_url}
          alt={album.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />

        {/* ▶ PLAY BUTTON */}
        <button
          onClick={handlePlayAlbum}
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
        {album.title}
      </div>
      <div className="text-xs text-white/60 truncate">
        {album.artist_name || album.artist?.name || ""}
      </div>
    </div>
  );
}
