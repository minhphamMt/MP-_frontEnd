import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import usePlayerStore from "../store/player.store";

const formatTime = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function ArtistDetail() {
  const { id } = useParams();
  const [songs, setSongs] = useState([]);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const loadArtist = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/songs/art", {
        params: { artist_id: id },
      });

      const data = res.data?.data || [];

      if (data.length) {
        const primary = data[0];

        setArtist({
          name: primary.artist_name,
          cover: primary.cover_url,
          bio:
            primary.artist_description ||
            primary.artist_bio ||
            primary.bio ||
            "Nghệ sĩ chưa có phần giới thiệu.",
        });
      }

      setSongs(
        data.map((s) => ({
          ...s,
          audio_url: `${import.meta.env.VITE_API_BASE_URL}${s.audio_path}`,
        }))
      );
    } catch (err) {
      console.error("Load artist error", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadArtist();
  }, [loadArtist]);

  const totalDuration = useMemo(
    () => songs.reduce((acc, curr) => acc + (curr.duration || 0), 0),
    [songs]
  );

  if (loading)
    return <div className="p-6 text-white/60">Đang tải nghệ sĩ...</div>;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/70 via-slate-900/70 to-sky-900/60 p-6 shadow-2xl shadow-indigo-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.12),transparent_26%)]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="w-full max-w-[260px]">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2 shadow-xl shadow-black/30">
              <img
                src={artist?.cover}
                alt={artist?.name}
                className="w-full aspect-square rounded-xl object-cover"
              />
              <div className="absolute inset-0 rounded-xl border border-white/10" />
              <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-indigo-500/30 blur-3xl" />
              <div className="absolute -right-8 -bottom-10 h-24 w-24 rounded-full bg-sky-400/25 blur-3xl" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-2">Nghệ sĩ</p>
              <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
                {artist?.name}
              </h1>
              <p className="text-sm text-white/70 mt-1">{songs.length} bài hát nổi bật</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{songs.length} tracks</span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Tổng thời lượng: {formatTime(totalDuration)}
              </span>
            </div>

            {songs.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => playSong(songs[0], songs)}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-300 text-slate-900 font-semibold shadow-lg shadow-emerald-400/30 hover:from-green-300 hover:to-emerald-200"
                >
                  ▶ Phát tất cả
                </button>
                <button className="px-5 py-2 rounded-full border border-white/15 bg-white/5 text-white/85 hover:bg-white/10">
                  + Theo dõi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {artist?.bio && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-sky-900/50 to-indigo-900/60 p-6 shadow-xl shadow-black/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(56,189,248,0.12),transparent_35%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(129,140,248,0.14),transparent_32%)]" />

          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-white/70 uppercase tracking-[0.25em] text-[11px]">
              <span className="h-[1px] w-6 bg-white/25" />
              <span>Giới thiệu</span>
            </div>
            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-line">{artist.bio}</p>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-indigo-900/25 overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_160px_100px] items-center px-5 py-3 text-[11px] uppercase tracking-widest text-white/60 bg-white/5">
          <span className="text-center">#</span>
          <span>Bài hát</span>
          <span className="text-center">Album</span>
          <span className="text-right">Thời gian</span>
        </div>

        <div className="divide-y divide-white/5">
          {songs.map((song, index) => {
            const isActive = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className={`grid grid-cols-[60px_1fr_160px_100px] items-center gap-3 px-5 py-3 cursor-pointer transition duration-150 ${
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
                    <div className="text-xs text-white/60 truncate">{song.artist_name}</div>
                  </div>
                </div>

                <div className="text-center text-sm text-white/60 truncate">
                  {song.album_title || "Single"}
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