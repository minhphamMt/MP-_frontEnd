import { FiDisc, FiMusic, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getAlbumById } from "../../api/album.api";
import usePlayerStore from "../../store/player.store";

export default function AlbumCard({ album }) {
  const navigate = useNavigate();
  const playSong = usePlayerStore((s) => s.playSong);

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
      onClick={() => navigate(`/album/${album.id}`)}
      className="group relative w-52 shrink-0 cursor-pointer overflow-hidden rounded-2xl 
      border border-white/10 
      bg-gradient-to-br from-white/5 via-white/0 to-white/5 
      p-3 
      shadow-[0_20px_60px_rgba(0,0,0,0.45)] 
      backdrop-blur 
      transition-all duration-300 
       hover:shadow-[0_30px_80px_rgba(56,189,248,0.25)]"
    >
      {/* glow nền */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

      {/* COVER */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <img
          src={album.cover_url}
          alt={album.title}
          className="h-44 w-full rounded-xl object-cover 
          transition-transform duration-500 
          group-hover:scale-[1.05]"
        />

        {/* overlay gradient */}
        <div
          className="pointer-events-none absolute inset-0 
          bg-gradient-to-t from-black/70 via-black/30 to-transparent 
          opacity-0 transition duration-300 
          group-hover:opacity-100"
        />

        {/* PLAY BUTTON */}
        <button
          onClick={handlePlayAlbum}
          className="absolute inset-0 flex items-center justify-center 
          opacity-0 transition duration-300 
          group-hover:opacity-100"
        >
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full 
            bg-gradient-to-br from-cyan-400 to-violet-500 
            text-xl text-[#0c0914] 
            shadow-lg shadow-cyan-400/40 
            transition-transform duration-300 
            group-hover:scale-110"
          >
            <FiPlay />
          </span>
        </button>
      </div>

      {/* INFO */}
      <div className="relative mt-3 space-y-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <FiDisc className="text-cyan-300" />
          Album
        </div>

        <h3 className="truncate text-base font-semibold text-white drop-shadow-sm">
          {album.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-white/70">
          <FiMusic className="text-violet-300 shrink-0" />
          <span className="truncate">
            {album.artist_name || album.artist?.name || ""}
          </span>
        </div>
      </div>
    </div>
  );
}
