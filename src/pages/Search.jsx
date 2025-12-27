import { useCallback, useEffect, useMemo, useState } from "react";
import { FiClock, FiDisc, FiMusic, FiUser } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { getSearchHistory, searchEntities } from "../api/search.api";

const DEFAULT_LIMIT = 12;

const extractPayload = (res) => {
  const topLevel = res?.data ?? {};
  const payload = topLevel?.data ?? topLevel;

  const items = Array.isArray(payload)
    ? payload
    : payload?.items ?? topLevel?.items ?? [];

  const meta = payload?.meta ?? topLevel?.meta ?? null;

  return { items, meta };
};

const hasMorePages = (meta, currentLength) => {
  if (!meta) return false;

  const page = meta.page || meta.currentPage || meta.pageNumber || 1;
  const totalPages = meta.totalPages || meta.total_pages;
  if (totalPages) return page < totalPages;

  if (typeof meta.hasNext === "boolean") return meta.hasNext;
  if (typeof meta.has_next === "boolean") return meta.has_next;
  if (typeof meta.has_more === "boolean") return meta.has_more;

  const total = meta.total;
  const limit = meta.limit || meta.perPage || meta.per_page;
  if (total && limit) return currentLength < total;

  return false;
};

const HighlightedText = ({ html }) => (
  <span
    className="[&_em]:text-cyan-300"
    dangerouslySetInnerHTML={{ __html: html || "" }}
  />
);

const ResultItem = ({ item }) => {
  const typeIcon = {
    song: <FiMusic className="text-cyan-300" />,
    artist: <FiUser className="text-violet-300" />,
    album: <FiDisc className="text-emerald-300" />,
  }[item.type];

  const highlightName =
    item.highlight?.display_name || item.display_name || item.title || "";
  const highlightArtist = item.highlight?.artist_name || item.artist_name;
  const highlightAlbum = item.highlight?.album_title || item.album_title;

  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition hover:-translate-y-[1px] hover:border-white/10">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
        {typeIcon || <FiMusic />}
      </div>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
          <span>{item.type}</span>
          {item.relevance >= 3 && (
            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
              Chính xác
            </span>
          )}
        </div>

        <div className="text-lg font-semibold leading-tight text-white">
          <HighlightedText html={highlightName} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
          {highlightArtist && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
              <FiUser className="text-cyan-300" />
              <HighlightedText html={highlightArtist} />
            </span>
          )}

          {highlightAlbum && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
              <FiDisc className="text-emerald-300" />
              <HighlightedText html={highlightAlbum} />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-white/50">
          {item.zing_song_id && <span>ID bài hát: {item.zing_song_id}</span>}
          {item.zing_artist_id && <span>ID nghệ sĩ: {item.zing_artist_id}</span>}
          {item.zing_album_id && <span>ID album: {item.zing_album_id}</span>}
        </div>
      </div>
    </div>
  );
};

const HistoryItem = ({ keyword, createdAt }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/80">
    <FiClock className="text-cyan-300" />
    <span className="flex-1">{keyword}</span>
    {createdAt && (
      <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
        {new Date(createdAt).toLocaleDateString("vi-VN")}
      </span>
    )}
  </div>
);

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeKeyword = useMemo(
    () => searchParams.get("q") || searchParams.get("keyword") || "",
    [searchParams]
  );

  const [keywordInput, setKeywordInput] = useState(activeKeyword);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const loadResults = useCallback(
    async (page = 1, append = false) => {
      const term = activeKeyword.trim();
      if (!term) {
        setResults([]);
        setMeta(null);
        return;
      }

      setLoading(true);

      try {
        const res = await searchEntities({ keyword: term, page, limit: DEFAULT_LIMIT });
        const { items, meta: resMeta } = extractPayload(res);

        setResults((prev) => (append ? [...prev, ...items] : items));
        setMeta(resMeta ? { ...resMeta, page } : { page, limit: DEFAULT_LIMIT });
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    },
    [activeKeyword]
  );

  const loadHistory = useCallback(async () => {
    try {
      const res = await getSearchHistory({ limit: 10 });
      const { items } = extractPayload(res);
      setHistory(items || []);
      setHistoryError("");
    } catch (err) {
      console.error("Search history error", err);
      setHistoryError("Không thể tải lịch sử tìm kiếm.");
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    setKeywordInput(activeKeyword);
    if (activeKeyword.trim()) {
      loadResults();
    } else {
      setResults([]);
      setMeta(null);
    }
  }, [activeKeyword, loadResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = keywordInput.trim();
    setSearchParams(trimmed ? { keyword: trimmed } : {});
  };

  const hasMore = hasMorePages(meta, results.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Khám phá</p>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">Tìm kiếm</h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-xl"
          role="search"
          aria-label="Tìm kiếm bài hát, nghệ sĩ hoặc album"
        >
          <FiMusic
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/80"
            size={18}
          />
          <input
            type="search"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Nhập từ khóa để tìm kiếm..."
            className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] outline-none ring-0 transition focus:border-cyan-300/70 focus:bg-white/10"
          />
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {!activeKeyword && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80">
              Nhập từ khóa ở ô tìm kiếm để bắt đầu.
            </div>
          )}

          {activeKeyword && (
            <div className="flex items-center justify-between text-sm text-white/70">
              <div>
                Kết quả cho "<span className="font-semibold text-white">{activeKeyword}</span>"
              </div>
              {meta?.total && <div className="text-white/50">{meta.total} kết quả</div>}
            </div>
          )}

          <div className="space-y-3">
            {results.map((item) => (
              <ResultItem key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>

          {loading && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              Đang tìm kiếm...
            </div>
          )}

          {!loading && activeKeyword && !results.length && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              Không tìm thấy kết quả phù hợp.
            </div>
          )}

          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={() => loadResults((meta?.page || 1) + 1, true)}
                className="rounded-full border border-cyan-400/50 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
              >
                Tải thêm
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Tiện ích</p>
              <h2 className="text-xl font-semibold text-white drop-shadow-sm">Lịch sử tìm kiếm</h2>
            </div>
            <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/60">10 gần nhất</span>
          </div>

          {historyError && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-100">
              {historyError}
            </div>
          )}

          {!historyError && !history.length && (
            <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/60">
              Chưa có lịch sử tìm kiếm.
            </div>
          )}

          <div className="space-y-2">
            {history.map((item) => (
              <HistoryItem key={item.id} keyword={item.keyword} createdAt={item.created_at} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}