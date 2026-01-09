import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiClock, FiDisc, FiHeadphones, FiMusic, FiSearch, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { getSearchHistory, searchEntities } from "../../api/search.api";
import { getSongById } from "../../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../../utils/song";
import usePlayerStore from "../../store/player.store";
import { saveSearchHistory } from "../../api/search.api";
import useAuthStore from "../../store/auth.store";
import { createPortal } from "react-dom";

export default function SearchBox() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const { playSong } = usePlayerStore();
  const user = useAuthStore((state) => state.user);
  const defaultKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || params.get("keyword") || "";
  }, [location.search]);
const [dropdownStyle, setDropdownStyle] = useState(null);

useEffect(() => {
  if (!open) return;

  const update = () => {
    const el = containerRef.current; // wrapper của SearchBox
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const gap = 12; // giống mt-3

    setDropdownStyle({
      position: "fixed",
      left: rect.left,
      top: rect.bottom + gap,
      width: rect.width,
      zIndex: 9999,
    });
  };

  update();

  // Update khi scroll/resize (kể cả scroll trong container)
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, true);

  return () => {
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update, true);
  };
}, [open, keyword]); // keyword đổi có thể làm height input/layout thay đổi nhẹ

  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadHistory = async () => {
        if (!user?.id) {
        setHistory([]);
        return;
      }
      try {
        const res = await getSearchHistory({ limit: 6, userId: user.id });
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
  }, [user?.id]);

  const fetchSuggestions = useCallback(async (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
       const res = await searchEntities({ q: trimmed, limit: 8, page: 1 });
      const payload = res?.data?.data ?? res?.data ?? {};
      const items = payload?.items ?? payload;
      const songs = Array.isArray(items?.songs) ? items.songs : [];
      const artists = Array.isArray(items?.artists) ? items.artists : [];
      const albums = Array.isArray(items?.albums) ? items.albums : [];

      const merged = [
        ...songs.map((item) => ({ ...item, type: "song" })),
        ...artists.map((item) => ({ ...item, type: "artist" })),
        ...albums.map((item) => ({ ...item, type: "album" })),
      ];

      const normalized = merged.map((item) => ({
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

      setResults(normalized);
    } catch (err) {
      console.error("Search suggestions error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  if (!hasFocus) return; // 🔥 CHẶN TỰ MỞ KHI CHƯA CLICK

  const timer = setTimeout(() => {
    if (keyword.trim()) {
      fetchSuggestions(keyword);
    } else {
      setResults([]);
    }
  }, 320);

  return () => clearTimeout(timer);
}, [fetchSuggestions, keyword, hasFocus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

const handleSubmit = async (e) => {
    e.preventDefault();
    const value = keyword.trim();
    if (!value) return;
    if (user?.id) {
      try {
        await saveSearchHistory(value, user.id);
        setHistory((prev) => {
          const normalized = value.toLowerCase();
          const filtered = prev.filter(
            (item) => (item.keyword || "").toLowerCase() !== normalized
          );
          return [
            { keyword: value, searched_at: new Date().toISOString() },
            ...filtered,
          ].slice(0, 6);
        });
      } catch (err) {
        console.error("Lưu lịch sử tìm kiếm thất bại", err);
      }
    }
    navigate(`/search?q=${encodeURIComponent(value)}`);
    setOpen(false);
  };

const handleResultNavigate = async (item) => {
  if (!item) return;

  const nameToSave =
    item.display_name ||
    item.displayLabel ||
    item.name ||
    item.title;

  if (nameToSave && user?.id) {
    try {
      await saveSearchHistory(nameToSave, user.id);

      // ✅ UPDATE HISTORY NGAY (optimistic)
      setHistory((prev) => {
        const filtered = prev.filter(h => h.keyword !== nameToSave);
        return [
          { keyword: nameToSave, searched_at: new Date().toISOString() },
          ...filtered,
        ].slice(0, 6); // giới hạn 6 item
      });
    } catch (err) {
      console.error("Lưu lịch sử tìm kiếm thất bại", err);
    }
  }

  if (item.type === "artist") {
    navigate(`/artist/${item.id}`);
  } else if (item.type === "album") {
    navigate(`/album/${item.id}`);
  } else if (item.type === "song") {
    navigate(`/song/${item.id}`);
  }

  setOpen(false);
  setKeyword("");
};




  const handlePlaySong = async (item) => {
    const playable = toPlayableSong(item);
    let target = playable;

    if (!playable.audio_url && playable.id) {
      const fetched = await fetchPlayableSong(playable, getSongById);
      console.log(fetched);
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
    <div className="relative z-500 w-full max-w-lg" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative" key={defaultKeyword}>
        <FiSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cyan-200"
          size={18}
        />
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
         onFocus={() => {
  setHasFocus(true);
  setOpen(true);
}}

          placeholder="Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
          className="w-full rounded-2xl border border-cyan-500/30 bg-[#0f2145] py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-white/60 shadow-[0_18px_48px_rgba(0,0,0,0.45)] outline-none transition focus:border-cyan-300 focus:shadow-[0_20px_60px_rgba(6,182,212,0.25)]"
        />
      </form>

{open &&
  dropdownStyle &&
  createPortal(
    <div style={dropdownStyle} className="px-0">
      <div className="rounded-2xl border border-cyan-500/15 bg-[#0b1530] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.65)]">
        <div className="rounded-xl border border-white/5 bg-[#0f1f3f] p-4 shadow-inner shadow-black/20">
          <div className="flex items-center justify-between text-sm text-white/70">
            <div className="font-semibold text-white">Tìm kiếm nhanh</div>
            {keyword.trim() && (
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                "{keyword}"
              </div>
            )}
            {!keyword.trim() && (
              <div className="text-xs text-white/50">
                Nhấn từ khóa để xem gợi ý
              </div>
            )}
          </div>

          {keyword.trim() ? (
            <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-[#122449] p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60">
                <FiHeadphones className="text-pink-200" />
                <span>Gợi ý kết quả</span>
                {loading && (
                  <span className="text-[11px] text-cyan-200/80">
                    Đang tìm...
                  </span>
                )}
              </div>

              {!loading && !results.length && (
                <div className="rounded-lg border border-white/10 bg-[#0b1b38] px-3 py-2 text-sm text-white/70">
                  Không tìm thấy gợi ý phù hợp.
                </div>
              )}

              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {results.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white transition hover:bg-[#0c1c38]"
                  >
                    <button
                      type="button"
                      onClick={() => handleResultNavigate(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#1b2c54] via-[#13264a] to-[#0f1f3f]">
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
                          {renderHighlighted(
                            item.displayLabel || item.name || item.title
                          )}
                        </div>
                        {renderSecondary(item)}
                      </div>
                    </button>

                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/60">
                      <span className="rounded-full bg-[#0b1b38] px-2 py-1 text-white/70">
                        {item.type}
                      </span>
                      {item.type === "song" && (
                        <button
                          type="button"
                          onClick={() => handlePlaySong(item)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/15 text-cyan-100 transition hover:border-cyan-300 hover:bg-cyan-400/25"
                        >
                          <FiMusic />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-[#122449] p-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
                <FiClock />
                <span>Lịch sử tìm kiếm</span>
                {loading && (
                  <span className="text-[11px] text-cyan-200/80">
                    Đang tải...
                  </span>
                )}
              </div>

              {!history.length && (
                <div className="rounded-lg border border-white/10 bg-[#0b1b38] px-3 py-2 text-sm text-white/70">
                  Bạn chưa có lịch sử tìm kiếm.
                </div>
              )}

              <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
                {history.map((item) => {
                  const createdAt =
                    item.searched_at || item.createdAt || item.created_at;

                  return (
                    <button
                      type="button"
                      key={item.id || item.keyword}
                      onClick={() => {
                        setKeyword(item.keyword);
                        fetchSuggestions(item.keyword);
                        setOpen(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition hover:bg-[#0c1c38]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b1b38] text-cyan-200">
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
      </div>
    </div>,
    document.body
  )}

    </div>
  );
}