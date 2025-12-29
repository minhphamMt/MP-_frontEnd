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

  /* =======================
     LOAD ARTIST (GIỮ NGUYÊN)
     ======================= */
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

  /* =======================
     LOADING
     ======================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6 text-white/60">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Đang tải nghệ sĩ...
        </div>
      </div>
    );
  }

  /* =======================
     UI
     ======================= */
  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        {/* GLOW */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* AVATAR */}
          <div className="w-full max-w-[260px]">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/40">
              <img
                src={artist?.cover}
                alt={artist?.name}
                className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-white/50">
                Nghệ sĩ
              </p>
              <h1 className="text-3xl font-extrabold leading-tight text-white">
                {artist?.name}
              </h1>
              <p className="mt-1 text-sm text-white/70">
                {songs.length} bài hát nổi bật
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                {songs.length} tracks
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Tổng thời lượng: {formatTime(totalDuration)}
              </span>
            </div>

            {songs.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => playSong(songs[0], songs)}
                  className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900
                             shadow-lg shadow-emerald-400/30 transition
                             hover:brightness-110 hover:scale-[1.05] active:scale-[0.97]"
                >
                  ▶ Phát tất cả
                </button>

                <button className="rounded-full border border-white/15 bg-white/5 px-6 py-2 text-sm text-white/80 transition hover:bg-white/10">
                  + Theo dõi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== BIO ===== */}
      {artist?.bio && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.15),transparent_40%)]" />

          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
              <span className="h-[1px] w-6 bg-white/30" />
              <span>Giới thiệu</span>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
              {artist.bio}
            </p>
          </div>
        </div>
      )}

      {/* ===== SONG LIST ===== */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        {/* TABLE HEADER */}
        <div className="grid grid-cols-[60px_1fr_160px_100px] items-center bg-white/5 px-5 py-3 text-[11px] uppercase tracking-widest text-white/60">
          <span className="text-center">#</span>
          <span>Bài hát</span>
          <span className="text-center">Album</span>
          <span className="text-right">Thời gian</span>
        </div>

        {/* ROWS */}
        <div className="divide-y divide-white/5">
          {songs.map((song, index) => {
            const isActive = currentSong?.id === song.id;

            return (
              <div
                key={song.id}
                onClick={() => playSong(song, songs)}
                className={`grid grid-cols-[60px_1fr_160px_100px] items-center gap-3 px-5 py-3 cursor-pointer transition
                  ${
                    isActive
                      ? "bg-gradient-to-r from-white/10 via-white/5 to-transparent"
                      : "hover:bg-white/5"
                  }`}
              >
                {/* INDEX */}
                <div className="text-center text-sm font-semibold text-white/70">
                  {index + 1}
                </div>

                {/* SONG */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg shadow-md shadow-black/30">
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      className="h-full w-full object-cover"
                    />

                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <span className="text-sm">
                          {isPlaying ? "⏸" : "▶"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`truncate font-semibold ${
                        isActive ? "text-green-300" : "text-white"
                      }`}
                    >
                      {song.title}
                    </div>
                    <div className="truncate text-xs text-white/60">
                      {song.artist_name}
                    </div>
                  </div>
                </div>

                {/* ALBUM */}
                <div className="truncate text-center text-sm text-white/60">
                  {song.album_title || "Single"}
                </div>

                {/* DURATION */}
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
