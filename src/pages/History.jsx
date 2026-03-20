import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiHeart, FiMusic, FiPause, FiPlay } from "react-icons/fi";
import { getMyHistory } from "../api/history.api";
import { getSongById } from "../api/song.api";
import AddToPlaylistButton from "../components/playlists/AddToPlaylistButton";
import ArtistNames from "../components/artist/ArtistNames";
import OptimizedImage from "../components/common/OptimizedImage";
import { SongDetailIconButton, SongDetailLink } from "../components/song/SongDetailLink";
import { useEnsureLikedSongsLoaded } from "../hooks/useEnsureLibraryState";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { resolveAssetUrl } from "../utils/asset";
import { fetchPlayableSong, hydrateSongArtists } from "../utils/song";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_LIMIT = 20;

const HISTORY_RANGE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "24h", label: "24 giờ" },
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
];

const getHistoryRangeWindowMs = (range) => {
  if (range === "24h") return 24 * 60 * 60 * 1000;
  if (range === "7d") return 7 * 24 * 60 * 60 * 1000;
  if (range === "30d") return 30 * 24 * 60 * 60 * 1000;
  return null;
};

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

  return {
    ...song,
    history_id: item?.id || item?.history_id || song?.history_id,
    listened_at: item?.listened_at || song?.listen_time || song?.listened_at,
    artist_name: song?.artist_name || artist?.name || song?.artist || "",
    artist_id: song?.artist_id || artist?.id || null,
    album_id: song?.album_id || album?.id || null,
    album_title: song?.album_title || album?.title || "",
    audio_url:
      song?.audio_url || (audioPath ? `${API_BASE_URL}${audioPath}` : null),
  };
};

const getHistorySongKey = (item) =>
  normalizeSongId(item) ||
  item?.song_id ||
  `${item?.title || "song"}-${item?.artist_id || item?.artist_name || ""}`;

const dedupeHistoryItems = (items) => {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    const key = getHistorySongKey(item);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });

  return result;
};

const normalizeHistoryMeta = (meta, page, itemCount) => {
  const resolvedLimit =
    meta?.limit || meta?.perPage || meta?.per_page || DEFAULT_LIMIT;

  const nextMeta = {
    ...(meta || {}),
    page: meta?.page || meta?.currentPage || meta?.pageNumber || page,
    limit: resolvedLimit,
    itemCount,
  };

  const hasExplicitPaging =
    nextMeta.totalPages ||
    typeof nextMeta.hasNext === "boolean" ||
    typeof nextMeta.has_next === "boolean" ||
    typeof nextMeta.has_more === "boolean";

  if (!hasExplicitPaging) {
    nextMeta.has_more = itemCount >= resolvedLimit;
  }

  return nextMeta;
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

const isWithinHistoryRange = (timestamp, range) => {
  if (!timestamp || range === "all") return true;

  const listenedAt = new Date(timestamp).getTime();
  if (!Number.isFinite(listenedAt)) return false;

  const diff = Date.now() - listenedAt;
  const windowMs = getHistoryRangeWindowMs(range);
  if (!windowMs) return true;

  return diff <= windowMs;
};

export default function History() {
  useEnsureLikedSongsLoaded();

  const [history, setHistory] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyRange, setHistoryRange] = useState("all");
  const sentinelRef = useRef(null);

  const { playSong, likedSongIds, toggleLike, currentSong, isPlaying } =
    usePlayerStore();

  const getHasMoreFromMeta = useCallback((nextMeta) => {
    if (!nextMeta) return false;

    const page = nextMeta.page || nextMeta.currentPage || nextMeta.pageNumber || 1;
    const totalPages = nextMeta.totalPages || nextMeta.total_pages;
    if (totalPages) return page < totalPages;

    if (typeof nextMeta.hasNext === "boolean") return nextMeta.hasNext;
    if (typeof nextMeta.has_next === "boolean") return nextMeta.has_next;
    if (typeof nextMeta.has_more === "boolean") return nextMeta.has_more;

    const total = nextMeta.total;
    const limit = nextMeta.limit || nextMeta.perPage || nextMeta.per_page;
    if (total && limit) return page * limit < total;

    const lastBatchSize = nextMeta.itemCount;
    if (typeof lastBatchSize === "number") {
      return lastBatchSize >= (limit || DEFAULT_LIMIT);
    }

    return false;
  }, []);

  const loadHistory = useCallback(async (page = 1, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const res = await getMyHistory({ page, limit: DEFAULT_LIMIT });
      const { items, meta: responseMeta } = extractHistoryPayload(res);
      const normalized = items.map(normalizeHistoryItem);
      const hydrated = await hydrateSongArtists(normalized, getSongById);
      const nextMeta = normalizeHistoryMeta(responseMeta, page, items.length);

      setHistory((prev) => {
        const combined = append ? [...prev, ...hydrated] : hydrated;
        return dedupeHistoryItems(combined);
      });
      setMeta(nextMeta);
    } catch (error) {
      console.error("Load listening history error", error);
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const filteredHistory = useMemo(
    () => history.filter((item) => isWithinHistoryRange(item?.listened_at, historyRange)),
    [history, historyRange]
  );

  const queue = useMemo(
    () => filteredHistory.map((item) => ({ ...item })),
    [filteredHistory]
  );

  const handlePlaySong = async (item, nextQueue = queue) => {
    const playable = (await fetchPlayableSong(item, getSongById)) || item;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = nextQueue.map((entry) => {
      const entryId = normalizeSongId(entry);
      return entryId && normalizedId === entryId
        ? { ...entry, ...playable }
        : entry;
    });

    playSong(playable, updatedQueue);
  };

  const serverHasMore = useMemo(
    () => getHasMoreFromMeta(meta),
    [getHasMoreFromMeta, meta]
  );
  const shouldUseInfiniteScroll = historyRange === "all";
  const reachedFilterBoundary = useMemo(() => {
    if (historyRange === "all" || !history.length) return false;

    const oldestLoadedItem = history[history.length - 1];
    const windowMs = getHistoryRangeWindowMs(historyRange);
    if (!windowMs) return false;

    const listenedAt = new Date(oldestLoadedItem?.listened_at).getTime();
    if (!Number.isFinite(listenedAt)) return false;

    return Date.now() - listenedAt > windowMs;
  }, [history, historyRange]);
  const hasMore = useMemo(() => {
    if (historyRange === "all") return serverHasMore;
    return serverHasMore && !reachedFilterBoundary;
  }, [historyRange, reachedFilterBoundary, serverHasMore]);

  const currentPage = useMemo(
    () => meta?.page || meta?.currentPage || meta?.pageNumber || 1,
    [meta]
  );

  const loadMoreHistory = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    loadHistory(currentPage + 1, true);
  }, [currentPage, hasMore, loadHistory, loading, loadingMore]);

  useEffect(() => {
    if (historyRange === "all" || loading || loadingMore || !hasMore) return;

    const timer = window.setTimeout(() => {
      loadMoreHistory();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [hasMore, historyRange, loadMoreHistory, loading, loadingMore]);

  useEffect(() => {
    if (!shouldUseInfiniteScroll) return undefined;

    const target = sentinelRef.current;
    if (!target) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMoreHistory();
        });
      },
      {
        root: null,
        rootMargin: "220px",
        threshold: 0.1,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMoreHistory, shouldUseInfiniteScroll]);

  const statusText = useMemo(() => {
    if (loading) return "Đang tải lịch sử...";
    if (!shouldUseInfiniteScroll) {
      if (loadingMore) {
        return "Đang tải thêm lịch sử để mở rộng kết quả đã lọc...";
      }
      if (hasMore) {
        return `Đã tìm thấy ${filteredHistory.length} mục. Đang tiếp tục tải thêm kết quả phù hợp...`;
      }
      if (reachedFilterBoundary) {
        return `Đã tải xong toàn bộ ${filteredHistory.length} mục thỏa mốc thời gian hiện tại.`;
      }
      return `Đang hiển thị đầy đủ ${filteredHistory.length} mục theo mốc thời gian đã chọn.`;
    }
    if (loadingMore) return "Đang tải thêm bài đã nghe...";
    if (!hasMore && history.length) return "Bạn đã xem hết lịch sử nghe gần đây.";
    return "Kéo xuống để tải thêm mục nghe gần đây.";
  }, [
    filteredHistory.length,
    hasMore,
    history.length,
    loading,
    loadingMore,
    reachedFilterBoundary,
    shouldUseInfiniteScroll,
  ]);

  const hasFilters = historyRange !== "all";
  const filteredSummary = hasFilters
    ? `Đang hiển thị ${filteredHistory.length} mục theo mốc thời gian đã chọn.`
    : "Chọn mốc thời gian để xem lại các bài hát bạn đã nghe gần đây.";

  const playFilteredHistory = async () => {
    const firstItem = filteredHistory[0];
    if (!firstItem) return;
    await handlePlaySong(firstItem, queue);
  };

  if (loading) {
    return (
      <div className="user-page-shell min-h-screen px-4 py-6 sm:px-8">
        <div className="user-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="space-y-4">
            <div className="ui-skeleton-line h-3 w-28" />
            <div className="ui-skeleton-line h-8 w-48 rounded-lg" />
            <div className="grid gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`history-skeleton-${index}`}
                  className="ui-skeleton h-16 rounded-2xl border border-white/10"
                />
              ))}
            </div>
          </div>
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
          <h1 className="mt-1 text-2xl font-bold text-white">Nghe gần đây</h1>
          <div className="mt-2 text-sm text-white/60">
            Bạn chưa nghe bài hát nào.
          </div>
        </div>
      </div>
    );
  }

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
            onClick={() => loadHistory(1, false)}
            className="user-btn-secondary px-4 py-2 text-xs font-semibold"
          >
            Làm mới
          </button>
        </div>
      </div>

      <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">
              Lọc theo thời gian
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {filteredSummary}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={playFilteredHistory}
              disabled={!filteredHistory.length}
              className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiPlay />
              Phát danh sách
            </button>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => setHistoryRange("all")}
                className="user-btn-secondary px-4 py-2 text-sm font-semibold"
              >
                Xóa bộ lọc
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {HISTORY_RANGE_OPTIONS.map((option) => {
            const isActive = historyRange === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setHistoryRange(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-emerald-400/16 text-emerald-100 ring-1 ring-inset ring-emerald-300/30"
                    : "bg-white/[0.05] text-white/65 ring-1 ring-inset ring-white/10 md:hover:bg-white/[0.08] md:hover:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

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
            {filteredHistory.map((item) => {
              const isPlayingCurrent =
                normalizeSongId(currentSong) === normalizeSongId(item);
              const normalizedItemId = normalizeSongId(item);
              const isLiked = normalizedItemId && likedSongIds.includes(normalizedItemId);

              return (
                <div
                  key={getHistorySongKey(item)}
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
                        onClick={() => handlePlaySong(item, queue)}
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
                      <SongDetailLink
                        song={item}
                        className={`truncate font-medium transition md:hover:text-emerald-300 ${
                          isPlayingCurrent ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {item.title}
                      </SongDetailLink>
                      <div className="truncate text-xs text-white/60">
                        <ArtistNames
                          item={item}
                          stopPropagation
                          fallback="Nghệ sĩ"
                          linkClassName="inline-block transition md:hover:text-emerald-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="hidden truncate text-xs text-white/70 xl:block">
                    {item.album_title || "-"}
                  </div>

                  <div className="hidden items-center justify-end gap-4 text-xs text-white/70 xl:flex">
                    <AddToPlaylistButton
                      song={item}
                      triggerClassName="h-9 w-9 !border-white/20 !bg-white/5 md:hover:!bg-white/15"
                    />
                    <SongDetailIconButton song={item} className="h-9 w-9 border-white/20" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (normalizedItemId) toggleLike(normalizedItemId);
                      }}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-red-400/60 bg-red-400/10 text-red-400 scale-105"
                          : "border-white/20 text-white/60 md:hover:border-white/40 md:hover:text-white"
                      }`}
                    >
                      <FiHeart className="text-[16px]" />
                    </button>
                    <span className="tabular-nums">{formatDuration(item.duration)}</span>
                  </div>

                  <div className="hidden text-right text-xs text-white/60 xl:block">
                    {formatRelativeTime(item.listened_at)}
                  </div>

                  <div className="grid w-[190px] grid-cols-[repeat(3,32px)_minmax(80px,1fr)] items-center justify-items-end gap-2 text-right xl:hidden">
                    <AddToPlaylistButton
                      song={item}
                      triggerClassName="h-8 w-8 !border-white/20 !bg-white/5 md:hover:!bg-white/15"
                    />
                    <SongDetailIconButton song={item} />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (normalizedItemId) toggleLike(normalizedItemId);
                      }}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 ${
                        isLiked
                          ? "border-red-400/60 bg-red-400/10 text-red-400 scale-105"
                          : "border-white/20 text-white/60 md:hover:border-white/40 md:hover:text-white"
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

      {filteredHistory.length ? null : (
        <div className="user-surface px-5 py-8 text-center text-sm text-white/60">
          Không có mục nào khớp mốc thời gian hiện tại.
        </div>
      )}

      {shouldUseInfiniteScroll ? (
        <div
          ref={sentinelRef}
          className="user-surface flex min-h-16 items-center justify-center px-4 text-center text-xs text-white/60"
        >
          {statusText}
        </div>
      ) : (
        <div className="user-surface flex min-h-16 items-center justify-center px-4 text-center text-xs text-white/60">
          {statusText}
        </div>
      )}
    </div>
  );
}

