import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiClock, FiLoader, FiSearch, FiTrendingUp } from "react-icons/fi";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import OptimizedImage from "../components/common/OptimizedImage";
import SongRow from "../components/song/SongRow";
import { getSongDetailPath } from "../components/song/SongDetailLink";
import {
  extractSearchCollections,
  getSearchHistory,
  saveSearchHistory,
  searchEntities,
} from "../api/search.api";
import useAuthStore from "../store/auth.store";
import { resolveAssetUrl } from "../utils/asset";
import { getArtistLabel } from "../utils/artist";
import { filterPlayableSongs } from "../utils/song";

const PAGE_LIMIT = 18;
const SEARCH_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "songs", label: "Bài hát" },
  { id: "albums", label: "Album" },
  { id: "artists", label: "Nghệ sĩ" },
];
const TRENDING_KEYWORDS = ["Sơn Tùng", "Ballad", "HEAT", "V-Pop", "Nhạc chill", "Rap Việt"];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.items)) return value.items;
  if (Array.isArray(value.rows)) return value.rows;
  if (Array.isArray(value.data)) return value.data;
  return [];
};

const normalizeArtist = (artist) => {
  if (!artist || typeof artist !== "object") return null;
  return {
    ...artist,
    artist_id: artist.artist_id ?? artist.id,
    artist_name: artist.artist_name ?? artist.name ?? artist.title,
    cover_url:
      artist.cover_url ||
      artist.avatar_url ||
      artist.avatar ||
      artist.image_url ||
      artist.thumbnail_m ||
      artist.thumbnail ||
      artist.image ||
      artist.cover,
    song_count: artist.song_count ?? artist.track_count ?? artist.songs_count ?? 0,
  };
};

const normalizeAlbum = (album) => {
  if (!album || typeof album !== "object") return null;
  return {
    ...album,
    id: album.id ?? album.album_id ?? album.albumId,
    title: album.title ?? album.name,
    artist_name: getArtistLabel(
      album,
      album.artist_name ?? album.artist?.name ?? album.creator?.name ?? ""
    ),
  };
};

const extractMeta = (responseData) => {
  const payload = responseData?.data ?? responseData ?? {};
  const source = payload?.items ?? payload?.results ?? payload?.data ?? payload;
  const meta =
    source?.meta ??
    payload?.meta ??
    (source?.page || source?.currentPage || source?.totalPages || source?.total
      ? {
          page: source.page ?? source.currentPage ?? 1,
          limit: source.limit ?? source.perPage ?? source.per_page ?? PAGE_LIMIT,
          total: source.total,
          totalPages: source.totalPages ?? source.total_pages,
          hasNext: source.hasNext ?? source.has_next ?? source.has_more,
        }
      : null);
  return meta;
};

const dedupeByKey = (items = [], getKey) => {
  const seen = new Set();
  return items.filter((item, index) => {
    const key = getKey(item) ?? index;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getSongKey = (song) => song?.id ?? song?.song_id ?? song?.songId ?? song?.title;
const getArtistKey = (artist) => artist?.artist_id ?? artist?.id ?? artist?.artist_name;
const getAlbumKey = (album) => album?.id ?? album?.album_id ?? album?.title;

const getHistoryKeyword = (item) =>
  item?.keyword ?? item?.search_term ?? item?.searchTerm ?? item?.term ?? item?.q ?? "";

const getTopResultLink = (item) => {
  if (!item) return null;
  if (item.type === "Song") return getSongDetailPath(item.raw);
  if (item.type === "Artist") return item.raw?.artist_id ? `/artist/${item.raw.artist_id}` : null;
  if (item.type === "Album") return item.raw?.id ? `/album/${item.raw.id}` : null;
  return null;
};

export default function Search() {
  const location = useLocation();
  const keyword = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get("q") || params.get("keyword") || "").trim();
  }, [location.search]);

  const [songs, setSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [recentKeywords, setRecentKeywords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const sentinelRef = useRef(null);
  const user = useAuthStore((state) => state.user);

  const loadResults = useCallback(
    async ({ nextPage = 1, append = false } = {}) => {
      if (!keyword) {
        setSongs([]);
        setArtists([]);
        setAlbums([]);
        setPage(1);
        setHasMore(false);
        return;
      }

      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const res = await searchEntities({ q: keyword, limit: PAGE_LIMIT, page: nextPage });
        const responseData = res?.data;
        const { songs: rawSongs, artists: rawArtists, albums: rawAlbums } =
          extractSearchCollections(responseData);
        const nextSongs = filterPlayableSongs(rawSongs);
        const nextArtists = rawArtists.map(normalizeArtist).filter(Boolean);
        const nextAlbums = rawAlbums.map(normalizeAlbum).filter(Boolean);

        setSongs((prev) =>
          append ? dedupeByKey([...prev, ...nextSongs], getSongKey) : nextSongs
        );
        setArtists((prev) =>
          append ? dedupeByKey([...prev, ...nextArtists], getArtistKey) : nextArtists
        );
        setAlbums((prev) =>
          append ? dedupeByKey([...prev, ...nextAlbums], getAlbumKey) : nextAlbums
        );

        const meta = extractMeta(responseData);
        const totalPages = meta?.totalPages ?? meta?.total_pages;
        const explicitHasNext = meta?.hasNext ?? meta?.has_next ?? meta?.has_more;
        const totalFetched = nextSongs.length + nextArtists.length + nextAlbums.length;

        setHasMore(
          typeof explicitHasNext === "boolean"
            ? explicitHasNext
            : totalPages
              ? nextPage < totalPages
              : totalFetched >= PAGE_LIMIT
        );
        setPage(nextPage);

        if (!append && user?.id) {
          try {
            await saveSearchHistory(keyword, user.id);
          } catch (error) {
            console.error("Save search history error", error);
          }
        }
      } catch (error) {
        console.error("Search page error:", error);
        if (!append) {
          setSongs([]);
          setArtists([]);
          setAlbums([]);
        }
        setHasMore(false);
      } finally {
        if (append) setLoadingMore(false);
        else setLoading(false);
      }
    },
    [keyword, user?.id]
  );

  const loadRecentKeywords = useCallback(async () => {
    if (!user?.id) {
      setRecentKeywords([]);
      return;
    }

    try {
      setHistoryLoading(true);
      const res = await getSearchHistory({ limit: 10, userId: user.id });
      const payload = res?.data?.data ?? res?.data ?? {};
      const items = toArray(payload);
      setRecentKeywords(
        dedupeByKey(
          items
            .map((item) => ({ ...item, keyword: getHistoryKeyword(item) }))
            .filter((item) => item.keyword),
          (item) => item.keyword
        )
      );
    } catch (error) {
      console.error("Load search history error", error);
      setRecentKeywords([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    setActiveTab("all");
  }, [keyword]);

  useEffect(() => {
    if (!keyword) {
      loadRecentKeywords();
      return;
    }

    loadResults({ nextPage: 1, append: false });
  }, [keyword, loadRecentKeywords, loadResults]);

  useEffect(() => {
    if (!keyword) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
            loadResults({ nextPage: page + 1, append: true });
          }
        });
      },
      { root: null, rootMargin: "280px", threshold: 0.1 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, keyword, loadResults, loading, loadingMore, page]);

  const topResult = useMemo(() => {
    if (activeTab !== "all") return null;

    if (songs.length) {
      return {
        type: "Song",
        title: songs[0].title,
        subtitle: getArtistLabel(songs[0], songs[0].artist_name || ""),
        image: songs[0].cover_url,
        raw: songs[0],
      };
    }

    if (artists.length) {
      return {
        type: "Artist",
        title: artists[0].artist_name,
        subtitle: "Nghệ sĩ",
        image: artists[0].cover_url,
        raw: artists[0],
        isArtist: true,
      };
    }

    if (albums.length) {
      return {
        type: "Album",
        title: albums[0].title,
        subtitle: albums[0].artist_name,
        image: albums[0].cover_url,
        raw: albums[0],
      };
    }

    return null;
  }, [activeTab, albums, artists, songs]);

  const totalCount = songs.length + artists.length + albums.length;
  const hasResultsForTab = useMemo(() => {
    if (activeTab === "songs") return songs.length > 0;
    if (activeTab === "artists") return artists.length > 0;
    if (activeTab === "albums") return albums.length > 0;
    return totalCount > 0;
  }, [activeTab, artists.length, albums.length, songs.length, totalCount]);

  const topResultLink = getTopResultLink(topResult);

  return (
    <div className="user-page-shell min-h-screen w-full max-w-full space-y-6 overflow-x-hidden px-3 py-5 pb-12 sm:space-y-8 sm:px-6 sm:py-6">
      <section className="user-surface relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(29,185,84,0.18),_transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">Tìm kiếm</p>
            <h1 className="text-2xl font-black text-white sm:text-3xl">
              {keyword ? `“${keyword}”` : "Khám phá theo ý bạn muốn nghe"}
            </h1>
            <p className="max-w-2xl text-sm text-white/62">
              {keyword
                ? `${totalCount} kết quả đang được mở rộng dần khi bạn cuộn xuống.`
                : "Bắt đầu bằng một ca sĩ, ca khúc, album hoặc thử nhanh vài từ khóa đang được nghe nhiều."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(keyword ? SEARCH_TABS : TRENDING_KEYWORDS.map((item) => ({ id: item, label: item }))).map(
              (tab) =>
                keyword ? (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-[#1db954] text-[#041409]"
                        : "border border-white/15 bg-white/[0.05] text-white/80 md:hover:bg-white/[0.12]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ) : (
                  <Link
                    key={tab.id}
                    to={`/search?q=${encodeURIComponent(tab.id)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/[0.12] md:hover:text-white"
                  >
                    <FiTrendingUp className="text-[13px]" />
                    {tab.label}
                  </Link>
                )
            )}
          </div>
        </div>
      </section>

      {!keyword ? (
        <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="user-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
              <FiSearch />
              <span>Bắt đầu nhanh</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TRENDING_KEYWORDS.slice(0, 4).map((item) => (
                <Link
                  key={item}
                  to={`/search?q=${encodeURIComponent(item)}`}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-4 transition md:hover:border-white/20 md:hover:bg-white/[0.06]"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-white/40">Gợi ý</div>
                  <div className="mt-2 text-lg font-bold text-white">{item}</div>
                  <div className="mt-1 text-sm text-white/55">Mở nhanh kết quả tìm kiếm</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="user-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
              <FiClock />
              <span>Tìm kiếm gần đây</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {historyLoading ? (
                <div className="text-sm text-white/60">Đang tải lịch sử tìm kiếm...</div>
              ) : recentKeywords.length ? (
                recentKeywords.map((item) => (
                  <Link
                    key={item.keyword}
                    to={`/search?q=${encodeURIComponent(item.keyword)}`}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78 transition md:hover:border-white/25 md:hover:bg-white/[0.08] md:hover:text-white"
                  >
                    {item.keyword}
                  </Link>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-white/12 bg-white/[0.03] px-4 py-5 text-sm text-white/55">
                  Lịch sử tìm kiếm sẽ xuất hiện ở đây sau vài lần bạn khám phá.
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {!!keyword && !loading && !hasResultsForTab && (
        <div className="user-surface rounded-[28px] p-6 text-white/70">
          Không tìm thấy kết quả phù hợp. Hãy thử từ khóa ngắn hơn hoặc chuyển sang tên nghệ sĩ / album.
        </div>
      )}

      {!!keyword && (loading || songs.length || artists.length || albums.length) ? (
        <>
          {activeTab === "all" && (
            <div className="grid w-full max-w-full min-w-0 gap-6 lg:grid-cols-[1.05fr_1.95fr]">
              <div className="hidden lg:block">
                <h2 className="mb-3 text-lg font-semibold text-white">Kết quả nổi bật</h2>
                <div className="user-surface p-5">
                  {topResult ? (
                    topResultLink ? (
                      <Link
                        to={topResultLink}
                        className="block space-y-4 transition md:hover:translate-y-[-2px]"
                      >
                        {topResult.image ? (
                          <OptimizedImage
                            src={resolveAssetUrl(topResult.image)}
                            alt={topResult.title}
                            className={`h-28 w-28 object-cover ${
                              topResult.isArtist ? "rounded-full" : "rounded-[22px]"
                            }`}
                          />
                        ) : (
                          <div
                            className={`flex h-28 w-28 items-center justify-center bg-[#2a2a2a] text-xs text-white/60 ${
                              topResult.isArtist ? "rounded-full" : "rounded-[22px]"
                            }`}
                          >
                            No image
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-white">{topResult.title}</h3>
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                            <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                              {topResult.type}
                            </span>
                            <span className="truncate">{topResult.subtitle}</span>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="space-y-4">
                        {topResult.image ? (
                          <OptimizedImage
                            src={resolveAssetUrl(topResult.image)}
                            alt={topResult.title}
                            className={`h-28 w-28 object-cover ${
                              topResult.isArtist ? "rounded-full" : "rounded-[22px]"
                            }`}
                          />
                        ) : (
                          <div
                            className={`flex h-28 w-28 items-center justify-center bg-[#2a2a2a] text-xs text-white/60 ${
                              topResult.isArtist ? "rounded-full" : "rounded-[22px]"
                            }`}
                          >
                            No image
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-white">{topResult.title}</h3>
                          <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
                            <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
                              {topResult.type}
                            </span>
                            <span className="truncate">{topResult.subtitle}</span>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-sm text-white/60">Chưa có kết quả để hiển thị.</div>
                  )}
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="mb-3 text-lg font-semibold text-white">Bài hát</h2>
                <div className="user-surface w-full max-w-full min-w-0 overflow-hidden p-2 sm:p-3">
                  {songs.length ? (
                    <div className="w-full min-w-0 space-y-1">
                      {songs.slice(0, 5).map((song) => (
                        <SongRow key={song.id} song={song} queue={songs} />
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-4 text-sm text-white/60">Chưa có bài hát phù hợp.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "songs" && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-white">Bài hát</h2>
              <div className="user-surface w-full max-w-full overflow-hidden p-3">
                {songs.length ? (
                  <div className="space-y-1">
                    {songs.map((song) => (
                      <SongRow key={song.id} song={song} queue={songs} />
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-sm text-white/60">Chưa có bài hát phù hợp.</div>
                )}
              </div>
            </div>
          )}

          {!!artists.length && (activeTab === "all" || activeTab === "artists") && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Nghệ sĩ</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {artists.map((artist) => (
                  <ArtistAlbumCard key={artist.artist_id} artist={artist} variant="library" />
                ))}
              </div>
            </div>
          )}

          {!!albums.length && (activeTab === "all" || activeTab === "albums") && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Album</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} variant="library" />
                ))}
              </div>
            </div>
          )}

          <div ref={sentinelRef} className="flex min-h-[64px] items-center justify-center">
            {loading || loadingMore ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm text-white/65">
                <FiLoader className="animate-spin" />
                Đang tải thêm kết quả...
              </div>
            ) : hasMore ? (
              <div className="text-sm text-white/45">Cuộn xuống để tải thêm kết quả</div>
            ) : hasResultsForTab ? (
              <div className="text-sm text-white/35">Bạn đã xem hết kết quả hiện có.</div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
