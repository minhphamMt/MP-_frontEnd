import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyHistory } from "../api/history.api";
import { getSongById } from "../api/song.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { fetchPlayableSong } from "../utils/song";
import { FiHeart,FiPlus  } from "react-icons/fi";

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
  const artistName = song?.artist_name || artist?.name || song?.artist;

  return {
    ...song,
    history_id: item?.id || item?.history_id || song?.history_id,
    listened_at: item?.listened_at || song?.listen_time || song?.listened_at,
    artist_name: artistName,
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
      <div className="min-h-screen bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          Đang tải lịch sử...
        </div>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] p-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <h1 className="text-2xl font-bold text-white">Nghe gần đây</h1>
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
    <div className="min-h-screen space-y-6 bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/50">
            Thói quen
          </p>
          <h1 className="text-3xl font-bold text-white">Nghe gần đây</h1>
        </div>
        <button
          onClick={loadHistory}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:shadow-cyan-300/50"
        >
          Làm mới
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
<div className="grid grid-cols-[3fr_2fr_2fr_1fr_40px_1fr] gap-3 bg-white/5 px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-white/60">
  <div>Bài hát</div>
  <div>Album</div>
  <div>Nghệ sĩ</div>
  <div>Thời gian</div>
  <div>Thích</div>
  <div className="text-right">Nghe</div>
</div>


        <div className="divide-y divide-white/5">
          {history.map((item) => (
            <button
              type="button"
              key={`${item.history_id || item.id}-${item.listened_at}`}
              onClick={() => handlePlaySong(item)}
              className="grid w-full grid-cols-[3fr_2fr_2fr_1fr_40px_1fr] items-center gap-3 px-5 py-3 text-left transition hover:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl shadow-md shadow-black/30">
                  <img
                    src={item.cover_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {item.title}
                  </div>
                  {item.album_title && (
                    <div className="truncate text-[11px] text-white/60">
                      {item.album_title}
                    </div>
                  )}
                </div>
              </div>

              <div className="truncate text-sm text-white/80">
                {item.album_title}
              </div>

              <div className="truncate text-sm text-white/80">
                {item.artist_name}
              </div>

              <div className="text-sm text-white/70">
                {formatDuration(item.duration)}
              </div>
                  {/* LIKE BUTTON */}
<div className="flex justify-center">
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      const songId = normalizeSongId(item);
      songId && toggleLike(songId);
    }}
    className={`flex h-9 w-9 items-center justify-center rounded-full
    border transition-all duration-200
    ${
      likedSongIds.includes(normalizeSongId(item))
        ? "border-red-400/60 text-red-400 bg-red-400/10 scale-105"
        : "border-white/20 text-white/60 hover:text-white hover:border-white/40"
    }`}
  >
    <FiHeart className="text-[16px]" />
  </button>
</div>

              <div className="text-right text-sm text-white/60">
                {formatRelativeTime(item.listened_at)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => loadHistory(currentPage + 1, true)}
            disabled={loadingMore}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
          >
            {loadingMore ? "Đang tải thêm..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
}
