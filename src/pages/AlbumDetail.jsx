import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiCalendar, FiHeart, FiMusic, FiPause, FiPlay } from "react-icons/fi";
import { getAlbumById } from "../api/album.api";
import {
  useEnsureLikedAlbumsLoaded,
  useEnsureLikedSongsLoaded,
} from "../hooks/useEnsureLibraryState";
import useAlbumLikeStore, {
  normalizeAlbumId,
} from "../store/album-like.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import { resolveAssetUrl } from "../utils/asset";
import useAuthStore from "../store/auth.store";
import { formatDateDisplay } from "../utils/date";
import OptimizedImage from "../components/common/OptimizedImage";
import { getArtistLabel, getPrimaryArtistId, normalizeArtists } from "../utils/artist";
import ArtistNames from "../components/artist/ArtistNames";
import { toPlayableSong } from "../utils/song";

const formatTime = (s = 0) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
export default function AlbumDetail() {
  useEnsureLikedSongsLoaded();
  useEnsureLikedAlbumsLoaded();
  const { id } = useParams();
  const navigate = useNavigate();
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
  const role = useAuthStore((state) => state.role);
  const isArtistRole = role === "ARTIST";
  const canPlay = role !== "ARTIST" && role !== "ADMIN";
  const likedAlbumIds = useAlbumLikeStore((s) => s.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((s) => s.toggleAlbumLike);

  /* =======================
     LOAD ALBUM (GIá»® NGUYÃŠN)
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
        (data.songs || []).map((s) => {
          const fallbackArtists = normalizeArtists({
            artist_id: s.artist_id || s.artist?.id || data.artist_id || data.artist?.id,
            artist_name:
              s.artist_name ||
              s.artist?.name ||
              data.artist_name ||
              data.artist?.name ||
              "",
          });

          const artists = normalizeArtists({ ...s, artists: s.artists || fallbackArtists });

          return toPlayableSong({
            ...s,
            artist_name: getArtistLabel({ ...s, artists }, ""),
            artist_id: getPrimaryArtistId({ ...s, artists }),
            artists,
            album_id: s.album_id ?? data.id,
            album_title: s.album_title ?? data.title,
          });
        })
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
       <div className="user-page-shell min-h-screen p-6 text-white/60">
        <div className="user-surface p-6">
          Äang táº£i album...
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="user-page-shell min-h-screen p-6 text-white/60">
        <div className="user-surface p-6">
          Album khÃ´ng tá»“n táº¡i
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
  const artistId = album?.artist_id || artistMeta?.id;
  const artistInfoItems = [
    { label: "Nghá»‡ danh", value: artistMeta?.alias },
    { label: "TÃªn tháº­t", value: artistMeta?.realname },
    {
      label: "NgÃ y sinh",
      value: artistMeta?.birthday
        ? formatDateDisplay(artistMeta?.birthday)
        : null,
    },
    { label: "Quá»‘c gia", value: artistMeta?.national },
  ].filter((item) => item.value);

  return (
     <div className="user-page-shell min-h-screen space-y-8 px-4 py-6 sm:px-8">
      {/* ===== HERO ===== */}
      <div className="user-surface relative overflow-hidden p-6 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        {/* GLOW */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
          {/* COVER */}
           <div className="mx-auto w-full max-w-[260px] lg:mx-0">
            <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/40">
              <OptimizedImage
                src={resolveAssetUrl(album.cover_url)}
                alt={album.title}
                className="aspect-square h-full w-full object-cover object-center transition duration-500 md:hover:scale-105"
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
              <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                {album.title}
              </h1>
               {artistDisplayName && (
                <button
                  type="button"
                  onClick={() => artistId && navigate(`/artist/${artistId}`)}
                  disabled={!artistId}
                  className="mt-1 text-sm text-white/70 transition md:hover:text-emerald-300 disabled:cursor-default disabled:hover:text-white/70"
                >
                  {artistDisplayName}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/70">
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                {songs.length} bÃ i hÃ¡t
              </span>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Tá»•ng thá»i lÆ°á»£ng: {formatTime(totalDuration)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                <FiCalendar className="text-emerald-300" />
                {formatDateDisplay(album.release_date)}
              </span>
            </div>

            {songs.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
               {canPlay ? (
                  <button
                    onClick={() => playSong(songs[0], songs)}
                    className="rounded-full border border-emerald-300/50 bg-emerald-400 px-6 py-2 text-sm font-semibold text-slate-900
                             shadow-lg shadow-green-400/30 transition
                             md:hover:brightness-110 md:hover:scale-[1.05] active:scale-[0.97]"
                >
                    â–¶ PhÃ¡t táº¥t cáº£
                  </button>
                ) : (
                  <div className="rounded-full border border-white/15 bg-white/5 px-6 py-2 text-sm text-white/60">
                    Chá»‰ xem thÃ´ng tin
                  </div>
                )}

                  <button
                  onClick={() => {
                    if (!isArtistRole) {
                      toggleAlbumLike(albumId);
                    }
                  }}
                  disabled={isArtistRole}
                  className={`rounded-full border px-6 py-2 text-sm transition ${
                    isLiked
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-200 md:hover:bg-rose-500/20"
                      : "border-white/15 bg-white/5 text-white/80 md:hover:bg-white/10"
                  } ${isArtistRole ? "cursor-not-allowed opacity-60" : ""}`}
                >
                  {isLiked ? "âœ“ ÄÃ£ thÃ­ch" : "+ ThÃ­ch album"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
 {(artistDisplayName || artistInfoItems.length > 0) && (
        <div className="user-surface relative overflow-hidden p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
              <span className="h-[1px] w-6 bg-white/30" />
              <span>Nghá»‡ sÄ©</span>
            </div>
            {artistDisplayName && (
              <button
                type="button"
                onClick={() => artistId && navigate(`/artist/${artistId}`)}
                disabled={!artistId}
                className="text-lg font-semibold text-white transition md:hover:text-emerald-300 disabled:cursor-default disabled:hover:text-white"
              >
                {artistDisplayName}
              </button>
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
         <div className="user-surface overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)] scrollbar-muted xl:overflow-x-auto">
       <div className="min-w-0 xl:min-w-[640px]">
          <div className="px-4 pt-4 text-sm font-semibold text-white xl:hidden">
            Danh sÃ¡ch bÃ i hÃ¡t
          </div>
          {/* TABLE HEADER */}
          <div className="hidden grid-cols-[60px_1fr_140px_100px] items-center bg-white/5 px-4 py-3 text-[11px] uppercase tracking-widest text-white/60 xl:grid xl:px-5">
            <span className="text-center">#</span>
            <span>BÃ i hÃ¡t</span>
            <span className="text-center">HÃ nh Ä‘á»™ng</span>
            <span className="text-right">Thá»i gian</span>
          </div>

          {/* ROWS */}
          <div className="divide-y divide-white/5">
            {songs.map((song, index) => {
              const songId = normalizeSongId(song);
              const isActive = normalizeSongId(currentSong) === songId;
              const isLiked = songId && likedSongIds.includes(songId);
              return (
                <div
                  key={song.id}
                  onClick={canPlay ? () => playSong(song, songs) : undefined}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-2 px-4 py-3 transition xl:grid-cols-[60px_1fr_140px_100px] xl:gap-3 xl:px-5 ${
                    isActive
                      ? "bg-emerald-400/10"
                      : canPlay
                        ? "md:hover:bg-white/5 cursor-pointer"
                        : "cursor-default"
                  }`}
                >
                  {/* INDEX */}
                  <div className="hidden text-center text-sm font-semibold xl:block">
                    {isActive ? (
                      <FiMusic className="mx-auto text-emerald-400" />
                    ) : (
                      <span className="text-white/70">{index + 1}</span>
                    )}
                  </div>

                  {/* SONG */}
                  <div className="flex min-w-0 items-center gap-3">
                     <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-md shadow-black/30 sm:h-12 sm:w-12">
                      <OptimizedImage
                        src={resolveAssetUrl(song.cover_url)}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />

                      <div
                        className={`absolute inset-0 flex items-center justify-center bg-black/50 transition ${
                          isActive ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1db954] text-black shadow-[0_8px_16px_rgba(29,185,84,0.35)]">
                          {isActive && isPlaying ? (
                            <FiPause className="text-sm" />
                          ) : (
                            <FiPlay className="ml-0.5 text-sm" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div
                         className={`truncate text-sm font-semibold sm:text-base ${
                          isActive ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {song.title}
                      </div>
                        <div className="hidden truncate text-xs text-white/60 xl:block">
                          <ArtistNames
                            item={song}
                            stopPropagation
                            fallback={artistDisplayName || "Nghá»‡ sÄ©"}
                            linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                          />
                        </div>
                    </div>
                  </div>
                  {/* ACTIONS */}
                  <div className="flex items-center justify-end gap-2 lg:justify-center">
                    <AddToPlaylistButton
                      song={song}
                     disabled={isArtistRole}
                     triggerClassName="h-8 w-8 !border-white/20 !bg-white/10 md:hover:!bg-white/20 sm:h-9 sm:w-9"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isArtistRole && songId) toggleLike(songId);
                      }}
                      disabled={isArtistRole}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition sm:h-9 sm:w-9 ${
                        isLiked
                          ? "border-rose-400/40 text-rose-300"
                          : "border-white/10 text-white/70 md:hover:bg-white/15"
                      } ${isArtistRole ? "cursor-not-allowed opacity-60" : ""}`}
                      aria-label={isLiked ? "Bá» thÃ­ch bÃ i hÃ¡t" : "ThÃ­ch bÃ i hÃ¡t"}
                    >
                      <FiHeart />
                    </button>
                  </div>

                  {/* DURATION */}
                 <div className="hidden text-right text-sm text-white/60 xl:block">
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
