import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiClock, FiDisc, FiHeadphones, FiMusic, FiSearch, FiUser } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import {
  extractSearchCollections,
  getSearchHistory,
  searchEntities,
} from "../../api/search.api";
import { searchAdmin } from "../../api/admin.api";
import { getSongById } from "../../api/song.api";
import { fetchPlayableSong, toPlayableSong } from "../../utils/song";
import { getArtistLabel } from "../../utils/artist";
import usePlayerStore from "../../store/player.store";
import { saveSearchHistory } from "../../api/search.api";
import useAuthStore from "../../store/auth.store";
import { createPortal } from "react-dom";
import { resolveAssetUrl } from "../../utils/asset";
import OptimizedImage from "../common/OptimizedImage";

const getSearchItemId = (item) =>
  item?.id ??
  item?._id ??
  item?.song_id ??
  item?.songId ??
  item?.album_id ??
  item?.albumId ??
  item?.artist_id ??
  item?.artistId ??
  "";

export default function SearchBox() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [historyLoadedForUserId, setHistoryLoadedForUserId] = useState(null);

  const { playSong } = usePlayerStore();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const defaultKeyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || params.get("keyword") || "";
  }, [location.search]);
  const [dropdownStyle, setDropdownStyle] = useState(null);

  useEffect(() => {
    if (!open) return;

    const update = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const gap = 12;
      const viewportWidth = window.innerWidth;
      const isTabletOrMobile = viewportWidth < 1024;
      const screenPadding = viewportWidth < 640 ? 8 : 12;
      const maxWidth = viewportWidth - screenPadding * 2;

      const preferredWidth = isTabletOrMobile
        ? Math.max(rect.width * 1.35, rect.width + 80)
        : rect.width;
      const safeWidth = Math.min(preferredWidth, maxWidth);

      const anchorCenterX = rect.left + rect.width / 2;
      const centeredLeft = anchorCenterX - safeWidth / 2;
      const safeLeft = Math.min(
        Math.max(centeredLeft, screenPadding),
        viewportWidth - safeWidth - screenPadding
      );

      setDropdownStyle({
        position: "fixed",
        left: safeLeft,
        top: rect.bottom + gap,
        width: safeWidth,
        zIndex: 9999,
      });
    };

    update();

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, keyword]);

  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setHistory([]);
    setHistoryLoadedForUserId(null);
  }, [user?.id]);

  useEffect(() => {
    if (!open || keyword.trim() || !user?.id) return undefined;
    if (historyLoadedForUserId === user.id) return undefined;

    let active = true;

    const loadHistory = async () => {
      try {
        const res = await getSearchHistory({ limit: 6, userId: user.id });
        const payload = res?.data?.data ?? res?.data ?? {};
        const items = Array.isArray(payload)
          ? payload
          : payload?.items ?? res?.data?.items ?? [];

        if (!active) return;
        setHistory(items);
        setHistoryLoadedForUserId(user.id);
      } catch (err) {
        if (!active) return;
        console.error("Search history error", err);
        setHistory([]);
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, [historyLoadedForUserId, keyword, open, user?.id]);

  const fetchSuggestions = useCallback(async (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      if (isAdmin) {
        const res = await searchAdmin({ q: trimmed, limit: 8, page: 1 });
        const payload = res?.data?.data ?? res?.data ?? {};
        const itemsSource =
          payload.items || payload.results || payload.data || payload;
        const items = Array.isArray(itemsSource)
          ? itemsSource
          : [
              ...(itemsSource?.songs ?? []),
              ...(itemsSource?.artists ?? []),
              ...(itemsSource?.albums ?? []),
              ...(itemsSource?.users ?? []),
            ];

        const normalized = items
          .map((item) => {
            let type =
              item.type || item.entity_type || item.entityType || item.kind;
            const rawType = `${type || ""}`.toLowerCase();

            if (rawType.includes("playlist")) return null;
            if (
              item.playlist_id ||
              item.playlistId ||
              item.owner_id ||
              item.ownerId ||
              item.is_public !== undefined ||
              item.privacy !== undefined
            ) {
              return null;
            }

            if (!type && (item.display_name || item.email)) type = "user";
            if (!type && item.role === "ARTIST") type = "artist";
            if (
              !type &&
              item.title &&
              (item.play_count !== undefined ||
                item.audio_url ||
                item.audio_path ||
                item.duration !== undefined ||
                item.album_id ||
                item.album_title ||
                item.weekly_play_count !== undefined)
            )
              type = "song";
            if (
              !type &&
              item.title &&
              (item.release_date ||
                item.zing_album_id ||
                item.artist_name ||
                item.artist_id)
            )
              type = "album";
            if (!type && item.name) type = "artist";

            const normalizedType = (type || "").toLowerCase();
            if (!["artist", "song", "album", "user"].includes(normalizedType)) {
              return null;
            }

            return {
              ...item,
              type: normalizedType,
              displayLabel:
                item.highlight?.display_name ||
                item.highlight?.title ||
                item.highlight?.name ||
                item.display_name ||
                item.title ||
                item.name ||
                item.email,
              secondaryLabel:
                item.highlight?.artist_name ||
                item.artist_name ||
                item.artist?.name ||
                getArtistLabel(item, "") ||
                item.owner?.name ||
                item.owner_name ||
                item.email ||
                item.role,
              cover:
                item.cover_url ||
                item.thumbnail ||
                item.image_url ||
                item.avatar_url ||
                item.thumbnail_m ||
                item.image,
            };
          })
          .filter(Boolean);

        setResults(normalized);
      } else {
        const res = await searchEntities({ q: trimmed, limit: 8, page: 1 });
        const { songs, artists, albums } = extractSearchCollections(res?.data);

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
            item.artist?.name ||
            getArtistLabel(item, ""),
          cover:
            item.cover_url ||
            item.thumbnail ||
            item.image_url ||
            item.thumbnail_m ||
            item.image,
        }));

        setResults(normalized);
      }
    } catch (err) {
      console.error("Search suggestions error", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!hasFocus) return;

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
       const target = event.target;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
       setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    async (rawValue, { triggerAdminResults = false } = {}) => {
      const value = rawValue.trim();
      if (!value) return;
      setKeyword(value);
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
    if (isAdmin) {
        if (triggerAdminResults) {
          navigate(`/admin/search?q=${encodeURIComponent(value)}`);
          setOpen(false);
          return;
        }
        setOpen(true);
        await fetchSuggestions(value);
        return;
      }
      navigate(`/search?q=${encodeURIComponent(value)}`);
      setOpen(false);
    },
    [fetchSuggestions, isAdmin, navigate, user?.id]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(keyword, { triggerAdminResults: isAdmin });
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

      // Cập nhật lịch sử ngay trên UI (optimistic)
      setHistory((prev) => {
        const filtered = prev.filter(h => h.keyword !== nameToSave);
        return [
          { keyword: nameToSave, searched_at: new Date().toISOString() },
          ...filtered,
        ].slice(0, 6); // Giới hạn 6 mục
      });
    } catch (err) {
      console.error("Lưu lịch sử tìm kiếm thất bại", err);
    }
  }

  if (isAdmin) {
    const label = nameToSave || "";
    const targetId =
      item.id ??
      item._id ??
      item.song_id ??
      item.songId ??
      item.album_id ??
      item.albumId ??
      item.user_id ??
      item.userId ??
      item.artist_id ??
      item.artistId ??
      "";
    if (item.type === "artist") {
      if (targetId) {
        navigate(`/admin/artists/${targetId}/edit`);
      } else {
        navigate(`/admin/artists?keyword=${encodeURIComponent(label)}`);
      }
    } else if (item.type === "album") {
      if (targetId) {
        navigate(`/admin/albums/${targetId}/edit`);
      } else {
        navigate(`/admin/albums?keyword=${encodeURIComponent(label)}`);
      }
    } else if (item.type === "song") {
      if (targetId) {
        navigate(`/admin/songs/${targetId}/edit`);
      } else {
        navigate(`/admin/songs?keyword=${encodeURIComponent(label)}`);
      }
    } else if (item.type === "user") {
      if (targetId) {
        navigate(`/admin/users/${targetId}/edit`);
      } else {
        navigate(`/admin/users?keyword=${encodeURIComponent(label)}`);
      }
    } else {
      navigate(`/admin/search?q=${encodeURIComponent(label)}`);
    }
    setOpen(false);
    setKeyword("");
    return;
  }

  if (item.type === "artist") {
    const targetId = getSearchItemId(item);
    if (!targetId) return;
    navigate(`/artist/${targetId}`);
  } else if (item.type === "album") {
    const targetId = getSearchItemId(item);
    if (!targetId) return;
    navigate(`/album/${targetId}`);
  } else if (item.type === "song") {
    const targetId = getSearchItemId(item);
    if (!targetId) return;
    navigate(`/song/${targetId}`);
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
       className="[&_em]:text-[#1db954] [&_em]:not-italic"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );

  const renderSecondary = (item) => {
    const label = item.secondaryLabel;
    if (!label) return null;
    return <span className="text-xs text-white/60">{renderHighlighted(label)}</span>;
  };

  const resultIcon = (type) => {
    if (type === "artist") return <FiUser className="text-white/70" />;
    if (type === "album") return <FiDisc className="text-white/70" />;
    if (type === "user") return <FiUser className="text-white/70" />;
    return <FiMusic className="text-white/70" />;
  };

  return (
    <div className="relative z-500 w-full max-w-2xl" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative" key={defaultKeyword}>
        <FiSearch
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/70"
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

          placeholder={
            isAdmin
              ? "Tìm kiếm nghệ sĩ, bài hát, album..."
              : "Tìm kiếm bài hát, nghệ sĩ, lời bài hát..."
          }
          className="user-input rounded-full border-white/10 bg-[#1f1f1f] py-2.5 pl-12 pr-4 text-base text-white shadow-[0_10px_22px_rgba(0,0,0,0.34)] sm:text-sm"
        />
      </form>

{open &&
  dropdownStyle &&
  createPortal(
      <div
        style={dropdownStyle}
        className="max-h-[70vh] overflow-y-auto px-0 sm:max-h-none"
        ref={dropdownRef}
      >
      <div className="user-surface rounded-2xl p-2 shadow-[0_24px_70px_rgba(0,0,0,0.65)] sm:p-4">
        <div className="rounded-xl border border-white/10 bg-[#121212] p-2 shadow-inner shadow-black/20 sm:p-4">
          <div className="flex items-center justify-between gap-2 text-sm text-white/70">
            <div className="font-semibold text-white">Tìm kiếm nhanh</div>
            {keyword.trim() && (
              <div className="hidden truncate text-xs uppercase tracking-[0.2em] text-[#1db954] sm:block">
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
            <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-[#181818] p-2 sm:p-3">
              <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/60 sm:flex">
                <FiHeadphones className="text-white/70" />
                <span>Gợi ý kết quả</span>
                {loading && (
                  <span className="text-[11px] text-[#1db954]">
                    Đang tìm...
                  </span>
                )}
              </div>

              {!loading && !results.length && (
                <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70">
                  Không tìm thấy gợi ý phù hợp.
                </div>
              )}

              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {results.map((item) => (
                  <div
                    key={`${item.type}-${getSearchItemId(item) || item.displayLabel}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-white transition md:hover:bg-white/[0.08] sm:gap-3 sm:px-3"
                  >
                    <button
                      type="button"
                      onClick={() => handleResultNavigate(item)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:h-12 sm:w-12">
                        {item.cover ? (
                          <OptimizedImage
                            src={resolveAssetUrl(item.cover)}
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
                        <div className="hidden sm:block">{renderSecondary(item)}</div>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 text-[11px] uppercase tracking-[0.15em] text-white/60 sm:gap-2">
                      <span className="hidden rounded-full bg-white/10 px-2 py-1 text-white/70 sm:inline-flex">
                        {item.type}
                      </span>
                      {item.type === "song" && !isAdmin && (
                        <button
                          type="button"
                          onClick={() => handlePlaySong(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/60 bg-emerald-400/20 text-emerald-300 transition md:hover:border-emerald-300 md:hover:bg-emerald-400/30 sm:h-9 sm:w-9"
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
            <div className="mt-3 space-y-3 rounded-xl border border-white/10 bg-[#181818] p-2 sm:p-3">
              <div className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60 sm:flex">
                <FiClock />
                <span>Lịch sử tìm kiếm</span>
                {loading && (
                  <span className="text-[11px] text-[#1db954]">
                    Đang tải...
                  </span>
                )}
              </div>

              {!history.length && (
                <div className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70">
                  Bạn chưa có lịch sử tìm kiếm.
                </div>
              )}

              <div className="max-h-80 space-y-1 overflow-y-auto pr-1 sm:max-h-72">
                {history.map((item) => {
                  const createdAt =
                    item.searched_at || item.createdAt || item.created_at;

                  return (
                    <button
                      type="button"
                      key={item.id || item.keyword}
                       onClick={() => handleSearch(item.keyword || "")}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-white transition md:hover:bg-white/[0.08]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70">
                        <FiClock />
                      </div>
                      <div className="flex-1 truncate">{item.keyword}</div>
                      {createdAt && (
                        <span className="hidden text-[11px] text-white/40 sm:inline">
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
