import { useCallback, useEffect, useState } from "react";
import { FiClock, FiDisc, FiMusic, FiUser } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { getSongById } from "../api/song.api";
import usePlayerStore from "../store/player.store";
import {
  fetchPlayableSong,
  formatDuration,
  toPlayableSong,
} from "../utils/song";

export default function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  const { playSong, currentSong, isPlaying } = usePlayerStore();

  const loadSong = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSongById(id);
      const payload = res?.data?.data ?? res?.data ?? null;
      setSong(payload ? toPlayableSong(payload) : null);
    } catch (err) {
      console.error("Load song detail error", err);
      setSong(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSong();
  }, [loadSong]);

  const handlePlay = async () => {
    if (!song) return;

    const playable = song.audio_url
      ? song
      : await fetchPlayableSong(song, getSongById);

    if (playable?.audio_url) {
      setSong(playable);
      playSong(playable, [playable]);
    }
  };

  if (loading) {
    return (
       <div className="min-h-screen bg-[#121212] p-6 text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Đang tải thông tin bài hát...
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen bg-[#121212] p-6 text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Không tìm thấy bài hát.
        </div>
      </div>
    );
  }

  const isActive = currentSong?.id === song.id;

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        {/* GLOW */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* COVER */}
          <div className="w-full max-w-[260px]">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/40">
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-4xl text-white/70">
                  <FiMusic />
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Bài hát
              </p>
               <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {song.title}
              </h1>

              {song.artist_name && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
                  <FiUser className="text-cyan-200" />
                  <span>{song.artist_name}</span>
                </div>
              )}
            </div>

            {/* META */}
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              {song.album_title && (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <FiDisc className="text-emerald-200" />
                  {song.album_title}
                </span>
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <FiClock className="text-cyan-200" />
                {formatDuration(song.duration)}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handlePlay}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 px-6 py-2 text-sm font-semibold text-slate-900
                           shadow-lg shadow-cyan-500/30 transition
                           hover:brightness-110 hover:scale-[1.05] active:scale-[0.97]"
              >
                {isActive && isPlaying ? "⏸ Tạm dừng" : "▶ Phát ngay"}
              </button>

              <button
                className="rounded-full border border-white/15 bg-white/5 px-6 py-2 text-sm text-white/80 transition
                           hover:bg-white/10"
              >
                + Thêm vào thư viện
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <h2 className="text-lg font-semibold text-white">Thông tin phát</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 text-sm text-white/70 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Tiêu đề
            </div>
            <div className="mt-1 text-white">{song.title}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Nghệ sĩ
            </div>
            <div className="mt-1 text-white">
              {song.artist_name || "Không rõ"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Album
            </div>
            <div className="mt-1 text-white">
              {song.album_title || "Đang cập nhật"}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Thời lượng
            </div>
            <div className="mt-1 text-white">
              {formatDuration(song.duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
