import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyHistory } from "../api/history.api";
import { getSongById } from "../api/song.api";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { fetchPlayableSong } from "../utils/song";

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

  const handlePlaySong = async (item) => {
    const playable = (await fetchPlayableSong(item, getSongById)) || item;
    if (!playable?.audio_url) return;

    const normalizedId = normalizeSongId(playable);
    const updatedQueue = queue.map((entry) => {
      const entryId = normalizeSongId(entry);
      return entryId && normalizedId === entryId ? { ...entry, ...playable } : entry;
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        Đang tải lịch sử...
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <h1 className="text-2xl font-bold">Nghe gần đây</h1>
        <div className="text-sm text-white/60">Bạn chưa nghe bài hát nào.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Thói quen</p>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">Nghe gần đây</h1>
        </div>
        <button
          onClick={loadHistory}
          className="rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-cyan-400/30 transition hover:shadow-cyan-300/50"
        >
          Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-[3fr,2fr,2fr,1fr,1fr] gap-3 px-5 py-3 text-[11px] uppercase tracking-[0.16em] text-white/60">
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
              onClick={() => handlePlaySong(item)}
              className="grid w-full grid-cols-[3fr,2fr,2fr,1fr,1fr] items-center gap-3 px-5 py-3 text-left transition hover:bg-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl">
                  <img
                    src={item.cover_url}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 transition hover:opacity-100" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{item.title}</div>
                  {item.album_title ? (
                    <div className="truncate text-[11px] text-white/60">{item.album_title}</div>
                  ) : null}
                </div>
              </div>

              <div className="truncate text-sm text-white/80">{item.album_title}</div>

              <div className="truncate text-sm text-white/80">{item.artist_name}</div>

              <div className="text-sm text-white/70">{formatDuration(item.duration)}</div>

              <div className="text-right text-sm text-white/60">
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
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 disabled:opacity-50"
          >
            {loadingMore ? "Đang tải thêm..." : "Tải thêm"}
          </button>
        </div>
      ) : null}
    </div>
  );
}