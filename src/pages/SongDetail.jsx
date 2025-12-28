import { useCallback, useEffect, useState } from "react";
import { FiClock, FiDisc, FiMusic, FiUser } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { getSongById } from "../api/song.api";
import usePlayerStore from "../store/player.store";
import { fetchPlayableSong, formatDuration, toPlayableSong } from "../utils/song";

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
    return <div className="p-6 text-white/70">Đang tải thông tin bài hát...</div>;
  }

  if (!song) {
    return <div className="p-6 text-white/70">Không tìm thấy bài hát.</div>;
  }

  const isActive = currentSong?.id === song.id;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f1f3f] via-[#0c1832] to-[#101b38] p-6 shadow-2xl shadow-black/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="w-full max-w-[260px]">
            <div className="relative rounded-2xl bg-[#0b1b38] p-3 shadow-xl shadow-black/40">
              {song.cover_url ? (
                <img
                  src={song.cover_url}
                  alt={song.title}
                  className="w-full aspect-square rounded-xl object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 text-4xl text-white/70">
                  <FiMusic />
                </div>
              )}
              <div className="absolute inset-0 rounded-xl border border-white/10" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Bài hát</p>
              <h1 className="text-3xl font-extrabold leading-tight text-white drop-shadow-lg">{song.title}</h1>
              {song.artist_name && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-sm text-white/80">
                  <FiUser className="text-cyan-200" />
                  <span>{song.artist_name}</span>
                </div>
              )}
            </div>

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

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handlePlay}
                className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:brightness-110"
              >
                {isActive && isPlaying ? "⏸ Tạm dừng" : "▶ Phát ngay"}
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 transition hover:bg-white/10">
                + Thêm vào thư viện
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0f1f3f] p-5 shadow-xl shadow-black/30">
        <h2 className="text-lg font-semibold text-white">Thông tin phát</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-white/70 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0b1b38] p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Tiêu đề</div>
            <div className="mt-1 text-white">{song.title}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b1b38] p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Nghệ sĩ</div>
            <div className="mt-1 text-white">{song.artist_name || "Không rõ"}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b1b38] p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Album</div>
            <div className="mt-1 text-white">{song.album_title || "Đang cập nhật"}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0b1b38] p-3">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">Thời lượng</div>
            <div className="mt-1 text-white">{formatDuration(song.duration)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}