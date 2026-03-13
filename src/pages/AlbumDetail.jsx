import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiDisc,
  FiHeart,
  FiMusic,
  FiPause,
  FiPlay,
  FiUser,
} from "react-icons/fi";
import { getAlbumById } from "../api/album.api";
import ArtistNames from "../components/artist/ArtistNames";
import OptimizedImage from "../components/common/OptimizedImage";
import ShareLinkButton from "../components/common/ShareLinkButton";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import { SongDetailIconButton, SongDetailLink } from "../components/song/SongDetailLink";
import {
  useEnsureLikedAlbumsLoaded,
  useEnsureLikedSongsLoaded,
} from "../hooks/useEnsureLibraryState";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import useAlbumLikeStore, {
  normalizeAlbumId,
} from "../store/album-like.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import {
  getArtistLabel,
  getPrimaryArtistId,
  normalizeArtists,
} from "../utils/artist";
import { formatDateDisplay } from "../utils/date";
import { formatDuration, toPlayableSong } from "../utils/song";

const formatTotalDuration = (seconds = 0) => {
  const total = Number.isFinite(Number(seconds)) ? Math.max(0, Math.round(Number(seconds))) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return formatDuration(total);
};

const stripHtml = (value = "") =>
  `${value}`
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function SectionHeader({ label, title, description, headerActions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="user-heading-label">{label}</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm text-white/65">{description}</p>}
      </div>
      {headerActions ? <div className="flex flex-wrap items-center gap-2">{headerActions}</div> : null}
    </div>
  );
}

export default function AlbumDetail() {
  useEnsureLikedSongsLoaded();
  useEnsureLikedAlbumsLoaded();

  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
  const likedAlbumIds = useAlbumLikeStore((state) => state.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((state) => state.toggleAlbumLike);

  const loadAlbum = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAlbumById(id);
      const payload = res?.data?.data ?? res?.data ?? null;

      if (!payload) {
        setAlbum(null);
        setSongs([]);
        setErrorMessage("Không tìm thấy album.");
        return;
      }

      const normalizedAlbum = {
        ...payload,
        id: payload.id ?? payload.album_id ?? payload.albumId ?? id,
        title: payload.title ?? payload.name ?? "Album",
        cover_url: payload.cover_url || payload.cover || "",
        artist_name: getArtistLabel(
          payload,
          payload.artist_name || payload.artist?.name || payload.artist?.alias || ""
        ),
      };

      const normalizedSongs = (payload.songs || []).map((song) => {
        const fallbackArtists = normalizeArtists({
          artist_id: song.artist_id || song.artist?.id || payload.artist_id || payload.artist?.id,
          artist_name:
            song.artist_name ||
            song.artist?.name ||
            payload.artist_name ||
            payload.artist?.name ||
            payload.artist?.alias ||
            "",
        });
        const artists = normalizeArtists({
          ...song,
          artists: song.artists || fallbackArtists,
        });

        return toPlayableSong({
          ...song,
          artist_name: getArtistLabel({ ...song, artists }, ""),
          artist_id: getPrimaryArtistId({ ...song, artists }),
          artists,
          album_id: song.album_id ?? normalizedAlbum.id,
          album_title: song.album_title ?? normalizedAlbum.title,
        });
      });

      setAlbum(normalizedAlbum);
      setSongs(normalizedSongs);
      setErrorMessage("");
    } catch (err) {
      console.error("Load album detail error:", err);
      setAlbum(null);
      setSongs([]);
      setErrorMessage("Không thể tải album.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  const totalDuration = useMemo(
    () => songs.reduce((sum, item) => sum + Number(item?.duration || 0), 0),
    [songs]
  );

  const albumId = normalizeAlbumId(album);
  const isLiked = albumId && likedAlbumIds.includes(albumId);
  const sharePath = albumId ? `/album/${albumId}` : id ? `/album/${id}` : "";
  const artistMeta = album?.artist || {};
  const artistDisplayName =
    album?.artist_name || artistMeta?.name || artistMeta?.alias || "Đang cập nhật";
  const artistId = album?.artist_id || artistMeta?.id || null;
  const releaseDate = album?.release_date ? formatDateDisplay(album.release_date) : "Đang cập nhật";
  const artistSummary = useMemo(
    () =>
      artistMeta?.short_bio ||
      artistMeta?.shortBio ||
      (artistMeta?.bio ? stripHtml(artistMeta.bio).slice(0, 240).trim() : ""),
    [artistMeta?.bio, artistMeta?.shortBio, artistMeta?.short_bio]
  );

  const summaryCards = useMemo(
    () => [
      { icon: FiMusic, label: "Bài hát", value: `${songs.length}` },
      { icon: FiClock, label: "Tổng thời lượng", value: formatTotalDuration(totalDuration) },
      { icon: FiCalendar, label: "Ngày phát hành", value: releaseDate },
      { icon: FiUser, label: "Nghệ sĩ", value: artistDisplayName },
    ],
    [artistDisplayName, releaseDate, songs.length, totalDuration]
  );

  const albumInfoItems = useMemo(
    () => [
      { label: "Tên album", value: album?.title || "Đang cập nhật" },
      { label: "Nghệ sĩ", value: artistDisplayName },
      { label: "Ngày phát hành", value: releaseDate },
      { label: "Số bài hát", value: `${songs.length} bài hát` },
      { label: "Tổng thời lượng", value: formatTotalDuration(totalDuration) },
    ],
    [album?.title, artistDisplayName, releaseDate, songs.length, totalDuration]
  );

  const artistInfoItems = useMemo(
    () =>
      [
        { label: "Nghệ danh", value: artistMeta?.alias },
        { label: "Tên thật", value: artistMeta?.realname },
        {
          label: "Ngày sinh",
          value: artistMeta?.birthday ? formatDateDisplay(artistMeta.birthday) : null,
        },
        { label: "Quốc gia", value: artistMeta?.national },
      ].filter((item) => item.value),
    [artistMeta?.alias, artistMeta?.birthday, artistMeta?.national, artistMeta?.realname]
  );
  const albumMetaDescription = useMemo(() => {
    const parts = [
      artistDisplayName,
      `${songs.length} bài hát`,
      formatTotalDuration(totalDuration),
      releaseDate,
    ].filter(Boolean);

    return parts.length
      ? `${parts.join(" • ")} trên Khoaluan Music.`
      : "Khám phá album trên Khoaluan Music.";
  }, [artistDisplayName, releaseDate, songs.length, totalDuration]);

  usePageMetadata({
    title: album?.title || "Album",
    description: albumMetaDescription,
    image: resolveAssetUrl(album?.cover_url || ""),
    url: sharePath,
    type: "music.album",
  });

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="user-surface ui-skeleton h-[320px] bg-white/5" />
          <div className="user-surface ui-skeleton h-[320px] bg-white/5" />
        </div>
        <div className="user-surface ui-skeleton h-[420px] bg-white/5" />
        <div className="user-surface ui-skeleton h-[280px] bg-white/5" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full px-4 py-6 sm:px-8">
        <div className="user-surface flex min-h-[260px] items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="user-heading-label">Album</p>
            <h1 className="text-2xl font-black text-white">Không tìm thấy album</h1>
            <p className="text-sm text-white/60">
              {errorMessage || "Album này hiện chưa sẵn sàng trong thư viện."}
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
        {album.cover_url && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${resolveAssetUrl(album.cover_url)})`,
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
              <OptimizedImage
                src={resolveAssetUrl(album.cover_url)}
                alt={album.title}
                className="aspect-square h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <p className="user-heading-label">Album</p>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                {album.title}
              </h1>
              <button
                type="button"
                onClick={() => artistId && navigate(`/artist/${artistId}`)}
                disabled={!artistId}
                className="inline-flex max-w-full items-center gap-2 text-left text-sm text-white/78 transition md:hover:text-emerald-300 disabled:cursor-default disabled:hover:text-white/78"
              >
                <FiUser className="shrink-0" />
                <span className="truncate">{artistDisplayName}</span>
              </button>
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
                {formatTotalDuration(totalDuration)}
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {releaseDate}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {canPlay && songs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => playSong(songs[0], songs)}
                  className="user-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  <FiPlay className="text-base" />
                  Phát tất cả
                </button>
              ) : (
                <div className="user-btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white/65">
                  <FiDisc />
                  Chỉ xem thông tin
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (!isArtistRole) toggleAlbumLike(albumId);
                }}
                disabled={isArtistRole}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  isLiked
                    ? "border-rose-400/60 bg-rose-500/18 text-rose-100 md:hover:bg-rose-500/24"
                    : "border-white/15 bg-white/5 text-white/80 md:hover:bg-white/10"
                } ${isArtistRole ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <FiHeart className={isLiked ? "text-rose-300" : ""} />
                {isLiked ? "Đã thích album" : "Thích album"}
              </button>

              {artistId && (
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${artistId}`)}
                  className="user-btn-secondary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  <FiUser />
                  Xem nghệ sĩ
                </button>
              )}

              <ShareLinkButton
                path={sharePath}
                title="Chia sẻ album"
                shareTitle={album?.title || "Album"}
                shareText={`Nghe album ${album?.title || "này"} của ${artistDisplayName} trên Khoaluan Music.`}
                preview={{
                  eyebrow: "Album",
                  title: album?.title || "Album",
                  subtitle: artistDisplayName,
                  description: `${songs.length} bài hát • ${formatTotalDuration(
                    totalDuration
                  )} • ${releaseDate}`,
                  image: resolveAssetUrl(album?.cover_url || ""),
                }}
                className="px-5 py-3"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((item) => (
                <article key={item.label} className="user-soft-card px-4 py-4">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50">
                    <item.icon className="text-white/60" />
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-3 truncate text-lg font-bold text-white sm:text-xl">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="user-surface p-5 sm:p-6">
        <SectionHeader
          label="Tracklist"
          title="Danh sách bài hát"
          description={
            canPlay
              ? "Tracklist của album nằm trọn ở đây để bạn nghe liền mạch hoặc chọn đúng bài mình thích."
              : "Tài khoản hiện tại đang ở chế độ xem thông tin của album."
          }
          headerActions={
            songs.length > 0 ? (
              <span className="user-chip rounded-full px-3 py-1 text-xs font-medium">
                {songs.length} bài hát
              </span>
            ) : null
          }
        />

        {songs.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-[#121212] px-5 py-10 text-center text-sm text-white/60">
            Album này hiện chưa có track nào để nghe.
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#121212]">
            <div className="hidden grid-cols-[56px_minmax(0,2.35fr)_minmax(0,1.15fr)_88px_120px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/45 lg:grid">
              <span className="text-center">#</span>
              <span>Bài hát</span>
              <span>Nghệ sĩ</span>
              <span className="text-center">Thời gian</span>
              <span className="text-right">Tác vụ</span>
            </div>

            <div className="divide-y divide-white/8">
              {songs.map((song, index) => {
                const songId = normalizeSongId(song);
                const isActive = normalizeSongId(currentSong) === songId;
                const isSongLiked = songId && likedSongIds.includes(songId);

                return (
                  <article
                    key={song.id || `${song.title}-${index}`}
                    onClick={canPlay ? () => playSong(song, songs) : undefined}
                    className={`group grid min-w-0 grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition lg:grid-cols-[56px_minmax(0,2.35fr)_minmax(0,1.15fr)_88px_120px] ${
                      isActive
                        ? "bg-emerald-400/10"
                        : canPlay
                          ? "cursor-pointer md:hover:bg-white/[0.04]"
                          : "cursor-default"
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
                        {canPlay && (
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
                        )}
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
                        <div className="mt-1 truncate text-xs text-white/60 lg:hidden">
                          <ArtistNames
                            item={song}
                            stopPropagation
                            fallback={artistDisplayName}
                            linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                          />
                        </div>
                        <div className="mt-1 truncate text-[11px] text-white/40 lg:hidden">
                          {formatDuration(song.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="hidden min-w-0 text-sm text-white/60 lg:block">
                      <ArtistNames
                        item={song}
                        stopPropagation
                        fallback={artistDisplayName}
                        linkClassName="truncate transition md:hover:text-emerald-300 md:hover:underline"
                      />
                    </div>

                    <div className="hidden text-center text-sm text-white/50 lg:block">
                      {formatDuration(song.duration)}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <SongDetailIconButton song={song} />
                      <AddToPlaylistButton
                        song={song}
                        disabled={isArtistRole}
                        triggerClassName="h-8 w-8 !border-white/20 !bg-white/[0.06] md:hover:!bg-white/[0.14]"
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!isArtistRole && songId) toggleLike(songId);
                        }}
                        disabled={isArtistRole}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm transition ${
                          isSongLiked
                            ? "border-rose-400/50 bg-rose-400/10 text-rose-300"
                            : "border-white/15 text-white/65 md:hover:bg-white/[0.1]"
                        } ${isArtistRole ? "cursor-not-allowed opacity-60" : ""}`}
                        aria-label={isSongLiked ? "Bỏ thích bài hát" : "Thích bài hát"}
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

      <section className="user-surface p-5 sm:p-6">
        <SectionHeader
          label="Thông tin"
          title="Album và nghệ sĩ"
          description="Những điểm nổi bật của album và nghệ sĩ được đặt cạnh nhau để bạn theo dõi dễ hơn."
        />

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            {albumInfoItems.map((item) => (
              <article key={item.label} className="user-soft-card px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.label}</p>
                <p className="mt-3 text-sm font-semibold text-white sm:text-[15px]">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <article className="user-soft-card p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Nghệ sĩ phát hành</p>
              <h3 className="mt-3 text-xl font-bold text-white">{artistDisplayName}</h3>
              {artistSummary && (
                <p className="mt-2 text-sm leading-relaxed text-white/65">{artistSummary}</p>
              )}
              {artistId && (
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${artistId}`)}
                  className="user-btn-secondary mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                >
                  <FiUser />
                  Mở trang nghệ sĩ
                </button>
              )}
            </article>

            {artistInfoItems.length > 0 && (
              <article className="user-soft-card p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Thông tin thêm</p>
                <div className="mt-4 space-y-3">
                  {artistInfoItems.map((item) => (
                    <div
                      key={item.label}
                      className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-3 last:border-none last:pb-0"
                    >
                      <span className="text-sm text-white/55">{item.label}</span>
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
