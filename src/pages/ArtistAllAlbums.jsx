import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiDisc, FiMusic, FiPlay, FiUser } from "react-icons/fi";
import AlbumCard from "../components/album/AlbumCard";
import OptimizedImage from "../components/common/OptimizedImage";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePageMetadata from "../hooks/usePageMetadata";
import usePlayerStore from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import {
  getArtistAlbumsPath,
  getArtistPath,
  getArtistSongsPath,
} from "../utils/entityPath";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
} from "../utils/seo";
import {
  fetchArtistDetailData,
  formatTotalDuration,
  stripHtml,
} from "./artistDetail.shared";

export default function ArtistAllAlbums() {
  useEnsureLikedSongsLoaded();

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const playSong = usePlayerStore((state) => state.playSong);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const nextData = await fetchArtistDetailData(id);
      setArtist(nextData.artist);
      setSongs(nextData.songs);
      setAlbums(nextData.albums);

      if (!nextData.artist && !nextData.albums.length) {
        setErrorMessage("Không tìm thấy danh sách album của nghệ sĩ.");
      }
    } catch (error) {
      console.error("Load artist albums failed", error);
      setArtist(null);
      setSongs([]);
      setAlbums([]);
      setErrorMessage("Không thể tải danh sách album của nghệ sĩ.");
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
  const artistPath = getArtistPath(artist || { id }) || `/artist/${id}`;
  const songsPath = getArtistSongsPath(artist || { id }) || `${artistPath}/songs`;
  const albumsPath = getArtistAlbumsPath(artist || { id }) || `${artistPath}/albums`;
  const artistAlbumsJsonLd = useMemo(
    () => [
      buildCollectionPageJsonLd({
        name: artist?.name ? `${artist.name} - Album` : "Album nghệ sĩ",
        description: artist?.name
          ? `${albums.length} album của ${artist.name} trên Khoaluan Music.`
          : "Danh sách album của nghệ sĩ trên Khoaluan Music.",
        url: albumsPath,
        image: portraitUrl || backdropUrl || "/logo-brand.png",
      }),
      buildBreadcrumbJsonLd([
        { name: "Trang chủ", url: "/" },
        { name: artist?.name || "Nghệ sĩ", url: artistPath },
        { name: "Album", url: albumsPath },
      ]),
    ],
    [albums.length, albumsPath, artist?.name, artistPath, backdropUrl, portraitUrl]
  );

  usePageMetadata({
    title: artist?.name ? `${artist.name} - Album` : "Album nghệ sĩ",
    description: artist?.name
      ? `${albums.length} album của ${artist.name} trên Khoaluan Music.`
      : "Danh sách album của nghệ sĩ trên Khoaluan Music.",
    image: portraitUrl || backdropUrl,
    url: albumsPath,
    type: "website",
    jsonLd: artistAlbumsJsonLd,
  });

  useEffect(() => {
    if (!artist || !albumsPath || location.pathname === albumsPath) return;
    navigate(albumsPath, { replace: true });
  }, [albumsPath, artist, location.pathname, navigate]);

  const panelClass =
    "relative overflow-hidden rounded-[28px] border border-white/10 bg-black/24 p-4 shadow-[0_20px_52px_rgba(0,0,0,0.32)] backdrop-blur-2xl sm:p-5 lg:p-6";

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="user-surface ui-skeleton h-[220px] bg-white/5" />
        <div className="user-surface ui-skeleton h-[420px] bg-white/5" />
      </div>
    );
  }

  if (!artist && !albums.length) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full px-4 py-6 sm:px-8">
        <div className="user-surface flex min-h-[260px] items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="user-heading-label">Album nghệ sĩ</p>
            <h1 className="text-2xl font-black text-white">Không tìm thấy dữ liệu</h1>
            <p className="text-sm text-white/60">
              {errorMessage || "Danh sách album hiện chưa sẵn sàng để hiển thị."}
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
              to={songsPath}
              className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
            >
              <FiMusic />
              Xem bài hát
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
                Toàn bộ album
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                {artist?.name || "Nghệ sĩ"}
              </h1>
              <p className="mt-2 text-sm font-medium text-white/68">
                {albums.length} album • {songs.length} bài hát • {formatTotalDuration(totalDuration)}
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
                <span className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/70">
                  <FiDisc className="mr-2 inline-block" />
                  {albums.length} album
                </span>
                {artist?.national ? (
                  <span className="rounded-full bg-white/[0.06] px-3 py-2 text-xs font-medium text-white/70">
                    <FiUser className="mr-2 inline-block" />
                    {artist.national}
                  </span>
                ) : null}
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
              Tất cả album
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-white/65">
              Toàn bộ album của nghệ sĩ được gom vào một nơi để bạn duyệt nhanh và chuyển sang nghe ngay.
            </p>
          </div>
          <span className="user-chip inline-flex items-center self-center rounded-full px-3 py-1 text-xs font-medium lg:self-auto">
            {albums.length} album
          </span>
        </div>

        {albums.length === 0 ? (
          <div className="mt-5 rounded-[24px] border border-white/10 bg-black/18 px-5 py-10 text-center text-sm text-white/60 backdrop-blur-xl lg:bg-[#121212]">
            Nghệ sĩ này chưa có album nào trong thư viện.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {albums.map((album) => (
              <AlbumCard key={album.id || album.title} album={album} variant="library" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
