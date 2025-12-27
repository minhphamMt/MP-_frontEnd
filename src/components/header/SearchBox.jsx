import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiClock,
  FiDisc,
  FiHeadphones,
  FiMusic,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { getSearchHistory, searchEntities } from "../../api/search.api";
import { getSongById } from "../../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../../utils/song";
import usePlayerStore from "../../store/player.store";

export default function SearchBox() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [keyword, setKeyword] = useState("");
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { playSong } = usePlayerStore();

  const defaultKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || params.get("keyword") || "";
  }, [location.search]);

  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getSearchHistory({ limit: 6 });
        const payload = res?.data?.data ?? res?.data ?? {};
        const items = Array.isArray(payload)
          ? payload
          : payload?.items ?? res?.data?.items ?? [];
        setHistory(items);
      } catch (err) {
        console.error("Search history error", err);
        setHistory([]);
      }
    };

    loadHistory();
  }, []);

  const fetchSuggestions = useCallback(async (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setRelatedKeywords([]);
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchEntities({ keyword: trimmed, limit: 10 });
      const payload = res?.data?.data ?? res?.data ?? {};
      const items = Array.isArray(payload)
        ? payload
        : payload?.items ?? res?.data?.items ?? [];

      const normalized = (items || []).map((item) => ({
        ...item,
        displayLabel:
          item.highlight?.display_name ||
          item.highlight?.title ||
          item.highlight?.name ||
          item.highlight?.keyword ||
          item.display_name ||
          item.title ||
          item.name ||
          item.keyword,
        secondaryLabel:
          item.highlight?.artist_name ||
          item.artist_name ||
          item.artist?.name,
        cover:
          item.cover_url ||
          item.thumbnail ||
          item.image_url ||
          item.thumbnail_m ||
          item.image,
      }));

      const keywords = normalized
        .filter((item) => item.type === "keyword" || !item.type)
        .slice(0, 5);
      const entities = normalized.filter((item) => item.type && item.type !== "keyword");

      setRelatedKeywords(keywords);
      setResults(entities);
    } catch (err) {
      console.error("Search suggestions error", err);
      setRelatedKeywords([]);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim()) {
        fetchSuggestions(keyword);
        setOpen(true);
      } else {
        setOpen(false);
        setRelatedKeywords([]);
        setResults([]);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [fetchSuggestions, keyword]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    handleKeywordSelect(keyword.trim());
  };

  const handleKeywordSelect = (value) => {
    if (!value) return;
    setKeyword(value);
    navigate(`/search?keyword=${encodeURIComponent(value)}`);
    setOpen(false);
  };

  const handleResultNavigate = (item) => {
    if (!item) return;

    if (item.type === "artist") {
      navigate(`/artist/${item.artist_id || item.id}`);
    } else if (item.type === "album") {
      navigate(`/album/${item.album_id || item.id}`);
    } else if (item.type === "song") {
      if (item.album_id || item.albumId) {
        navigate(`/album/${item.album_id || item.albumId}`);
      } else if (item.artist_id || item.artistId) {
        navigate(`/artist/${item.artist_id || item.artistId}`);
      } else {
        handleKeywordSelect(item.displayLabel || keyword);
      }
    } else {
      handleKeywordSelect(item.keyword || item.display_name || keyword);
    }
    setOpen(false);
  };

  const handlePlaySong = async (item) => {
    const playable = toPlayableSong(item);
    let target = playable;

    if (!playable.audio_url && playable.id) {
      const fetched = await fetchPlayableSong(playable, getSongById);
      if (fetched) target = fetched;
    }

    if (target.audio_url) {
      playSong(target, [target]);
      setOpen(false);
    }
  };

  const renderHighlighted = (html) => (
    <span
      className="[&_em]:text-cyan-300 [&_em]:not-italic"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );

  const renderSecondary = (item) => {
    const label = item.secondaryLabel;
    if (!label) return null;
    return <span className="text-xs text-white/60">{renderHighlighted(label)}</span>;
  };

  const resultIcon = (type) => {
    if (type === "artist") return <FiUser className="text-violet-200" />;
    if (type === "album") return <FiDisc className="text-emerald-200" />;
    return <FiMusic className="text-cyan-200" />;
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative" key={defaultKeyword}>
        <FiSearch
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200/80"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
          className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/50 shadow-[0_12px_30px_rgba(0,0,0,0.35)] outline-none ring-0 transition focus:border-cyan-300/70 focus:bg-white/10"
        />
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-white/10 bg-[#0c182f]/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur"> 
          {keyword.trim() ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                <span>Gợi ý cho "{keyword}"</span>
                {loading && <span className="text-xs text-cyan-200">Đang tìm...</span>}
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/50">
                    <FiSearch className="text-cyan-200" />
                    <span>Từ khóa liên quan</span>
                  </div>
                  {!loading && !relatedKeywords.length && (
                    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/70">
                      Không có gợi ý từ khóa.
                    </div>
                  )}
                  <div className="space-y-1">
                    {relatedKeywords.map((item) => (
                      <button
                        type="button"
                        key={item.id || item.keyword || item.displayLabel}
                        onClick={() => handleKeywordSelect(item.keyword || item.displayLabel || keyword)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-cyan-200">
                          <FiSearch />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate font-semibold">
                            {renderHighlighted(item.displayLabel || item.keyword)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/50">
                    <FiHeadphones className="text-pink-200" />
                    <span>Gợi ý kết quả</span>
                  </div>

                  {!loading && !results.length && (
                    <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/70">
                      Không tìm thấy gợi ý phù hợp.
                    </div>
                  )}

                  <div className="space-y-1">
                    {results.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-white transition hover:bg-white/5"
                      >
                        <button
                          type="button"
                          onClick={() => handleResultNavigate(item)}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-white/5 bg-white/5">
                            {item.cover ? (
                              <img
                                src={item.cover}
                                alt={item.displayLabel || item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg text-white/70">
                                {resultIcon(item.type)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold">
                              {renderHighlighted(item.displayLabel || item.name || item.title)}
                            </div>
                            {renderSecondary(item)}
                          </div>
                        </button>

                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/60">
                          <span className="rounded-full bg-white/5 px-2 py-1">{item.type}</span>
                          {item.type === "song" && (
                            <button
                              type="button"
                              onClick={() => handlePlaySong(item)}
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/20"
                            >
                              <FiMusic />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                <FiClock />
                <span>Lịch sử tìm kiếm</span>
              </div>
              {!history.length && (
                <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/70">
                  Bạn chưa có lịch sử tìm kiếm.
                </div>
              )}
              <div className="space-y-1">
                  {history.map((item) => {
                    const createdAt = item.createdAt || item.created_at;

                    return (
                    <button
                      type="button"
                      key={item.id || item.keyword}
                      onClick={() => handleKeywordSelect(item.keyword || "")}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-white transition hover:bg-white/5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-cyan-200">
                        <FiClock />
                      </div>
                      <div className="flex-1 truncate">{item.keyword}</div>
                        {createdAt && (
                          <span className="text-[11px] text-white/40">
                            {new Date(createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}