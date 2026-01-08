import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { getAlbumById } from "../api/album.api";
import useAlbumLikeStore, {
  normalizeAlbumId,
} from "../store/album-like.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";

const formatTime = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export default function AlbumDetail() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
   const {
    playSong,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((s) => s.toggleAlbumLike);

  /* =======================
     LOAD ALBUM (GIỮ NGUYÊN)
     ======================= */
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
  const albumId = normalizeAlbumId(album);
  const isLiked = albumId && likedAlbumIds.includes(albumId);

  /* =======================
     LOADING / EMPTY
     ======================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6 text-white/60">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Đang tải album...
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6 text-white/60">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          Album không tồn tại
        </div>
      </div>
    );
  }

  /* =======================
     UI
     ======================= */
      const artistMeta = album?.artist || {};
  const artistDisplayName =
    album?.artist_name || artistMeta?.name || artistMeta?.alias;
  const artistInfoItems = [
    { label: "Nghệ danh", value: artistMeta?.alias },
    { label: "Tên thật", value: artistMeta?.realname },
    { label: "Ngày sinh", value: artistMeta?.birthday },
    { label: "Quốc gia", value: artistMeta?.national },
  ].filter((item) => item.value);

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      {/* ===== HERO ===== */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        {/* GLOW */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* COVER */}
          <div className="w-full max-w-[260px]">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/40">
              <img
                src={album.cover_url}
                alt={album.title}
                className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-white/50">
                Album
              </p>
              <h1 className="text-3xl font-extrabold leading-tight text-white">
                {album.title}
              </h1>
               {artistDisplayName && (
                <p className="mt-1 text-sm text-white/70">
                  {artistDisplayName}
                </p>
              )}
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
                  className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900
                             shadow-lg shadow-green-400/30 transition
                             hover:brightness-110 hover:scale-[1.05] active:scale-[0.97]"
                >
                  ▶ Phát tất cả
                </button>

                  <button
                  onClick={() => toggleAlbumLike(albumId)}
                  className={`rounded-full border px-6 py-2 text-sm transition ${
                    isLiked
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                      : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {isLiked ? "✓ Đã thích" : "+ Thích album"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
 {(artistDisplayName || artistInfoItems.length > 0) && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.18),transparent_45%)]" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
              <span className="h-[1px] w-6 bg-white/30" />
              <span>Nghệ sĩ</span>
            </div>
            {artistDisplayName && (
              <p className="text-lg font-semibold text-white">
                {artistDisplayName}
              </p>
            )}
            {artistInfoItems.length > 0 && (
              <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
                {artistInfoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="text-white/60">{item.label}</span>
                    <span className="font-medium text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ===== SONG LIST ===== */}
       <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] scrollbar-muted">
        <div className="min-w-[640px]">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[60px_1fr_140px_100px] items-center bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest text-white/60 sm:px-5">
            <span className="text-center">#</span>
            <span>Bài hát</span>
            <span className="text-center">Hành động</span>
            <span className="text-right">Thời gian</span>
          </div>

          {/* ROWS */}
          <div className="divide-y divide-white/5">
            {songs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isActive = currentSong?.id === song.id;
              const isLiked = songId && likedSongIds.includes(songId);
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song, songs)}
                  className={`grid grid-cols-[60px_1fr_140px_100px] items-center gap-3 px-4 py-3 cursor-pointer transition sm:px-5 ${
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
                  {/* ACTIONS */}
                  <div className="flex items-center justify-center gap-2">
                    <AddToPlaylistButton
                      song={song}
                      triggerClassName="h-9 w-9 !border-white/20 !bg-white/10 hover:!bg-white/20"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (songId) toggleLike(songId);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition ${
                        isLiked
                          ? "border-rose-400/40 text-rose-300"
                          : "border-white/10 text-white/70 hover:bg-white/15"
                      }`}
                      aria-label={isLiked ? "Bỏ thích bài hát" : "Thích bài hát"}
                    >
                      <FiHeart />
                    </button>
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
    </div>
  );
}
