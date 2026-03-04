import { useCallback, useEffect, useState } from "react";
import { FiClock, FiDisc, FiHeart, FiMusic, FiPlus, FiUser } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { getSongById } from "../api/song.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import {
  fetchPlayableSong,
  formatDuration,
  toPlayableSong,
} from "../utils/song";
import { resolveAssetUrl } from "../utils/asset";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import OptimizedImage from "../components/common/OptimizedImage";

export default function SongDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

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

    if (normalizeSongId(currentSong) === normalizeSongId(song)) {
      togglePlay();
      return;
    }

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
       <div className="user-page-shell min-h-screen p-6 text-white/70">
        <div className="user-surface p-6">
          Đang tải thông tin bài hát...
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="user-page-shell min-h-screen p-6 text-white/70">
        <div className="user-surface p-6">
          Không tìm thấy bài hát.
        </div>
      </div>
    );
  }

  const songId = normalizeSongId(song);
  const isActive = normalizeSongId(currentSong) === songId;
  const isLiked = songId && likedSongIds.includes(songId);
  const artistId = song.artist_id;
  const albumId = song.album_id;

  const goToArtist = () => {
    if (artistId) navigate(`/artist/${artistId}`);
  };

  const goToAlbum = () => {
    if (albumId) navigate(`/album/${albumId}`);
  };

  return (
    <div className="user-page-shell min-h-screen space-y-8 px-4 py-6 sm:px-8">
      {/* HERO */}
      <div className="user-surface relative overflow-hidden p-6 shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
        {/* GLOW */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* COVER */}
          <div className="w-full max-w-[260px]">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/40">
              {song.cover_url ? (
                <OptimizedImage
                  src={resolveAssetUrl(song.cover_url)}
                  alt={song.title}
                  className="aspect-square w-full object-cover transition duration-500 md:hover:scale-105"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-white/10 text-4xl text-white/70">
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
                <button
                  type="button"
                  onClick={goToArtist}
                  disabled={!artistId}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 transition md:hover:bg-white/20 disabled:cursor-default disabled:opacity-70"
                >
                  <FiUser className="text-emerald-300" />
                  <span>{song.artist_name}</span>
                </button>
              )}
            </div>

            {/* META */}
            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              {song.album_title && (
                <button
                  type="button"
                  onClick={goToAlbum}
                  disabled={!albumId}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 transition md:hover:bg-white/10 disabled:cursor-default disabled:opacity-70"
                >
                  <FiDisc className="text-emerald-200" />
                  {song.album_title}
                </button>
              )}

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <FiClock className="text-emerald-300" />
                {formatDuration(song.duration)}
              </span>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handlePlay}
                className="rounded-full border border-emerald-300/50 bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900
                           shadow-lg shadow-emerald-500/30 transition
                           md:hover:brightness-110 md:hover:scale-[1.05] active:scale-[0.97]"
              >
                {isActive && isPlaying ? "⏸ Tạm dừng" : "▶ Phát ngay"}
              </button>

              <AddToPlaylistButton
                song={song}
                variant="text"
                triggerLabel={
                  <span className="flex items-center gap-2 font-semibold">
                    <FiPlus />
                    <span>Thêm vào thư viện</span>
                  </span>
                }
                triggerClassName="rounded-full border border-white/15 bg-white/5 px-6 py-2 text-sm text-white/80 transition md:hover:bg-white/10"
              />
              <button
                type="button"
                onClick={() => {
                  if (songId) toggleLike(songId);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-6 py-2 text-sm font-semibold transition ${
                  isLiked
                    ? "border-rose-400/60 bg-rose-500/20 text-rose-100"
                    : "border-white/15 bg-white/5 text-white/80 md:hover:bg-white/10"
                }`}
              >
                <FiHeart className={isLiked ? "text-rose-300" : ""} />
                {isLiked ? "Đã thích" : "Yêu thích"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="user-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
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
              {song.artist_name ? (
                <button
                  type="button"
                  onClick={goToArtist}
                  disabled={!artistId}
                  className="transition md:hover:text-emerald-300 disabled:cursor-default disabled:hover:text-white"
                >
                  {song.artist_name}
                </button>
              ) : (
                "Không rõ"
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-white/50">
              Album
            </div>
            <div className="mt-1 text-white">
              {song.album_title ? (
                <button
                  type="button"
                  onClick={goToAlbum}
                  disabled={!albumId}
                  className="transition md:hover:text-emerald-300 disabled:cursor-default disabled:hover:text-white"
                >
                  {song.album_title}
                </button>
              ) : (
                "Đang cập nhật"
              )}
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
