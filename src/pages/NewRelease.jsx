import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getNewReleaseChart } from "../api/chart.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

const PAGE_SIZE = 20;

export default function NewRelease() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);

  const mergeSongs = (current, incoming) => {
    const map = new Map();

    for (const song of [...current, ...incoming]) {
      const id = String(song?.id || "");
      if (!id || map.has(id)) continue;
      map.set(id, song);
    }

    return Array.from(map.values());
  };

  const extractSongs = (response) => {
    const rawSongs =
      response?.data?.data?.songs ||
      response?.data?.data ||
      response?.data?.items ||
      response?.data ||
      [];

    return filterPlayableSongs(Array.isArray(rawSongs) ? rawSongs : []);
  };

  const loadChart = useCallback(async () => {
    try {
      setLoading(true);
      setPage(1);

      const res = await getNewReleaseChart({ page: 1, limit: PAGE_SIZE });
      const firstPageSongs = extractSongs(res);

      setSongs(firstPageSongs);
      setHasMore(firstPageSongs.length >= PAGE_SIZE);
    } catch (err) {
      console.error("Load new release chart failed", err);
      setSongs([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const res = await getNewReleaseChart({ page: nextPage, limit: PAGE_SIZE });
      const nextSongs = extractSongs(res);

      if (!nextSongs.length) {
        setHasMore(false);
        return;
      }

      setSongs((current) => {
        const merged = mergeSongs(current, nextSongs);
        if (merged.length === current.length) {
          setHasMore(false);
          return current;
        }
        return merged;
      });

      setPage(nextPage);
      if (nextSongs.length < PAGE_SIZE) setHasMore(false);
    } catch (err) {
      console.error("Load more new release songs failed", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loading, loadingMore, page]);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMore();
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
  }, [loadMore]);

  const statusText = useMemo(() => {
    if (loading) return "Đang tải dữ liệu...";
    if (loadingMore) return "Đang tải thêm bài hát...";
    if (!hasMore && songs.length) return "Đã tải toàn bộ bài hát mới.";
    return "Kéo xuống để tải thêm bài hát.";
  }, [hasMore, loading, loadingMore, songs.length]);

  return (
    <div className="user-page-shell min-h-screen px-4 py-6 sm:px-8">
      <div className="user-surface mb-6 p-6">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Bảng xếp hạng
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          BXH Nhạc Mới
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Những ca khúc phát hành gần đây. Kéo xuống cuối danh sách để tải
          thêm.
        </p>
      </div>

      <SongTable
        title="BXH Nhạc Mới"
        subtitle="Những ca khúc phát hành gần đây"
        songs={songs}
        loading={loading}
        onRefresh={loadChart}
      />

      <div
        ref={sentinelRef}
        className="user-surface mt-4 flex min-h-16 items-center justify-center px-4 text-xs text-white/60"
      >
        {statusText}
      </div>
    </div>
  );
}
