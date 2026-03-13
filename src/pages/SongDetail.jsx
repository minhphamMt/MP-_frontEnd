import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiBarChart2,
  FiClock,
  FiDisc,
  FiHeart,
  FiMusic,
  FiPause,
  FiPlay,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import { getSongById } from "../api/song.api";
import ArtistNames from "../components/artist/ArtistNames";
import OptimizedImage from "../components/common/OptimizedImage";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import { formatDateDisplay } from "../utils/date";
import {
  fetchPlayableSong,
  formatDuration,
  toPlayableSong,
} from "../utils/song";

const formatCount = (value) => {
  const next = Number(value);
  if (!Number.isFinite(next) || next <= 0) return "Đang cập nhật";
  return new Intl.NumberFormat("vi-VN").format(next);
};

const formatReleaseDate = (value) => {
  if (!value) return "Đang cập nhật";
  try {
    return formatDateDisplay(value);
  } catch {
    return "Đang cập nhật";
  }
};

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

export default function SongDetail() {
  useEnsureLikedSongsLoaded();

  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
      setSong(payload ? { ...payload, ...toPlayableSong(payload) } : null);
      setErrorMessage("");
    } catch (err) {
      console.error("Load song detail error", err);
      setSong(null);
      setErrorMessage("Không thể tải thông tin bài hát.");
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

    const playable = song.audio_url ? song : await fetchPlayableSong(song, getSongById);
    if (playable?.audio_url) {
      const mergedSong = { ...song, ...playable };
      setSong(mergedSong);
      playSong(mergedSong, [mergedSong]);
    }
  };

  const songId = normalizeSongId(song);
  const isActive = normalizeSongId(currentSong) === songId;
  const isLiked = songId && likedSongIds.includes(songId);
  const albumId = song?.album_id || song?.album?.id || null;

  const releaseDateText = useMemo(
    () =>
      formatReleaseDate(
        song?.release_date || song?.releaseDate || song?.published_at || song?.created_at || ""
      ),
    [song]
  );

  const summaryCards = useMemo(
    () => [
      { icon: FiClock, label: "Thời lượng", value: song ? formatDuration(song.duration) : "0:00" },
      { icon: FiDisc, label: "Album", value: song?.album_title || "Single" },
      {
        icon: FiUser,
        label: "Nghệ sĩ",
        value:
          Array.isArray(song?.artists) && song.artists.length > 1
            ? `${song.artists.length} nghệ sĩ`
            : "1 nghệ sĩ",
      },
      { icon: FiBarChart2, label: "Lượt nghe", value: formatCount(song?.play_count) },
    ],
    [song]
  );

  const infoItems = useMemo(
    () => [
      { label: "Tiêu đề", value: song?.title || "Đang cập nhật" },
      { label: "Album", value: song?.album_title || "Single" },
      { label: "Thời lượng", value: song ? formatDuration(song.duration) : "0:00" },
      { label: "Ngày phát hành", value: releaseDateText },
      { label: "Lượt nghe", value: formatCount(song?.play_count) },
    ],
    [releaseDateText, song]
  );

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 px-4 py-6 sm:px-8">
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
          <div className="user-surface h-[320px] animate-pulse bg-white/5" />
          <div className="user-surface h-[320px] animate-pulse bg-white/5" />
        </div>
        <div className="user-surface h-[280px] animate-pulse bg-white/5" />
        <div className="user-surface h-[220px] animate-pulse bg-white/5" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="user-page-shell min-h-screen w-full max-w-full px-4 py-6 sm:px-8">
        <div className="user-surface flex min-h-[260px] items-center justify-center p-6 text-center">
          <div className="space-y-3">
            <p className="user-heading-label">Bài hát</p>
            <h1 className="text-2xl font-black text-white">Không tìm thấy bài hát</h1>
            <p className="text-sm text-white/60">
              {errorMessage || "Bài hát này hiện chưa sẵn sàng trong thư viện."}
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
        {song.cover_url && (
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${resolveAssetUrl(song.cover_url)})`,
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
              {song.cover_url ? (
                <OptimizedImage
                  src={resolveAssetUrl(song.cover_url)}
                  alt={song.title}
                  className="aspect-square h-full w-full object-cover object-center"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-white/5 text-6xl font-black text-white/35">
                  <FiMusic />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="space-y-3">
              <p className="user-heading-label">Bài hát</p>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl xl:text-5xl">
                {song.title}
              </h1>
              <div className="text-sm text-white/78 sm:text-[15px]">
                <ArtistNames
                  item={song}
                  stopPropagation
                  className="truncate"
                  linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                  fallback="Đang cập nhật nghệ sĩ"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {song.album_title || "Single"}
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {formatDuration(song.duration)}
              </span>
              <span className="user-chip rounded-full px-3 py-1.5 text-xs font-medium">
                {releaseDateText}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePlay}
                className="user-btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold"
              >
                {isActive && isPlaying ? <FiPause className="text-base" /> : <FiPlay className="text-base" />}
                {isActive && isPlaying ? "Tạm dừng" : "Phát ngay"}
              </button>

              <AddToPlaylistButton
                song={song}
                variant="text"
                triggerLabel={
                  <span className="flex items-center gap-2 font-semibold">
                    <FiPlus />
                    <span>Thêm vào playlist</span>
                  </span>
                }
                triggerClassName="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/80 transition md:hover:bg-white/10"
              />

              <button
                type="button"
                onClick={() => {
                  if (songId) toggleLike(songId);
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  isLiked
                    ? "border-rose-400/60 bg-rose-500/18 text-rose-100"
                    : "border-white/15 bg-white/5 text-white/80 md:hover:bg-white/10"
                }`}
              >
                <FiHeart className={isLiked ? "text-rose-300" : ""} />
                {isLiked ? "Đã thích" : "Yêu thích"}
              </button>
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
          label="Thông tin"
          title="Chi tiết bài hát"
          description="Một vài thông tin nổi bật để bạn cảm được bài hát rõ hơn."
        />

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            {infoItems.map((item) => (
              <article key={item.label} className="user-soft-card px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">{item.label}</p>
                <p className="mt-3 text-sm font-semibold text-white sm:text-[15px]">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <article className="user-soft-card p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Thuộc album</p>
              <h3 className="mt-3 text-xl font-bold text-white">{song.album_title || "Single độc lập"}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {albumId
                  ? "Ca khúc này nằm trong một album, mở ra là bạn có thể nghe trọn vẹn cùng những bài còn lại."
                  : "Ca khúc này đang được phát hành như một bản single riêng."}
              </p>
              {albumId && (
                <button
                  type="button"
                  onClick={() => navigate(`/album/${albumId}`)}
                  className="user-btn-secondary mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold"
                >
                  <FiDisc />
                  Mở trang album
                </button>
              )}
            </article>

            <article className="user-soft-card p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">Nghệ sĩ thể hiện</p>
              <div className="mt-3 text-sm leading-relaxed text-white/80">
                <ArtistNames
                  item={song}
                  stopPropagation
                  className="text-white"
                  linkClassName="font-medium transition md:hover:text-emerald-300 md:hover:underline"
                  fallback="Đang cập nhật nghệ sĩ"
                />
              </div>
              <p className="mt-2 text-sm text-white/55">
                Mở trang nghệ sĩ để nghe thêm những ca khúc và album liên quan.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
