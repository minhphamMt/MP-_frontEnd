import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlbumById } from "../api/album.api";
import usePlayerStore from "../store/player.store";

const formatTime = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { playSong, currentSong, isPlaying } = usePlayerStore();

  useEffect(() => {
    loadAlbum();
  }, [id]);

  async function loadAlbum() {
    try {
      setLoading(true);

      const res = await getAlbumById(id);
      const data = res?.data?.data;
      if (!data) {
        setAlbum(null);
        return;
      }

      setAlbum(data);

      setSongs(
        (data.songs || []).map((s) => ({
          id: s.id,
          title: s.title,
          artist_name: s.artist_name || s.artist?.name || "",
          duration: s.duration,
          cover_url: s.cover_url,
          audio_url: `${import.meta.env.VITE_API_BASE_URL}${s.audio_path}`,
        }))
      );
    } catch (err) {
      console.error("Load album detail error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <div className="p-6 text-white/60">Đang tải album...</div>;

  if (!album)
    return <div className="p-6 text-white/60">Album không tồn tại</div>;

  return (
    <div className="flex gap-8">
      {/* LEFT */}
      <div className="w-72 shrink-0">
        <img
          src={album.cover_url}
          alt={album.title}
          className="w-full aspect-square rounded-lg object-cover mb-4"
        />

        <h1 className="text-2xl font-bold mb-1">{album.title}</h1>
        <p className="text-sm text-white/60 mb-4">
          {album.artist_name} · {songs.length} bài hát
        </p>

        {songs.length > 0 && (
          <button
            onClick={() => playSong(songs[0], songs)}
            className="px-6 py-2 rounded-full bg-green-500 font-semibold"
          >
            ▶ PHÁT TẤT CẢ
          </button>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex-1">
        <div className="grid grid-cols-[40px_1fr_80px] text-xs text-white/50 border-b border-white/10 pb-2 mb-2">
          <div>#</div>
          <div>BÀI HÁT</div>
          <div className="text-right">THỜI GIAN</div>
        </div>

        {songs.map((song, index) => {
          const isActive = currentSong?.id === song.id;

          return (
            <div
              key={song.id}
              onClick={() => playSong(song, songs)}
              className={`grid grid-cols-[40px_1fr_80px] items-center py-2 text-sm cursor-pointer transition
                ${isActive ? "bg-white/10" : "hover:bg-white/5"}
              `}
            >
              <div>{index + 1}</div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={song.cover_url}
                    className="w-10 h-10 rounded object-cover"
                  />

                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
                      <span className="text-sm">
                        {isPlaying ? "⏸" : "▶"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className={`font-medium ${
                      isActive ? "text-green-400" : ""
                    }`}
                  >
                    {song.title}
                  </div>
                  <div className="text-xs text-white/60">
                    {song.artist_name}
                  </div>
                </div>
              </div>

              <div className="text-right text-white/60">
                {formatTime(song.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
