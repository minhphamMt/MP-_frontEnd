import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import api from "../api/axios";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import FollowArtistButton from "../components/artist/FollowArtistButton";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";

const formatTime = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function ArtistDetail() {
  const { id } = useParams();
  const [songs, setSongs] = useState([]);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

 const {
    playSong,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();
const renderBioHtml = (bio = "") => {
  if (!bio) return { __html: "" };

  let normalized = bio;
  normalized = normalized.replace(/\r\n/g, "\n");
  normalized = normalized.replace(/\n{2,}/g, "\n");
  normalized = normalized.replace(/<br\s*\/?>/gi, "<br />");
  normalized = normalized.replace(/(<br \/>){2,}/gi, "<br />");
  normalized = normalized.replace(/(\n\s*)*(<br \/>)(\s*\n)*/gi, "<br />");
  normalized = normalized.trim();

  return {
    __html: normalized,
  };
};

  /* =======================
     LOAD ARTIST (GIỮ NGUYÊN)
     ======================= */
  const loadArtist = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/songs/art", {
        params: { artist_id: id },
      });

      const payload = res.data?.data || {};
      const artistData = payload.artist || null;
      const songList = payload.songs || [];
        if (artistData) {
        setArtist({
          id: artistData.id,
          name: artistData.name || artistData.alias || "Nghệ sĩ",
          alias: artistData.alias,
          realname: artistData.realname,
          birthday: artistData.birthday,
          national: artistData.national,
          cover: artistData.cover_url || artistData.avatar_url,
          avatar: artistData.avatar_url,
          bio: artistData.bio,
          shortBio: artistData.short_bio,
        });
        } else {
        setArtist(null);
      }

      setSongs(
        songList.map((s) => ({
          ...s,
          artist_name: artistData?.name || artistData?.alias || "",
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
 const coverUrl = artist?.cover || artist?.avatar;
  const artistInfoItems = [
    { label: "Nghệ danh", value: artist?.alias },
    { label: "Tên thật", value: artist?.realname },
    { label: "Ngày sinh", value: artist?.birthday },
    { label: "Quốc gia", value: artist?.national },
  ].filter((item) => item.value);

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
               {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={artist?.name}
                  className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-white/10 text-sm text-white/70">
                  Chưa có ảnh
                </div>
              )}
              <div className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>
          </div>

          {/* INFO */}
          <div className="flex-1 space-y-5">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.35em] text-white/50">
                Nghệ sĩ
              </p>
              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {artist?.name}
              </h1>
                {artist?.alias && artist.alias !== artist.name && (
                <p className="mt-1 text-sm text-white/70">{artist.alias}</p>
              )}
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

            <div className="flex flex-wrap gap-3 pt-2">
              {songs.length > 0 && (
                <button
                  onClick={() => playSong(songs[0], songs)}
                  className="rounded-full bg-gradient-to-r from-green-400 to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900
                             shadow-lg shadow-emerald-400/30 transition
                             hover:brightness-110 hover:scale-[1.05] active:scale-[0.97]"
                >
                  ▶ Phát tất cả
                </button>
)}
                <FollowArtistButton artist={artist} size="lg" />
            </div>
          </div>
        </div>
      </div>
   {(artistInfoItems.length > 0 || artist?.shortBio) && (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {artist?.shortBio && (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.18),transparent_45%)]" />
              <div className="relative space-y-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
                  <span className="h-[1px] w-6 bg-white/30" />
                  <span>Tóm tắt</span>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  {artist.shortBio}
                </p>
              </div>
            </div>
          )}

          {artistInfoItems.length > 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.16),transparent_45%)]" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
                  <span className="h-[1px] w-6 bg-white/30" />
                  <span>Thông tin</span>
                </div>
                <div className="space-y-3 text-sm text-white/80">
                  {artistInfoItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 last:border-none last:pb-0"
                    >
                      <span className="text-white/60">{item.label}</span>
                      <span className="font-medium text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== BIO ===== */}
      {artist?.bio && (
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.15),transparent_40%)]" />

          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
              <span className="h-[1px] w-6 bg-white/30" />
              <span>Giới thiệu</span>
            </div>
             <p
              className="whitespace-pre-line text-sm leading-relaxed text-white/80"
              dangerouslySetInnerHTML={renderBioHtml(artist.bio)}
            />
          </div>
        </div>
      )}

      {/* ===== SONG LIST ===== */}
         <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] scrollbar-muted">
        <div className="min-w-[720px]">
          {/* TABLE HEADER */}
          <div className="grid grid-cols-[60px_1fr_160px_140px_100px] items-center bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest text-white/60 sm:px-5">
            <span className="text-center">#</span>
            <span>Bài hát</span>
            <span className="text-center">Album</span>
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
                 className={`grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 cursor-pointer transition sm:grid-cols-[60px_1fr_160px_140px_100px] sm:gap-3 sm:px-5 ${
                    isActive
                      ? "bg-gradient-to-r from-white/10 via-white/5 to-transparent"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* INDEX */}
                 <div className="hidden text-center text-sm font-semibold text-white/70 sm:block">
                    {index + 1}
                  </div>

                  {/* SONG */}
                  <div className="flex min-w-0 items-center gap-3">
                     <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-md shadow-black/30 sm:h-12 sm:w-12">
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
                         className={`truncate text-sm font-semibold sm:text-base ${
                          isActive ? "text-green-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </div>
                      <div className="hidden truncate text-xs text-white/60 sm:block">
                        {song.artist_name}
                      </div>
                    </div>
                  </div>

                  {/* ALBUM */}
                  <div className="hidden truncate text-center text-sm text-white/60 sm:block">
                    {song.album_title || "Single"}
                  </div>
                  {/* ACTIONS */}
                   <div className="flex items-center justify-end gap-2 sm:justify-center">
                    <AddToPlaylistButton
                      song={song}
                       triggerClassName="h-8 w-8 !border-white/20 !bg-white/10 hover:!bg-white/20 sm:h-9 sm:w-9"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (songId) toggleLike(songId);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition sm:h-9 sm:w-9 ${
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
                  <div className="hidden text-right text-sm text-white/60 sm:block">
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
