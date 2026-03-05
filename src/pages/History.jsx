import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyHistory } from "../api/history.api";
import { getSongById } from "../api/song.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { fetchPlayableSong } from "../utils/song";
import { getArtistLabel, getPrimaryArtistId, normalizeArtists } from "../utils/artist";
import { FiHeart, FiMusic, FiPause, FiPlay } from "react-icons/fi";
import { resolveAssetUrl } from "../utils/asset";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import OptimizedImage from "../components/common/OptimizedImage";
import ArtistNames from "../components/artist/ArtistNames";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_LIMIT = 20;

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";
  const listenedDate = new Date(timestamp);
  const diffMs = Date.now() - listenedDate.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Vừa nghe";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
};

const extractHistoryPayload = (res) => {
  const topLevel = res?.data ?? {};
  const payload = topLevel?.data ?? topLevel;

  const items = Array.isArray(payload)
    ? payload
    : payload?.items ?? topLevel?.items ?? [];

  const meta = payload?.meta ?? topLevel?.meta ?? null;

  return { items, meta };
};

const normalizeHistoryItem = (item) => {
  const song = item?.song || item;
  const artist = song?.artist || {};
  const album = song?.album || {};

  const audioPath = song?.audio_path || song?.audioPath;
  const artists = normalizeArtists(song);
  const artistName = getArtistLabel(song, artist?.name || song?.artist || "");
  const artistId = getPrimaryArtistId(song);

  return {
    ...song,
    history_id: item?.id || item?.history_id || song?.history_id,
    listened_at: item?.listened_at || song?.listen_time || song?.listened_at,
    artist_name: artistName,
    artists,
    artist_id: artistId,
    album_id: song?.album_id || album?.id,
    album_title: song?.album_title || album?.title,
    audio_url:
      song?.audio_url || (audioPath ? `${API_BASE_URL}${audioPath}` : null),
  };
};

const dedupeHistoryItems = (items) => {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    const key =
      item?.song_id ||
      item?.id ||
      item?.history_id ||
      `${item?.title}-${item?.artist_name || item?.artist}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });

  return result;
};

const formatDuration = (durationInSeconds) => {
  if (!durationInSeconds && durationInSeconds !== 0) return "";

  const minutes = Math.floor(durationInSeconds / 60)
    .toString()
    .padStart(1, "0");
  const seconds = Math.floor(durationInSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const {
    playSong,
    likedSongIds,
    toggleLike,
    currentSong,
    isPlaying,
  } = usePlayerStore();


  /* =======================
     LOAD HISTORY (GIỮ NGUYÊN)
     ======================= */
  const loadHistory = useCallback(
    async (page = 1, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await getMyHistory({ page, limit: DEFAULT_LIMIT });
        const { items, meta: resMeta } = extractHistoryPayload(res);
        const normalized = items.map(normalizeHistoryItem);

        setHistory((prev) => {
          const combined = append ? [...prev, ...normalized] : normalized;
          return dedupeHistoryItems(combined);
        });
        setMeta(resMeta || { page, limit: DEFAULT_LIMIT });
      } catch (err) {
        console.error("Load listening history error", err);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const queue = useMemo(
    () => history.map((item) => ({ ...item })),
    [history]
  );

  const handlePlaySong = async (item) => {
    const playable = (await fetchPlayableSong(item, getSongById)) || item;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = queue.map((entry) => {
      const entryId = normalizeSongId(entry);
      return entryId && normalizedId === entryId
        ? { ...entry, ...playable }
        : entry;
    });

    playSong(playable, updatedQueue);
  };

  const hasMore = useMemo(() => {
    if (!meta) return false;

    const page = meta.page || meta.currentPage || meta.pageNumber || 1;
    const totalPages = meta.totalPages || meta.total_pages;
    if (totalPages) return page < totalPages;

    if (typeof meta.hasNext === "boolean") return meta.hasNext;
    if (typeof meta.has_next === "boolean") return meta.has_next;
    if (typeof meta.has_more === "boolean") return meta.has_more;

    const total = meta.total;
    const limit = meta.limit || meta.perPage || meta.per_page;
    if (total && limit) return history.length < total;

    return false;
  }, [history.length, meta]);

  const currentPage = useMemo(
    () => meta?.page || meta?.currentPage || meta?.pageNumber || 1,
    [meta]
  );

  /* =======================
     LOADING / EMPTY
     ======================= */
  if (loading) {
    return (
        <div className="user-page-shell min-h-screen px-4 py-6 sm:px-8">
        <div className="user-surface p-6 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          Đang tải lịch sử...
        </div>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="user-page-shell min-h-screen px-4 py-6 sm:px-8">
        <div className="user-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
            Thói quen
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Nghe gần đây
          </h1>
          <div className="mt-2 text-sm text-white/60">
            Bạn chưa nghe bài hát nào.
          </div>
        </div>
      </div>
    );
  }

  /* =======================
     UI
     ======================= */
  return (
    <div className="user-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="user-surface p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
              Thói quen
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              Nghe gần đây
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Lịch sử phát gần đây của bạn.
            </p>
          </div>
          <button
            onClick={loadHistory}
            className="user-btn-secondary px-4 py-2 text-xs font-semibold"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="user-surface overflow-x-auto shadow-[0_30px_90px_rgba(0,0,0,0.55)] scrollbar-muted">
        <div className="min-w-0 xl:min-w-[720px]">
          <div className="hidden grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] border-b border-white/10 px-4 py-3 text-[11px] uppercase tracking-[0.35em] text-white/50 xl:grid">
            <span />
            <span>Bài hát</span>
            <span>Album</span>
            <span className="text-right">Thời gian</span>
            <span className="text-right">Nghe</span>
          </div>

          <div className="divide-y divide-white/5">
            {history.map((item) => {
              const isPlayingCurrent =
                normalizeSongId(currentSong) === normalizeSongId(item);

              return (
                <div
                  key={`${item.history_id || item.id}-${item.listened_at}`}
                  className={`group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 text-sm transition xl:grid-cols-[32px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] ${
                    isPlayingCurrent ? "bg-emerald-400/10" : "md:hover:bg-white/5"
                  }`}
                >
                   <div className="hidden justify-center xl:flex">
                    <FiMusic
                      className={`transition ${
                        isPlayingCurrent
                          ? "text-emerald-400"
                          : "text-white/40 md:group-hover:text-white"
                      }`}
                    />
                  </div>
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md">
                      <OptimizedImage
                        src={resolveAssetUrl(item.cover_url)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={() => handlePlaySong(item)}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition md:group-hover:opacity-100"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1db954] text-black shadow-[0_8px_16px_rgba(29,185,84,0.35)]">
                          {isPlayingCurrent && isPlaying ? (
                            <FiPause className="text-sm" />
                          ) : (
                            <FiPlay className="ml-0.5 text-sm" />
                          )}
                        </span>
                      </button>
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`truncate font-medium ${
                          isPlayingCurrent ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="truncate text-xs text-white/60">
                        <ArtistNames
                          item={item}
                          stopPropagation
                          fallback="Nghệ sĩ"
                          linkClassName="inline-block transition md:hover:text-emerald-300 md:hover:underline"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden truncate text-xs text-white/70 xl:block">
                    {item.album_title || "—"}
                  </div>

                  <div className="hidden items-center justify-end gap-4 text-xs text-white/70 xl:flex">
                    <AddToPlaylistButton
                      song={item}
                      triggerClassName="h-9 w-9 !border-white/20 !bg-white/5 md:hover:!bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const songId = normalizeSongId(item);
                        songId && toggleLike(songId);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        likedSongIds.includes(normalizeSongId(item))
                          ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                          : "border-white/20 text-white/60 md:hover:text-white md:hover:border-white/40"
                      }`}
                    >
                      <FiHeart className="text-[16px]" />
                    </button>
                    <span className="tabular-nums">
                      {formatDuration(item.duration)}
                    </span>
                  </div>

                  <div className="hidden text-right text-xs text-white/60 xl:block">
                    {formatRelativeTime(item.listened_at)}
                  </div>

                  <div className="grid w-[150px] grid-cols-[repeat(2,32px)_minmax(80px,1fr)] items-center justify-items-end gap-2 text-right xl:hidden">
                    <AddToPlaylistButton
                      song={item}
                      triggerClassName="h-8 w-8 !border-white/20 !bg-white/5 md:hover:!bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const songId = normalizeSongId(item);
                        songId && toggleLike(songId);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                        likedSongIds.includes(normalizeSongId(item))
                          ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
                          : "border-white/20 text-white/60 md:hover:text-white md:hover:border-white/40"
                      }`}
                    >
                      <FiHeart className="text-[14px]" />
                    </button>
                    <span className="truncate text-[11px] text-white/60">
                      {formatRelativeTime(item.listened_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => loadHistory(currentPage + 1, true)}
            disabled={loadingMore}
            className="user-btn-secondary px-5 py-2 text-xs font-semibold disabled:opacity-50"
          >
            {loadingMore ? "Đang tải thêm..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
