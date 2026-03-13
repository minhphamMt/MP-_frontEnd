import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDisc,
  FiHeart,
  FiMusic,
  FiPause,
  FiPlay,
  FiUser,
} from "react-icons/fi";
import { getAlbums } from "../api/album.api";
import { getArtistById } from "../api/artist.api";
import { getArtistSongs } from "../api/song.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistNames from "../components/artist/ArtistNames";
import FollowArtistButton from "../components/artist/FollowArtistButton";
import OptimizedImage from "../components/common/OptimizedImage";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import { SongDetailIconButton, SongDetailLink } from "../components/song/SongDetailLink";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import {
  getArtistLabel,
  getPrimaryArtistId,
  normalizeArtists,
} from "../utils/artist";
import { formatDateDisplay } from "../utils/date";
import { formatDuration, toPlayableSong } from "../utils/song";

const SONG_PREVIEW_LIMIT = 10;
const ALBUM_PREVIEW_LIMIT = 5;

const extractData = (response) => response?.data?.data ?? response?.data ?? null;

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.rows)) return value.rows;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.albums)) return value.albums;
  if (Array.isArray(value.songs)) return value.songs;
  return [];
};

const formatTotalDuration = (seconds = 0) => {
  const total = Number.isFinite(Number(seconds)) ? Math.max(0, Math.round(Number(seconds))) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`;
  }

  return formatDuration(total);
};

const stripHtml = (value = "") =>
  `${value}`
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const createBioMarkup = (bio = "") => {
  if (!bio) return { __html: "" };

  let normalized = bio;
  normalized = normalized.replace(/\r\n/g, "\n");
  normalized = normalized.replace(/\n{2,}/g, "\n");
  normalized = normalized.replace(/<br\s*\/?>/gi, "<br />");
  normalized = normalized.replace(/(<br \/>){2,}/gi, "<br />");
  normalized = normalized.replace(/(\n\s*)*(<br \/>)(\s*\n)*/gi, "<br />");
  normalized = normalized.trim();

  return { __html: normalized };
};

const getTimestamp = (item) => {
  const raw =
    item?.release_date ||
    item?.releaseDate ||
    item?.published_at ||
    item?.publishedAt ||
    item?.created_at ||
    item?.createdAt ||
    item?.updated_at ||
    item?.updatedAt ||
    "";

  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : 0;
};

const normalizeArtistProfile = (artist, fallback = {}) => {
  if (!artist && !fallback?.id && !fallback?.name) return null;

  return {
    id:
      artist?.id ??
      artist?.artist_id ??
      artist?.artistId ??
      fallback?.id ??
      null,
    name:
      artist?.name ||
      artist?.artist_name ||
      artist?.alias ||
      fallback?.name ||
      "Nghệ sĩ",
    alias: artist?.alias || fallback?.alias || "",
    realname: artist?.realname || fallback?.realname || "",
    birthday: artist?.birthday || fallback?.birthday || "",
    national: artist?.national || fallback?.national || "",
    cover:
      artist?.cover_url ||
      artist?.cover ||
      artist?.avatar_url ||
      fallback?.cover ||
      fallback?.avatar ||
      "",
    avatar:
      artist?.avatar_url ||
      artist?.avatar ||
      artist?.cover_url ||
      fallback?.avatar ||
      fallback?.cover ||
      "",
    bio: artist?.bio || fallback?.bio || "",
    shortBio:
      artist?.short_bio ||
      artist?.shortBio ||
      fallback?.shortBio ||
      fallback?.short_bio ||
      "",
  };
};

const normalizeAlbum = (album, artist) => {
  if (!album || typeof album !== "object") return null;

  return {
    ...album,
    id: album.id ?? album.album_id ?? album.albumId ?? null,
    title: album.title ?? album.name ?? "Album",
    cover_url:
      album.cover_url ||
      album.cover ||
      album.thumbnail ||
      album.image_url ||
      "",
    artist_name: getArtistLabel(
      album,
      artist?.name || album.artist_name || album.artist?.name || album.creator?.name || ""
    ),
  };
};

function SectionHeader({
  label,
  title,
  description,
  countLabel,
  toggleLabel,
  onToggle,
  headerActions,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="user-heading-label">{label}</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm text-white/65">{description}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {countLabel && (
          <span className="user-chip inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
            {countLabel}
          </span>
        )}
        {headerActions}
        {toggleLabel && onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          >
            {toggleLabel.expanded ? <FiChevronUp /> : <FiChevronDown />}
            {toggleLabel.text}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ArtistDetail() {
  useEnsureLikedSongsLoaded();

  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);

  const {
    playSong,
    currentSong,
    isPlaying,
    likedSongIds,
    toggleLike,
  } = usePlayerStore();

  useEffect(() => {
    setShowAllSongs(false);
    setShowAllAlbums(false);
  }, [id]);

  const loadArtist = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [artistResult, songsResult, albumsResult] = await Promise.allSettled([
        getArtistById(id),
        getArtistSongs(id),
        getAlbums({ artist_id: id, limit: 100 }),
      ]);

      const artistPayload =
        artistResult.status === "fulfilled" ? extractData(artistResult.value) : null;
      const songsPayload =
        songsResult.status === "fulfilled" ? extractData(songsResult.value) : null;
      const albumsPayload =
        albumsResult.status === "fulfilled" ? extractData(albumsResult.value) : null;

      const artistFromSongs = songsPayload?.artist ?? null;
      const rawSongs = toArray(songsPayload?.songs ?? songsPayload?.data ?? songsPayload);
      const rawAlbums = toArray(albumsPayload);

      const inferredName =
        artistPayload?.name ||
        artistPayload?.alias ||
        artistFromSongs?.name ||
        artistFromSongs?.alias ||
        getArtistLabel(rawSongs[0], "") ||
        getArtistLabel(rawAlbums[0], "");

      const resolvedArtist = normalizeArtistProfile(artistPayload || artistFromSongs, {
        id,
        name: inferredName,
      });

      const nextSongs = rawSongs
        .map((song) => {
          const fallbackArtists = normalizeArtists({
            artist_id: resolvedArtist?.id ?? id,
            artist_name:
              resolvedArtist?.name ||
              resolvedArtist?.alias ||
              song?.artist_name ||
              song?.artist?.name ||
              "",
          });
          const artists = normalizeArtists({
            ...song,
            artists: song?.artists || fallbackArtists,
          });

          return toPlayableSong({
            ...song,
            artist_name: getArtistLabel(
              { ...song, artists },
              resolvedArtist?.name || resolvedArtist?.alias || ""
            ),
            artist_id: getPrimaryArtistId({ ...song, artists }) ?? resolvedArtist?.id ?? id,
            artists,
          });
        })
        .filter((song) => song?.id);

      const nextAlbums = rawAlbums
        .map((album) => normalizeAlbum(album, resolvedArtist))
        .filter((album) => album?.id || album?.title)
        .sort((first, second) => getTimestamp(second) - getTimestamp(first));

      setArtist(resolvedArtist);
      setSongs(nextSongs);
      setAlbums(nextAlbums);

      if (!resolvedArtist && !nextSongs.length && !nextAlbums.length) {
        setErrorMessage("Không tìm thấy nghệ sĩ.");
      }
    } catch (error) {
      console.error("Load artist detail failed", error);
      setArtist(null);
      setSongs([]);
      setAlbums([]);
      setErrorMessage("Không thể tải thông tin nghệ sĩ.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadArtist();
  }, [loadArtist]);

  const totalDuration = useMemo(
    () => songs.reduce((sum, song) => sum + Number(song?.duration || 0), 0),
    [songs]
  );

  const artistSummary = useMemo(() => {
    const source = artist?.shortBio || stripHtml(artist?.bio || "");
    if (!source) return "";
    return source.length > 240 ? `${source.slice(0, 240).trim()}...` : source;
  }, [artist?.bio, artist?.shortBio]);

  const artistInfoItems = useMemo(
    () =>
      [
        {
          label: "Nghệ danh",
          value: artist?.alias && artist?.alias !== artist?.name ? artist.alias : null,
        },
        { label: "Tên thật", value: artist?.realname || null },
        {
          label: "Ngày sinh",
          value: artist?.birthday ? formatDateDisplay(artist.birthday) : null,
        },
        { label: "Quốc gia", value: artist?.national || null },
      ].filter((item) => item.value),
    [artist]
  );

  const heroMetrics = useMemo(
    () => [
      { icon: FiMusic, label: "Bài hát", value: `${songs.length}` },
      { icon: FiDisc, label: "Album", value: `${albums.length}` },
      { icon: FiClock, label: "Tổng thời lượng", value: formatTotalDuration(totalDuration) },
      {
        icon: FiUser,
        label: artist?.national ? "Quốc gia" : "Thông tin",
        value:
          artist?.national ||
          (artist?.birthday ? formatDateDisplay(artist.birthday) : "Đang cập nhật"),
      },
    ],
    [albums.length, artist?.birthday, artist?.national, songs.length, totalDuration]
  );

  const visibleSongs = showAllSongs ? songs : songs.slice(0, SONG_PREVIEW_LIMIT);
  const visibleAlbums = showAllAlbums ? albums : albums.slice(0, ALBUM_PREVIEW_LIMIT);

  const hiddenSongCount = Math.max(0, songs.length - SONG_PREVIEW_LIMIT);
  const hiddenAlbumCount = Math.max(0, albums.length - ALBUM_PREVIEW_LIMIT);

  const coverUrl = resolveAssetUrl(artist?.cover || artist?.avatar);
  const portraitUrl = resolveAssetUrl(artist?.avatar || artist?.cover);
  const activeSongId = normalizeSongId(currentSong);

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="user-surface h-[320px] animate-pulse bg-white/5" />
          <div className="user-surface h-[320px] animate-pulse bg-white/5" />
        </div>
        <div className="user-surface h-[420px] animate-pulse bg-white/5" />
        <div className="user-surface h-[260px] animate-pulse bg-white/5" />
      </div>
    );
  }

  if (!artist && !songs.length && !albums.length) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full px-4 py-6 sm:px-8">
        <div className="user-surface flex min-h-[260px] items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="user-heading-label">Nghệ sĩ</p>
            <h1 className="text-2xl font-black text-white">Không tìm thấy thông tin</h1>
            <p className="text-sm text-white/60">
              {errorMessage || "Trang nghệ sĩ này hiện chưa có nội dung để xem."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page-shell min-h-screen w-full max-w-full space-y-8 px-4 py-6 sm:px-8">
      {errorMessage && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      )}

      <section className="user-surface relative overflow-hidden p-5 sm:p-6 lg:p-8">
        {coverUrl && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,185,84,0.24),_transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_36%)]" />
        <div className="pointer-events-none absolute -top-24 right-0 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[300px] xl:mx-0">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#171717] shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
              {portraitUrl ? (
                <OptimizedImage
                  src={portraitUrl}
                  alt={artist?.name || "Nghệ sĩ"}
                  className="aspect-square h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-white/5 text-6xl font-black text-white/35">
                  {(artist?.name || "A").trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <p className="user-heading-label">Nghệ sĩ</p>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                {artist?.name || "Nghệ sĩ"}
              </h1>
              {artist?.alias && artist.alias !== artist.name && (
                <p className="text-base text-white/65">{artist.alias}</p>
              )}
              {artistSummary && (
                <p className="max-w-3xl text-sm leading-relaxed text-white/78 sm:text-[15px]">
                  {artistSummary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {songs.length} bài hát
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {albums.length} album
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {formatTotalDuration(totalDuration)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {songs.length > 0 && (
                <button
                  type="button"
                  onClick={() => playSong(songs[0], songs)}
                  className="user-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  <FiPlay className="text-base" />
                  Phát tất cả
                </button>
              )}
              <FollowArtistButton artist={artist} size="lg" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((item) => (
                <article key={item.label} className="user-soft-card px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
                    <item.icon className="text-white/60" />
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-white sm:text-xl">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="user-surface p-4 sm:p-5 lg:p-6">
        <SectionHeader
          label="Danh mục"
          title="Bài hát của nghệ sĩ"
          description={
            songs.length > SONG_PREVIEW_LIMIT
              ? "Một vài ca khúc nổi bật được mở ra trước để bạn bắt nhịp nhanh hơn."
              : "Những ca khúc đang có mặt trong thư viện của nghệ sĩ."
          }
          countLabel={`${songs.length} bài hát`}
          headerActions={
            songs.length > 0 ? (
              <button
                type="button"
                onClick={() => playSong(songs[0], songs)}
                className="user-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              >
                <FiPlay />
                Phát tất cả
              </button>
            ) : null
          }
          toggleLabel={
            hiddenSongCount > 0 || showAllSongs
              ? {
                  expanded: showAllSongs,
                  text: showAllSongs ? "Thu gọn danh sách" : `Xem thêm ${hiddenSongCount} bài hát`,
                }
              : null
          }
          onToggle={
            hiddenSongCount > 0 || showAllSongs
              ? () => setShowAllSongs((prev) => !prev)
              : undefined
          }
        />

        {songs.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center text-sm text-white/60">
            Nghệ sĩ này chưa có ca khúc nào trong thư viện.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#121212]">
            <div className="hidden grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.2fr)_88px_120px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/45 lg:grid">
              <span className="text-center">#</span>
              <span>Bài hát</span>
              <span>Album</span>
              <span className="text-center">Thời gian</span>
              <span className="text-right">Tác vụ</span>
            </div>

            <div className="divide-y divide-white/8">
              {visibleSongs.map((song, index) => {
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

      <section className="user-surface p-4 sm:p-5 lg:p-6">
        <SectionHeader
          label="Album"
          title="Album của nghệ sĩ"
          description={
            albums.length > ALBUM_PREVIEW_LIMIT
              ? "Một vài album nổi bật được mở ra trước để bạn xem nhanh hơn."
              : "Những album đang có mặt trong thư viện của nghệ sĩ."
          }
          countLabel={`${albums.length} album`}
          toggleLabel={
            hiddenAlbumCount > 0 || showAllAlbums
              ? {
                  expanded: showAllAlbums,
                  text: showAllAlbums ? "Thu gọn album" : `Xem thêm ${hiddenAlbumCount} album`,
                }
              : null
          }
          onToggle={
            hiddenAlbumCount > 0 || showAllAlbums
              ? () => setShowAllAlbums((prev) => !prev)
              : undefined
          }
        />

        {albums.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center text-sm text-white/60">
            Nghệ sĩ này chưa có album nào trong thư viện.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {visibleAlbums.map((album) => (
              <AlbumCard key={album.id || album.title} album={album} variant="library" />
            ))}
          </div>
        )}
      </section>

      {(artist?.bio || artistInfoItems.length > 0) && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          {artist?.bio && (
            <section className="user-surface relative overflow-hidden p-5 sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
              <div className="relative">
                <p className="user-heading-label">Giới thiệu</p>
                <div
                  className="mt-4 whitespace-pre-line text-sm leading-7 text-white/78"
                  dangerouslySetInnerHTML={createBioMarkup(artist.bio)}
                />
              </div>
            </section>
          )}

          {artistInfoItems.length > 0 && (
            <section className="user-surface relative overflow-hidden p-5 sm:p-6">
              <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
              <div className="relative">
                <p className="user-heading-label">Thông tin thêm</p>
                <div className="mt-4 space-y-3">
                  {artistInfoItems.map((item) => (
                    <div
                      key={item.label}
                      className="user-soft-card flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    >
                      <span className="text-sm text-white/55">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
