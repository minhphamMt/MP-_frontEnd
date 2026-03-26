import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { searchAdmin } from "../../api/admin.api";
import { resolveAssetUrl } from "../../utils/asset";
import AdminListNotice from "../../components/admin/AdminListNotice";
import OptimizedImage from "../../components/common/OptimizedImage";
import { getArtistLabel } from "../../utils/artist";
import {
  extractAdminSearchItems,
  normalizeAdminSearchType,
} from "../../utils/adminSearch";
import {
  getAdminListFallbackMessage,
  isAdminListTimeoutError,
  withAdminListTimeout,
} from "../../utils/adminListRequest";
import useDebouncedValue from "../../hooks/useDebouncedValue";

const SEARCH_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "song", label: "Bài hát" },
  { id: "album", label: "Album" },
  { id: "artist", label: "Nghệ sĩ" },
  { id: "user", label: "Hồ sơ" },
];

const getResultImage = (item, type) => {
  if (!item) return "";
  const common =
    item.cover_url ||
    item.cover ||
    item.thumbnail ||
    item.image ||
    item.image_url ||
    item.coverUrl ||
    item.imageUrl;

  if (type === "user" || type === "artist") {
    return (
      item.avatar ||
      item.avatar_url ||
      item.photo ||
      item.photo_url ||
      item.profile_image ||
      item.profile_photo ||
      item.profileImage ||
      item.profilePhoto ||
      common
    );
  }

  return common || item.album_cover || item.albumCover || item.artwork || item.artwork_url;
};

const getSecondaryLabel = (item, type) => {
  if (type === "song") {
    return getArtistLabel(item, item.artist_name || item.artist?.name || "") || item.album_title;
  }
  if (type === "album") {
    return getArtistLabel(item, item.artist_name || item.artist?.name || "") || item.release_date;
  }
  if (type === "artist") {
    return item.alias || item.realname || item.national;
  }
  return item.email || item.role || item.alias;
};

const getTargetId = (item) =>
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

export default function AdminSearch() {
  const location = useLocation();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const searchRequestRef = useRef(0);
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 350);

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || params.get("keyword") || "").trim();
  }, [location.search]);

  const normalizedResults = useMemo(
    () =>
      results
        .map((item) => {
          const type = normalizeAdminSearchType(item);
          if (!["artist", "song", "album", "user"].includes(type)) {
            return null;
          }

          return {
            ...item,
            type,
            displayLabel:
              item.display_name || item.title || item.name || item.email || "Unknown",
            secondaryLabel: getSecondaryLabel(item, type),
            imageUrl: getResultImage(item, type),
          };
        })
        .filter(Boolean),
    [results]
  );

  const visibleResults = useMemo(() => {
    if (activeTab === "all") return normalizedResults;
    return normalizedResults.filter((item) => item.type === activeTab);
  }, [activeTab, normalizedResults]);

  const groupedResults = useMemo(() => {
    const groups = {
      songs: [],
      artists: [],
      albums: [],
      users: [],
    };

    visibleResults.forEach((item) => {
      if (item.type === "song") groups.songs.push(item);
      if (item.type === "artist") groups.artists.push(item);
      if (item.type === "album") groups.albums.push(item);
      if (item.type === "user") groups.users.push(item);
    });

    return groups;
  }, [visibleResults]);

  const tabCounts = useMemo(
    () => ({
      all: normalizedResults.length,
      song: normalizedResults.filter((item) => item.type === "song").length,
      album: normalizedResults.filter((item) => item.type === "album").length,
      artist: normalizedResults.filter((item) => item.type === "artist").length,
      user: normalizedResults.filter((item) => item.type === "user").length,
    }),
    [normalizedResults]
  );

  const topResult = useMemo(() => {
    const first = visibleResults[0];
    if (!first) return null;
    const labels = {
      song: "Bài hát",
      artist: "Nghệ sĩ",
      album: "Album",
      user: "Hồ sơ",
    };
    return { ...first, label: labels[first.type] || "Kết quả" };
  }, [visibleResults]);

  const runSearch = useCallback(async (rawValue) => {
    const trimmed = rawValue.trim();
    if (!trimmed) {
      searchRequestRef.current += 1;
      setResults([]);
      setErrorMessage("");
      setLoading(false);
      return;
    }

    const requestId = ++searchRequestRef.current;

    try {
      setLoading(true);
      const res = await withAdminListTimeout(() =>
        searchAdmin({
          q: trimmed,
          keyword: trimmed,
          page: 1,
          limit: 50,
        })
      );
      const payload = res?.data?.data ?? res?.data ?? [];
      const list = extractAdminSearchItems(payload);
      if (requestId !== searchRequestRef.current) return;

      setResults(list);
      setErrorMessage("");
    } catch (error) {
      if (requestId !== searchRequestRef.current) return;
      if (isAdminListTimeoutError(error)) {
        console.warn("Search admin timed out");
      } else {
        console.error("Search admin failed", error);
      }
      setErrorMessage(getAdminListFallbackMessage("kết quả", trimmed));
      setResults([]);
    } finally {
      if (requestId === searchRequestRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setKeyword(query);
  }, [query]);

  useEffect(() => {
    if (!debouncedKeyword) {
      searchRequestRef.current += 1;
      setResults([]);
      setErrorMessage("");
      setLoading(false);
      return;
    }
    runSearch(debouncedKeyword);
    setActiveTab("all");
    if (debouncedKeyword !== query) {
      navigate(`/admin/search?q=${encodeURIComponent(debouncedKeyword)}`, {
        replace: true,
      });
    }
  }, [debouncedKeyword, navigate, query, runSearch]);

  const handleSubmit = () => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    navigate(`/admin/search?q=${encodeURIComponent(trimmed)}`);
    runSearch(trimmed);
  };

  const handleResultClick = (item) => {
    if (!item) return;

    const label =
      item.display_name || item.displayLabel || item.name || item.title || "";
    const targetId = getTargetId(item);
    const encodedLabel = encodeURIComponent(label);

    if (item.type === "artist") {
      if (targetId) {
        navigate(`/admin/artists/${targetId}/edit`);
        return;
      }
      navigate(`/admin/artists?keyword=${encodedLabel}`);
      return;
    }

    if (item.type === "album") {
      if (targetId) {
        navigate(`/admin/albums/${targetId}/edit`);
        return;
      }
      navigate(`/admin/albums?keyword=${encodedLabel}`);
      return;
    }

    if (item.type === "song") {
      if (targetId) {
        navigate(`/admin/songs/${targetId}/edit`);
        return;
      }
      navigate(`/admin/songs?keyword=${encodedLabel}`);
      return;
    }

    if (item.type === "user") {
      if (targetId) {
        navigate(`/admin/users/${targetId}`);
        return;
      }
      navigate(`/admin/users?keyword=${encodedLabel}`);
    }
  };

  const hasNoResult =
    !!debouncedKeyword &&
    !loading &&
    !groupedResults.songs.length &&
    !groupedResults.artists.length &&
    !groupedResults.albums.length &&
    !groupedResults.users.length;

  return (
    <div className="admin-page-shell min-h-screen space-y-8 px-4 py-6 pb-12 sm:px-8">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
            Quản trị
          </p>
          <h1 className="text-3xl font-extrabold text-white">Tìm kiếm quản trị</h1>
          <p className="text-sm text-white/60">
            {loading
              ? "Đang tải dữ liệu..."
              : "Khám phá bài hát, nghệ sĩ, album và người dùng phù hợp nhất."}
          </p>
        </div>

        <div className="admin-glass rounded-3xl border border-white/10 bg-[#181818] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
              placeholder="Nhập từ khóa tìm kiếm..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-emerald-400/60 focus:outline-none"
            />
            <button
              onClick={handleSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-xs font-semibold text-black shadow-lg shadow-emerald-400/30 transition md:hover:bg-emerald-300"
            >
              <FiSearch /> Tìm kiếm
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SEARCH_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const count = tabCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  isActive ? "bg-white text-black" : "bg-[#2a2a2a] text-white/80 md:hover:bg-[#333]"
                }`}
              >
                {tab.label} {debouncedKeyword ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      <AdminListNotice message={errorMessage} />

      {hasNoResult && (
        <div className="rounded-2xl border border-white/5 bg-[#181818] p-6 text-white/70">
          Không tìm thấy kết quả phù hợp.
        </div>
      )}

      {!!visibleResults.length && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Kết quả nổi bật</h2>
            <div className="rounded-2xl border border-white/5 bg-[#181818] p-5 transition md:hover:bg-[#202020]">
              {topResult ? (
                <button
                  type="button"
                  onClick={() => handleResultClick(topResult)}
                  className="w-full text-left"
                >
                  <div className="space-y-4">
                    {topResult.imageUrl ? (
                      <OptimizedImage
                        src={resolveAssetUrl(topResult.imageUrl)}
                        alt={topResult.displayLabel}
                        className={`h-28 w-28 object-cover ${
                          topResult.type === "artist" || topResult.type === "user"
                            ? "rounded-full"
                            : "rounded-lg"
                        }`}
                      />
                    ) : (
                      <div
                        className={`flex h-28 w-28 items-center justify-center bg-[#2a2a2a] text-xs text-white/60 ${
                          topResult.type === "artist" || topResult.type === "user"
                            ? "rounded-full"
                            : "rounded-lg"
                        }`}
                      >
                        No image
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-white">{topResult.displayLabel}</h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                        <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                          {topResult.label}
                        </span>
                        <span className="truncate">
                          {topResult.secondaryLabel || getTargetId(topResult)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ) : (
                <div className="text-sm text-white/60">Chưa có kết quả để hiển thị.</div>
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Kết quả nhanh</h2>
            <div className="rounded-2xl border border-white/5 bg-[#181818] p-3">
              <div className="space-y-1">
                {visibleResults.slice(0, 6).map((item) => (
                  <button
                    key={`${item.type}-${getTargetId(item) || item.displayLabel}`}
                    type="button"
                    onClick={() => handleResultClick(item)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition md:hover:bg-white/5"
                  >
                    {item.imageUrl ? (
                      <OptimizedImage
                        src={resolveAssetUrl(item.imageUrl)}
                        alt={item.displayLabel}
                        className={`h-10 w-10 object-cover ${
                          item.type === "artist" || item.type === "user"
                            ? "rounded-full"
                            : "rounded-lg"
                        }`}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a2a2a] text-[10px] text-white/60">
                        No image
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{item.displayLabel}</p>
                      <p className="truncate text-xs text-white/60">{item.secondaryLabel || "-"}</p>
                    </div>
                    <span className="rounded-full bg-[#2a2a2a] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/70">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!!groupedResults.songs.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Bài hát</h2>
          <div className="rounded-2xl border border-white/5 bg-[#181818] p-3">
            <div className="space-y-1">
              {groupedResults.songs.map((song) => (
                <button
                  key={song.id || song._id}
                  type="button"
                  onClick={() => handleResultClick(song)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition md:hover:bg-white/5"
                >
                  {song.imageUrl ? (
                    <OptimizedImage
                      src={resolveAssetUrl(song.imageUrl)}
                      alt={song.displayLabel}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2a2a2a] text-[10px] text-white/60">
                      No image
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{song.displayLabel}</p>
                    <p className="text-xs text-white/60">{song.secondaryLabel || "-"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!!groupedResults.artists.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Nghệ sĩ</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {groupedResults.artists.map((artist) => (
              <button
                key={artist.id || artist._id}
                type="button"
                onClick={() => handleResultClick(artist)}
                className="rounded-2xl border border-white/5 bg-[#181818] p-4 text-left transition md:hover:bg-[#202020]"
              >
                <div className="space-y-3">
                  {artist.imageUrl ? (
                    <OptimizedImage
                      src={resolveAssetUrl(artist.imageUrl)}
                      alt={artist.displayLabel}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#2a2a2a] text-xs text-white/60">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{artist.displayLabel}</p>
                    <p className="text-xs text-white/60">{artist.secondaryLabel || "Nghệ sĩ"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!!groupedResults.albums.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Album</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {groupedResults.albums.map((album) => (
              <button
                key={album.id || album._id}
                type="button"
                onClick={() => handleResultClick(album)}
                className="rounded-2xl border border-white/5 bg-[#181818] p-4 text-left transition md:hover:bg-[#202020]"
              >
                <div className="space-y-3">
                  {album.imageUrl ? (
                    <OptimizedImage
                      src={resolveAssetUrl(album.imageUrl)}
                      alt={album.displayLabel}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-[#2a2a2a] text-xs text-white/60">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{album.displayLabel}</p>
                    <p className="text-xs text-white/60">{album.secondaryLabel || "Album"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!!groupedResults.users.length && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Người dùng</h2>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {groupedResults.users.map((user) => (
              <button
                key={user.id || user._id}
                type="button"
                onClick={() => handleResultClick(user)}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#181818] px-4 py-3 text-left transition md:hover:bg-[#202020]"
              >
                {user.imageUrl ? (
                  <OptimizedImage
                    src={resolveAssetUrl(user.imageUrl)}
                    alt={user.displayLabel}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2a2a2a] text-xs text-white/60">
                    No image
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{user.displayLabel}</p>
                  <p className="text-xs text-white/60">{user.secondaryLabel || getTargetId(user)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
