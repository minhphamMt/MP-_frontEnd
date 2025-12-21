import { Link } from "react-router-dom";
import usePlayerStore from "../../store/player.store";

export default function SongRow({ song, queue }) {
  const playSong = usePlayerStore((s) => s.playSong);

  return (
    <div
      onClick={() => playSong(song, queue)}
      className="flex items-center gap-3 p-2 rounded
                 hover:bg-white/10 cursor-pointer"
    >
      {/* Cover */}
      <img
        src={song.cover_url}
        alt=""
        className="w-10 h-10 rounded object-cover"
      />

      {/* Info */}
      <div className="flex-1">
        <div className="text-sm font-medium">{song.title}</div>

        <div className="text-xs text-white/60 flex gap-1">
          <span>{song.artist_name}</span>

          {/* LINK ALBUM */}
          {song.album_id && song.album_title && (
            <>
              <span>•</span>
              <Link
                to={`/album/${song.album_id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline"
              >
                {song.album_title}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-white/50">
        {song.duration}s
      </div>
    </div>
  );
}
