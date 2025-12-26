import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyHistory } from "../api/history.api";
import usePlayerStore from "../store/player.store";

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

  const playSong = usePlayerStore((s) => s.playSong);

  const loadHistory = useCallback(
    async (page = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

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
        if (append) {
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
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

  if (loading) {
    return <div className="text-sm text-white/60">Đang tải lịch sử...</div>;
  }

  if (!history.length) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Nghe gần đây</h1>
        <div className="text-sm text-white/60">Bạn chưa nghe bài hát nào.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nghe gần đây</h1>
        <button
          onClick={loadHistory}
          className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/15"
        >
          Làm mới
        </button>
      </div>

      <div className="rounded-lg border border-white/5 bg-white/5">
        <div className="grid grid-cols-[3fr,2fr,2fr,1fr,1fr] gap-3 px-4 py-2 text-xs uppercase tracking-wide text-white/60">
          <div>Bài hát</div>
          <div>Album</div>
          <div>Nghệ sĩ</div>
          <div>Thời gian</div>
          <div className="text-right">Nghe</div>
        </div>

        <div className="divide-y divide-white/5">
          {history.map((item) => (
            <button
              type="button"
              key={`${item.history_id || item.id}-${item.listened_at}`}
              onClick={() => playSong(item, queue)}
              className="grid w-full grid-cols-[3fr,2fr,2fr,1fr,1fr] items-center gap-3 px-4 py-3 text-left hover:bg-white/10"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={item.cover_url}
                  alt=""
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{item.title}</div>
                  {item.album_title ? (
                    <div className="text-[11px] text-white/60 truncate">
                      {item.album_title}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="text-sm text-white/80 truncate">{item.album_title}</div>

              <div className="text-sm text-white/80 truncate">{item.artist_name}</div>

              <div className="text-sm text-white/70">
                {formatDuration(item.duration)}
              </div>

              <div className="text-sm text-white/60 text-right">
                {formatRelativeTime(item.listened_at)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => loadHistory(currentPage + 1, true)}
            disabled={loadingMore}
            className="text-xs px-4 py-2 rounded bg-white/10 hover:bg-white/15 disabled:opacity-50"
          >
            {loadingMore ? "Đang tải thêm..." : "Tải thêm"}
          </button>
        </div>
      ) : null}
    </div>
  );
}