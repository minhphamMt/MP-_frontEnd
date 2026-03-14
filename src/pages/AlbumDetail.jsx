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
import useAlbumLikeStore, { normalizeAlbumId } from "../store/album-like.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import {
  getArtistLabel,
  getPrimaryArtistId,
  normalizeArtists,
} from "../utils/artist";
import { formatDateDisplay } from "../utils/date";
import { formatDuration, toPlayableSong } from "../utils/song";
import { formatTotalDuration, stripHtml } from "./artistDetail.shared";

function SectionHeader({ label, title, description, headerActions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="user-heading-label">{label}</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm text-white/65">{description}</p> : null}
      </div>
      {headerActions ? (
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          {headerActions}
        </div>
      ) : null}
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

  const { playSong, currentSong, isPlaying, likedSongIds, toggleLike } = usePlayerStore();
  const role = useAuthStore((state) => state.role);
  const isArtistRole = role === "ARTIST";
  const canPlay = role !== "ARTIST" && role !== "ADMIN";
  const likedAlbumIds = useAlbumLikeStore((state) => state.likedAlbumIds);
  const toggleAlbumLike = useAlbumLikeStore((state) => state.toggleAlbumLike);

  const loadAlbum = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

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
    } catch (error) {
      console.error("Load album detail error:", error);
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
  const albumCoverUrl = resolveAssetUrl(album?.cover_url || "");
  const albumId = normalizeAlbumId(album);
  const isLiked = albumId && likedAlbumIds.includes(albumId);
  const sharePath = albumId ? `/album/${albumId}` : id ? `/album/${id}` : "";
  const artistMeta = album?.artist || {};
  const artistDisplayName =
    album?.artist_name || artistMeta?.name || artistMeta?.alias || "Đang cập nhật";
  const artistId = album?.artist_id || artistMeta?.id || null;
  const releaseDate = album?.release_date
    ? formatDateDisplay(album.release_date)
    : "Đang cập nhật";
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
  const sharePreview = useMemo(
    () => ({
      eyebrow: "Album",
      title: album?.title || "Album",
      subtitle: artistDisplayName,
      description: `${songs.length} bài hát • ${formatTotalDuration(totalDuration)} • ${releaseDate}`,
      image: albumCoverUrl,
    }),
    [album?.title, albumCoverUrl, artistDisplayName, releaseDate, songs.length, totalDuration]
  );

  usePageMetadata({
    title: album?.title || "Album",
    description: albumMetaDescription,
    image: albumCoverUrl,
    url: sharePath,
    type: "music.album",
  });

  const panelClass =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-black/24 p-4 shadow-[0_20px_52px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-5 lg:p-6";
  const listShellClass =
    "mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/18 backdrop-blur-xl lg:bg-[#121212]";
  const secondaryActionClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-white/84 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition active:scale-95";

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
    <div className="user-page-shell min-h-screen w-full max-w-full space-y-5 px-3 py-4 sm:px-8 lg:space-y-8 lg:px-4 lg:py-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : null}

      <section className={panelClass}>
        {albumCoverUrl ? (
          <div
            className="pointer-events-none absolute inset-[-10%] scale-110 opacity-[0.62] blur-[100px]"
            style={{
              backgroundImage: `url(${albumCoverUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "saturate(1.03) brightness(0.42) contrast(1.02)",
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(29,185,84,0.12),transparent_30%),linear-gradient(160deg,rgba(6,8,7,0.76),rgba(2,2,4,0.94))]" />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(180px,260px)_minmax(0,1fr)] lg:items-center">
          <div className="relative mx-auto w-full max-w-[min(58vw,260px)] lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-4 rounded-[34px] opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 68% 70%, rgba(29,185,84,0.18), transparent 42%)",
              }}
            />
            <div className="relative aspect-square overflow-hidden rounded-[28px] bg-black/28 shadow-[0_26px_80px_rgba(0,0,0,0.42)]">
              <OptimizedImage
                src={albumCoverUrl}
                alt={album.title}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>

          <div className="min-w-0 text-center lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/42">
              Album
            </p>
            <h1 className="mt-4 text-[clamp(2rem,6vw,4rem)] font-semibold leading-[0.96] tracking-tight text-white">
              {album.title}
            </h1>
            <button
              type="button"
              onClick={() => artistId && navigate(`/artist/${artistId}`)}
              disabled={!artistId}
              className="mt-3 inline-flex max-w-full items-center gap-2 text-sm font-medium text-white/72 transition md:hover:text-emerald-300 disabled:cursor-default disabled:hover:text-white/72"
            >
              <FiUser className="shrink-0" />
              <span className="truncate">{artistDisplayName}</span>
            </button>
            {artistSummary ? (
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/74 lg:mx-0">
                {artistSummary}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/72">
                {songs.length} bài hát
              </span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/72">
                {formatTotalDuration(totalDuration)}
              </span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/72">
                {releaseDate}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {canPlay && songs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => playSong(songs[0], songs)}
                  className="user-btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  <FiPlay className="text-base" />
                  Phát tất cả
                </button>
              ) : (
                <div className={`${secondaryActionClass} text-white/62`}>
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
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                  isLiked
                    ? "border-rose-400/60 bg-rose-500/18 text-rose-100"
                    : "border-white/15 bg-white/[0.07] text-white/84"
                } ${isArtistRole ? "cursor-not-allowed opacity-60" : "active:scale-95"}`}
              >
                <FiHeart className={isLiked ? "text-rose-300" : ""} />
                {isLiked ? "Đã thích album" : "Thích album"}
              </button>

              {artistId ? (
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${artistId}`)}
                  className={secondaryActionClass}
                >
                  <FiUser />
                  Xem nghệ sĩ
                </button>
              ) : null}

              <ShareLinkButton
                path={sharePath}
                title="Chia sẻ album"
                shareTitle={album?.title || "Album"}
                shareText={`Nghe album ${album?.title || "này"} của ${artistDisplayName} trên Khoaluan Music.`}
                preview={sharePreview}
                className="min-h-11 justify-center border-white/15 bg-white/[0.07] text-white/84 shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {summaryCards.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[18px] bg-white/[0.045] px-3 py-3 text-left backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/42">
                    <item.icon className="text-white/58" />
                    <span>{item.label}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={panelClass}>
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
          <div className={`${listShellClass} px-5 py-10 text-center text-sm text-white/60`}>
            Album này hiện chưa có track nào để nghe.
          </div>
        ) : (
          <div className={listShellClass}>
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
                        {canPlay ? (
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
                        ) : null}
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

      <section className={panelClass}>
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
              {artistSummary ? (
                <p className="mt-2 text-sm leading-relaxed text-white/65">{artistSummary}</p>
              ) : null}
              {artistId ? (
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${artistId}`)}
                  className="user-btn-secondary mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                >
                  <FiUser />
                  Mở trang nghệ sĩ
                </button>
              ) : null}
            </article>

            {artistInfoItems.length > 0 ? (
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
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
