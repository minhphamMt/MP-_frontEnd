import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiDisc,
  FiHeart,
  FiPause,
  FiPlay,
  FiUser,
} from "react-icons/fi";
import ArtistNames from "../components/artist/ArtistNames";
import OptimizedImage from "../components/common/OptimizedImage";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import { SongDetailIconButton, SongDetailLink } from "../components/song/SongDetailLink";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePageMetadata from "../hooks/usePageMetadata";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import { formatDuration } from "../utils/song";
import {
  fetchArtistDetailData,
  formatTotalDuration,
  stripHtml,
} from "./artistDetail.shared";

export default function ArtistAllSongs() {
  useEnsureLikedSongsLoaded();

  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { playSong, currentSong, isPlaying, likedSongIds, toggleLike } = usePlayerStore();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const nextData = await fetchArtistDetailData(id);
      setArtist(nextData.artist);
      setSongs(nextData.songs);

      if (!nextData.artist && !nextData.songs.length) {
        setErrorMessage("Không tìm thấy danh sách bài hát của nghệ sĩ.");
      }
    } catch (error) {
      console.error("Load artist songs failed", error);
      setArtist(null);
      setSongs([]);
      setErrorMessage("Không thể tải danh sách bài hát của nghệ sĩ.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalDuration = useMemo(
    () => songs.reduce((sum, song) => sum + Number(song?.duration || 0), 0),
    [songs]
  );
  const artistSummary = useMemo(() => {
    const source = artist?.shortBio || stripHtml(artist?.bio || "");
    if (!source) return "";
    return source.length > 180 ? `${source.slice(0, 180).trim()}...` : source;
  }, [artist?.bio, artist?.shortBio]);
  const portraitUrl = resolveAssetUrl(artist?.avatar || artist?.cover);
  const backdropUrl = resolveAssetUrl(artist?.cover || artist?.avatar);
  const activeSongId = normalizeSongId(currentSong);
  const artistPath = artist?.id ? `/artist/${artist.id}` : `/artist/${id}`;
  const albumsPath = artist?.id ? `/artist/${artist.id}/albums` : `/artist/${id}/albums`;

  usePageMetadata({
    title: artist?.name ? `${artist.name} - Bài hát` : "Bài hát nghệ sĩ",
    description: artist?.name
      ? `${songs.length} bài hát • ${formatTotalDuration(totalDuration)} của ${artist.name} trên Khoaluan Music.`
      : "Danh sách bài hát của nghệ sĩ trên Khoaluan Music.",
    image: portraitUrl || backdropUrl,
    url: artistPath,
    type: "website",
  });

  const panelClass =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-black/24 p-4 shadow-[0_20px_52px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-5 lg:p-6";
  const listShellClass =
    "mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/18 backdrop-blur-xl lg:bg-[#121212]";

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="user-surface ui-skeleton h-[220px] bg-white/5" />
        <div className="user-surface ui-skeleton h-[520px] bg-white/5" />
      </div>
    );
  }

  if (!artist && !songs.length) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full px-4 py-6 sm:px-8">
        <div className="user-surface flex min-h-[260px] items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="user-heading-label">Bài hát nghệ sĩ</p>
            <h1 className="text-2xl font-black text-white">Không tìm thấy dữ liệu</h1>
            <p className="text-sm text-white/60">
              {errorMessage || "Danh sách bài hát hiện chưa sẵn sàng để hiển thị."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page-shell min-h-screen w-full max-w-full space-y-5 px-3 py-4 sm:px-8 lg:space-y-8 lg:px-4 lg:py-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : null}

      <section className={panelClass}>
        {backdropUrl ? (
          <div
            className="pointer-events-none absolute inset-[-8%] scale-110 opacity-[0.58] blur-[90px]"
            style={{
              backgroundImage: `url(${backdropUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "saturate(1.02) brightness(0.42) contrast(1.02)",
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(29,185,84,0.12),transparent_30%),linear-gradient(160deg,rgba(6,8,7,0.76),rgba(2,2,4,0.94))]" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-center gap-2 text-center md:justify-between md:text-left">
            <Link
              to={artistPath}
              className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
            >
              <FiArrowLeft />
              Về trang nghệ sĩ
            </Link>

            <Link
              to={albumsPath}
              className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
            >
              <FiDisc />
              Xem album
            </Link>
          </div>

          <div className="mt-5 flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:text-left">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-black/20 shadow-[0_24px_60px_rgba(0,0,0,0.34)] sm:h-32 sm:w-32">
              {portraitUrl ? (
                <OptimizedImage
                  src={portraitUrl}
                  alt={artist?.name || "Nghệ sĩ"}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl font-black text-white/35">
                  {(artist?.name || "A").trim().charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/42">
                Toàn bộ bài hát
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                {artist?.name || "Nghệ sĩ"}
              </h1>
              <p className="mt-2 text-sm font-medium text-white/68">
                {songs.length} bài hát • {formatTotalDuration(totalDuration)}
              </p>
              {artistSummary ? (
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/72 md:mx-0">
                  {artistSummary}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {songs.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => playSong(songs[0], songs)}
                    className="user-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
                  >
                    <FiPlay />
                    Phát tất cả
                  </button>
                ) : null}
                {artist?.national ? (
                  <span className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/70">
                    <FiUser className="mr-2 inline-block" />
                    {artist.national}
                  </span>
                ) : null}
                <span className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/70">
                  <FiClock className="mr-2 inline-block" />
                  {formatTotalDuration(totalDuration)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={panelClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="user-heading-label">Danh sách</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
              Tất cả bài hát
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-white/65">
              Toàn bộ bài hát của nghệ sĩ được gom vào một nơi để bạn duyệt nhanh và phát liên tục.
            </p>
          </div>
          <span className="user-chip inline-flex items-center self-center rounded-full px-3 py-1 text-xs font-medium lg:self-auto">
            {songs.length} bài hát
          </span>
        </div>

        {songs.length === 0 ? (
          <div className={`${listShellClass} px-5 py-10 text-center text-sm text-white/60`}>
            Nghệ sĩ này chưa có bài hát nào trong thư viện.
          </div>
        ) : (
          <div className={listShellClass}>
            <div className="hidden grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.2fr)_88px_120px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/45 lg:grid">
              <span className="text-center">#</span>
              <span>Bài hát</span>
              <span>Album</span>
              <span className="text-center">Thời gian</span>
              <span className="text-right">Tác vụ</span>
            </div>

            <div className="divide-y divide-white/8">
              {songs.map((song, index) => {
                const songId = normalizeSongId(song);
                const isActive = activeSongId === songId;
                const isLiked = songId && likedSongIds.includes(songId);

                return (
                  <article
                    key={song.id || `${song.title}-${index}`}
                    onClick={() => playSong(song, songs)}
                    className={`group grid min-w-0 cursor-pointer grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition lg:grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.2fr)_88px_120px] ${
                      isActive ? "bg-emerald-400/10" : "md:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="hidden items-center justify-center lg:flex">
                      {isActive ? (
                        isPlaying ? (
                          <FiPause className="text-base text-emerald-300" />
                        ) : (
                          <FiPlay className="text-base text-emerald-300" />
                        )
                      ) : (
                        <span className="text-sm font-semibold text-white/55">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        <OptimizedImage
                          src={resolveAssetUrl(song.cover_url)}
                          alt={song.title}
                          className="h-full w-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-black/45 transition ${
                            isActive ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
                          }`}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-300 text-black shadow-[0_8px_18px_rgba(52,211,153,0.35)]">
                            {isActive && isPlaying ? (
                              <FiPause className="text-sm" />
                            ) : (
                              <FiPlay className="ml-0.5 text-sm" />
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <SongDetailLink
                          song={song}
                          className={`truncate text-sm font-semibold transition md:hover:text-emerald-300 md:hover:underline sm:text-[15px] ${
                            isActive ? "text-emerald-300" : "text-white"
                          }`}
                        >
                          {song.title}
                        </SongDetailLink>
                        <div className="mt-1 truncate text-xs text-white/60">
                          <ArtistNames
                            item={song}
                            stopPropagation
                            fallback={artist?.name || "Nghệ sĩ"}
                            linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                          />
                        </div>
                        <div className="mt-1 truncate text-[11px] text-white/40 lg:hidden">
                          {song.album_id && song.album_title
                            ? `${song.album_title} • ${formatDuration(song.duration)}`
                            : `Single • ${formatDuration(song.duration)}`}
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-0 text-sm text-white/60 lg:block">
                      {song.album_id && song.album_title ? (
                        <Link
                          to={`/album/${song.album_id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="truncate transition md:hover:text-emerald-300 md:hover:underline"
                        >
                          {song.album_title}
                        </Link>
                      ) : (
                        <span>Single</span>
                      )}
                    </div>

                    <div className="hidden text-center text-sm text-white/50 lg:block">
                      {formatDuration(song.duration)}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <SongDetailIconButton song={song} />
                      <AddToPlaylistButton
                        song={song}
                        triggerClassName="h-8 w-8 !border-white/20 !bg-white/[0.06] md:hover:!bg-white/[0.14]"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (songId) toggleLike(songId);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
                          isLiked
                            ? "border-rose-400/50 bg-rose-400/10 text-rose-300"
                            : "border-white/15 text-white/65 md:hover:bg-white/[0.1]"
                        }`}
                        aria-label={isLiked ? "Bỏ thích bài hát" : "Thích bài hát"}
                      >
                        <FiHeart />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
