import { useCallback, useEffect, useMemo, useState } from "react";
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

  const loadAlbum = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const totalDuration = useMemo(
    () => songs.reduce((acc, curr) => acc + (curr.duration || 0), 0),
    [songs]
  );

  if (loading)
    return <div className="p-6 text-white/60">Đang tải album...</div>;

  if (!album)
    return <div className="p-6 text-white/60">Album không tồn tại</div>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-purple-900/70 p-6 shadow-2xl shadow-purple-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="w-full max-w-[260px]">
            <div className="relative rounded-2xl bg-white/5 p-2 shadow-xl shadow-black/30">
              <img
                src={album.cover_url}
                alt={album.title}
                className="w-full aspect-square rounded-xl object-cover"
              />
              <div className="absolute inset-0 rounded-xl border border-white/10" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Album</p>
              <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
                {album.title}
              </h1>
              <p className="text-sm text-white/70 mt-1">
                {album.artist_name}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                {songs.length} bài hát
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Tổng thời lượng: {formatTime(totalDuration)}
              </span>
            </div>

            {songs.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => playSong(songs[0], songs)}
                  className="px-5 py-2 rounded-full bg-green-400 text-slate-900 font-semibold shadow-lg shadow-green-400/30 hover:bg-green-300"
                >
                  ▶ Phát tất cả
                </button>
                <button className="px-5 py-2 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10">
                  + Thêm vào thư viện
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-purple-900/20 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_100px] items-center px-5 py-3 text-[11px] uppercase tracking-widest text-white/60 bg-white/5">
          <span className="text-center">#</span>
          <span>Bài hát</span>
          <span className="text-right">Thời gian</span>
        </div>

        <div className="divide-y divide-white/5">
          {songs.map((song, index) => {
            const isActive = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className={`grid grid-cols-[60px_1fr_100px] items-center gap-3 px-5 py-3 cursor-pointer transition duration-150 ${
                  isActive
                    ? "bg-gradient-to-r from-white/10 via-white/5 to-transparent"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="text-center text-sm font-semibold text-white/70">
                  {index + 1}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={song.cover_url}
                      className="w-12 h-12 rounded-lg object-cover shadow-md shadow-black/30"
                    />

                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 backdrop-blur-sm">
                        <span className="text-sm">{isPlaying ? "⏸" : "▶"}</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`font-semibold truncate ${
                        isActive ? "text-green-300" : "text-white"
                      }`}
                    >
                      {song.title}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {song.artist_name}
                    </div>
                  </div>
                </div>

                <div className="text-right text-sm text-white/60">
                  {formatTime(song.duration)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}