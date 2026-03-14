import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiDisc,
  FiHeart,
  FiMusic,
  FiPause,
  FiPlay,
  FiUser,
} from "react-icons/fi";
import AlbumCard from "../components/album/AlbumCard";
import ArtistNames from "../components/artist/ArtistNames";
import FollowArtistButton from "../components/artist/FollowArtistButton";
import OptimizedImage from "../components/common/OptimizedImage";
import ShareLinkButton from "../components/common/ShareLinkButton";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import { SongDetailIconButton, SongDetailLink } from "../components/song/SongDetailLink";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePageMetadata from "../hooks/usePageMetadata";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import { formatDateDisplay } from "../utils/date";
import { formatDuration } from "../utils/song";
import {
  ALBUM_PREVIEW_LIMIT,
  SONG_PREVIEW_LIMIT,
  createBioMarkup,
  fetchArtistDetailData,
  formatTotalDuration,
  stripHtml,
} from "./artistDetail.shared";

function SectionHeader({
  label,
  title,
  description,
  countLabel,
  headerActions,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="user-heading-label">{label}</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm text-white/65">{description}</p> : null}
      </div>

      {countLabel || headerActions ? (
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
          {countLabel ? (
            <span className="user-chip inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
              {countLabel}
            </span>
          ) : null}
          {headerActions}
        </div>
      ) : null}
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

  const { playSong, currentSong, isPlaying, likedSongIds, toggleLike } = usePlayerStore();

  const loadArtist = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const nextData = await fetchArtistDetailData(id);
      setArtist(nextData.artist);
      setSongs(nextData.songs);
      setAlbums(nextData.albums);

      if (!nextData.artist && !nextData.songs.length && !nextData.albums.length) {
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
      {
        icon: FiClock,
        label: "Tổng thời lượng",
        value: formatTotalDuration(totalDuration),
      },
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

  const previewSongs = useMemo(
    () => songs.slice(0, SONG_PREVIEW_LIMIT),
    [songs]
  );
  const previewAlbums = useMemo(
    () => albums.slice(0, ALBUM_PREVIEW_LIMIT),
    [albums]
  );
  const hiddenSongCount = Math.max(0, songs.length - previewSongs.length);
  const hiddenAlbumCount = Math.max(0, albums.length - previewAlbums.length);

  const coverUrl = resolveAssetUrl(artist?.cover || artist?.avatar);
  const portraitUrl = resolveAssetUrl(artist?.avatar || artist?.cover);
  const heroBackdropUrl = coverUrl || portraitUrl;
  const activeSongId = normalizeSongId(currentSong);
  const sharePath = artist?.id ? `/artist/${artist.id}` : id ? `/artist/${id}` : "";
  const songsPath = artist?.id ? `/artist/${artist.id}/songs` : `/artist/${id}/songs`;
  const albumsPath = artist?.id ? `/artist/${artist.id}/albums` : `/artist/${id}/albums`;
  const artistMetaDescription = useMemo(() => {
    const parts = [
      `${songs.length} bài hát`,
      `${albums.length} album`,
      totalDuration ? formatTotalDuration(totalDuration) : "",
      artistSummary,
    ].filter(Boolean);

    return parts.length
      ? `${parts.join(" • ")} trên Khoaluan Music.`
      : "Khám phá nghệ sĩ trên Khoaluan Music.";
  }, [albums.length, artistSummary, songs.length, totalDuration]);
  const sharePreview = useMemo(
    () => ({
      eyebrow: "Nghệ sĩ",
      title: artist?.name || artist?.alias || "Nghệ sĩ",
      subtitle: artist?.national || `${songs.length} bài hát • ${albums.length} album`,
      description:
        artistSummary || `${songs.length} bài hát • ${albums.length} album trên Khoaluan Music.`,
      image: coverUrl || portraitUrl,
    }),
    [albums.length, artist?.alias, artist?.name, artist?.national, artistSummary, coverUrl, portraitUrl, songs.length]
  );

  usePageMetadata({
    title: artist?.name || artist?.alias || "Nghệ sĩ",
    description: artistMetaDescription,
    image: coverUrl || portraitUrl,
    url: sharePath,
    type: "profile",
  });

  const mobileSectionClass =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-black/24 p-4 shadow-[0_20px_52px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-5 lg:rounded-[18px] lg:bg-[#151515] lg:p-6 lg:shadow-[0_12px_28px_rgba(0,0,0,0.34)]";
  const mobileCardShellClass =
    "rounded-[22px] bg-black/18 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-5";
  const mobileListShellClass =
    "mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black/18 backdrop-blur-xl lg:bg-[#121212]";
  const mobileSecondaryButtonClass =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-white/84 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition active:scale-95";
  const heroActionGroupClass = "flex flex-wrap items-center justify-center gap-3 xl:justify-start";

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="user-surface ui-skeleton h-[320px] bg-white/5" />
          <div className="user-surface ui-skeleton h-[320px] bg-white/5" />
        </div>
        <div className="user-surface ui-skeleton h-[420px] bg-white/5" />
        <div className="user-surface ui-skeleton h-[260px] bg-white/5" />
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
    <div className="user-page-shell min-h-screen w-full max-w-full space-y-5 px-3 py-4 sm:px-8 lg:space-y-8 lg:px-4 lg:py-6">
      {errorMessage ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black/20 p-3.5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:hidden">
        {heroBackdropUrl ? (
          <div
            className="pointer-events-none absolute inset-[-12%] scale-110 opacity-[0.56] blur-[78px]"
            style={{
              backgroundImage: `url(${heroBackdropUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              filter: "saturate(1.03) brightness(0.56) contrast(1.01)",
            }}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(29,185,84,0.14),transparent_30%),linear-gradient(160deg,rgba(10,12,12,0.58),rgba(4,4,5,0.84))]" />

        <div className="relative overflow-hidden rounded-[26px] bg-black/10 px-4 pb-4 pt-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-white/42">
            Nghệ sĩ
          </p>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="relative mx-auto w-full max-w-[min(56vw,224px)]">
              <div
                className="pointer-events-none absolute -inset-4 rounded-[34px] opacity-60 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 40% 30%, rgba(255,255,255,0.14), transparent 34%), radial-gradient(circle at 68% 70%, rgba(29,185,84,0.18), transparent 42%)",
                }}
              />
              <div className="relative aspect-square overflow-hidden rounded-[28px] bg-black/18 shadow-[0_26px_80px_rgba(0,0,0,0.38)]">
                {portraitUrl ? (
                  <OptimizedImage
                    src={portraitUrl}
                    alt={artist?.name || "Nghệ sĩ"}
                    className="h-full w-full object-cover object-center"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,#2f2f2f,#111)] text-6xl font-black text-white/35">
                    {(artist?.name || "A").trim().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 min-w-0">
              <h1 className="overflow-hidden px-2 pt-[0.04em] pb-[0.12em] text-[clamp(2rem,8vw,3.1rem)] font-semibold leading-[1.02] tracking-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                {artist?.name || "Nghệ sĩ"}
              </h1>
              {artist?.alias && artist.alias !== artist.name ? (
                <p className="mt-1 text-sm font-medium text-white/66">{artist.alias}</p>
              ) : null}
              {artistSummary ? (
                <p className="mt-3 text-sm leading-relaxed text-white/72 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]">
                  {artistSummary}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/72">
                {songs.length} bài hát
              </span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/72">
                {albums.length} album
              </span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-[11px] font-medium text-white/72">
                {formatTotalDuration(totalDuration)}
              </span>
            </div>
          </div>

          <div className={`mt-5 ${mobileCardShellClass}`}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {songs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => playSong(songs[0], songs)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[radial-gradient(circle_at_28%_24%,#9dfabd,#4ad67f_56%,#249956)] px-5 text-sm font-semibold text-[#062512] shadow-[0_0_34px_rgba(75,220,126,0.42)] transition active:scale-95"
                >
                  <FiPlay className="text-base" />
                  Phát tất cả
                </button>
              ) : (
                <div className={`${mobileSecondaryButtonClass} text-white/62`}>
                  <FiMusic />
                  Chưa có bài hát
                </div>
              )}

              <FollowArtistButton
                artist={artist}
                size="lg"
                className="inline-flex min-h-12 items-center justify-center border-white/15 bg-white/[0.08] text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
              />

              <ShareLinkButton
                path={sharePath}
                title="Chia sẻ nghệ sĩ"
                shareTitle={artist?.name || artist?.alias || "Nghệ sĩ"}
                shareText={`Khám phá ${artist?.name || artist?.alias || "nghệ sĩ này"} trên Khoaluan Music.`}
                preview={sharePreview}
                className="min-h-12 justify-center border-white/15 bg-white/[0.08] text-white shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {heroMetrics.map((item) => (
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

      <section className="user-surface relative hidden overflow-hidden p-5 sm:p-6 lg:block lg:p-8">
        {coverUrl ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          />
        ) : null}
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
            <div className="space-y-3 text-center xl:text-left">
              <p className="user-heading-label">Nghệ sĩ</p>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                {artist?.name || "Nghệ sĩ"}
              </h1>
              {artist?.alias && artist.alias !== artist.name ? (
                <p className="text-base text-white/65">{artist.alias}</p>
              ) : null}
              {artistSummary ? (
                <p className="mx-auto max-w-3xl text-sm leading-relaxed text-white/78 sm:text-[15px] xl:mx-0">
                  {artistSummary}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 xl:justify-start">
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

            <div className={heroActionGroupClass}>
              {songs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => playSong(songs[0], songs)}
                  className="user-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
                >
                  <FiPlay className="text-base" />
                  Phát tất cả
                </button>
              ) : null}
              <FollowArtistButton artist={artist} size="lg" />
              <ShareLinkButton
                path={sharePath}
                title="Chia sẻ nghệ sĩ"
                shareTitle={artist?.name || artist?.alias || "Nghệ sĩ"}
                shareText={`Khám phá ${artist?.name || artist?.alias || "nghệ sĩ này"} trên Khoaluan Music.`}
                preview={sharePreview}
                className="px-5 py-3"
              />
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

      <section className={mobileSectionClass}>
        <SectionHeader
          label="Danh mục"
          title="Bài hát của nghệ sĩ"
          description={
            hiddenSongCount > 0
              ? "Một vài ca khúc nổi bật được mở ra trước để bạn bắt nhịp nhanh hơn."
              : "Những ca khúc đang có mặt trong thư viện của nghệ sĩ."
          }
          countLabel={`${songs.length} bài hát`}
          headerActions={
            <>
              {songs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => playSong(songs[0], songs)}
                  className="user-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                >
                  <FiPlay />
                  Phát tất cả
                </button>
              ) : null}
              {songs.length > 0 ? (
                <Link
                  to={songsPath}
                  className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                >
                  Xem tất cả
                  <FiArrowRight />
                </Link>
              ) : null}
            </>
          }
        />

        {songs.length === 0 ? (
          <div className={`${mobileListShellClass} px-5 py-10 text-center text-sm text-white/60`}>
            Nghệ sĩ này chưa có ca khúc nào trong thư viện.
          </div>
        ) : (
          <div className={mobileListShellClass}>
            <div className="hidden grid-cols-[56px_minmax(0,2.4fr)_minmax(0,1.2fr)_88px_120px] items-center border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.3em] text-white/45 lg:grid">
              <span className="text-center">#</span>
              <span>Bài hát</span>
              <span>Album</span>
              <span className="text-center">Thời gian</span>
              <span className="text-right">Tác vụ</span>
            </div>

            <div className="divide-y divide-white/8">
              {previewSongs.map((song, index) => {
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

      <section className={mobileSectionClass}>
        <SectionHeader
          label="Album"
          title="Album của nghệ sĩ"
          description={
            hiddenAlbumCount > 0
              ? "Một vài album nổi bật được mở ra trước để bạn xem nhanh hơn."
              : "Những album đang có mặt trong thư viện của nghệ sĩ."
          }
          countLabel={`${albums.length} album`}
          headerActions={
            albums.length > 0 ? (
              <Link
                to={albumsPath}
                className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
              >
                Xem tất cả
                <FiArrowRight />
              </Link>
            ) : null
          }
        />

        {albums.length === 0 ? (
          <div className={`${mobileListShellClass} px-5 py-10 text-center text-sm text-white/60`}>
            Nghệ sĩ này chưa có album nào trong thư viện.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {previewAlbums.map((album) => (
              <AlbumCard key={album.id || album.title} album={album} variant="library" />
            ))}
          </div>
        )}
      </section>

      {(artist?.bio || artistInfoItems.length > 0) ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
          {artist?.bio ? (
            <section className={mobileSectionClass}>
              <div className="pointer-events-none absolute inset-0 bg-white/[0.02]" />
              <div className="relative">
                <p className="user-heading-label">Giới thiệu</p>
                <div
                  className="mt-4 whitespace-pre-line text-sm leading-7 text-white/78"
                  dangerouslySetInnerHTML={createBioMarkup(artist.bio)}
                />
              </div>
            </section>
          ) : null}

          {artistInfoItems.length > 0 ? (
            <section className={mobileSectionClass}>
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
