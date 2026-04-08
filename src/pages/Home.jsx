import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiDisc,
  FiPlay,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";
import { getAlbums } from "../api/album.api";
import { getMyHistory } from "../api/history.api";
import { getArtistCollections } from "../api/artist.api";
import { getNewReleaseChart, getWeeklyTopSongs } from "../api/chart.api";
import { getRecommendations, getColdStartRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import ArtistNames from "../components/artist/ArtistNames";
import Section from "../components/section/Section";
import SongCard from "../components/song/SongCard";
import { SongDetailLink } from "../components/song/SongDetailLink";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import useRecommendationSessionStore from "../store/recommendation-session.store";
import { getAlbumPath, getArtistPath } from "../utils/entityPath";
import {
  filterPlayableSongs,
  fetchPlayableSong,
  formatDuration,
  toPlayableSong,
} from "../utils/song";
import { resolveAssetUrl } from "../utils/asset";
import { getArtistLabel } from "../utils/artist";
import {
  buildCollectionPageJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "../utils/seo";
import { formatDateDisplay } from "../utils/date";

const HOME_HISTORY_LIMIT = 60;
const CONTINUE_SONGS_LIMIT = 5;
const RECOMMENDATION_DESKTOP_LIMIT = 9;
const RECOMMENDATION_TABLET_LIMIT = 8;
const RECOMMENDATION_NEW_RELEASE_SEED_LIMIT = 40;
const SM_BREAKPOINT = 640;
const XL_BREAKPOINT = 1280;
const TOP_WEEK_COLORS = ["#fbbf24", "#60a5fa", "#a78bfa", "#fb7185", "#f97316"];

const toList = (raw) =>
  Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.data)
        ? raw.data
        : [];

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "Mới đây";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
};

const formatContinueMeta = (song) =>
  [formatRelativeTime(song?.listened_at), song?.duration ? formatDuration(song.duration) : null]
    .filter(Boolean)
    .join(" • ");

const formatReleaseDate = (value) => {
  return formatDateDisplay(value, "Mới phát hành");
};

const getArtistSongCount = (artist) =>
  artist?.song_count ?? artist?.track_count ?? artist?.songs_count ?? artist?.songs?.length ?? 0;

const dedupeSongIds = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = normalizeSongId(item);
    if (id === null || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
};

const buildContinueSongs = (historyItems = []) => {
  const normalized = historyItems
    .map((item, index) => {
      const song = toPlayableSong(item?.song || item);
      if (!song?.id) return null;

      const listenedAt =
        item?.listened_at || item?.listen_time || item?.created_at || null;
      const historyId =
        item?.id ??
        item?._id ??
        item?.history_id ??
        item?.historyId ??
        `${song.id}-${listenedAt || index}-${index}`;

      return {
        ...song,
        listened_at: listenedAt,
        continueKey: `${historyId}-${index}`,
      };
    })
    .filter(Boolean);

  return normalized
    .reduce((acc, item) => {
      if (acc.some((entry) => entry.id === item.id)) return acc;
      acc.push(item);
      return acc;
    }, [])
    .slice(0, CONTINUE_SONGS_LIMIT);
};

const normalizeRecommendedIds = (items = []) =>
  items
    .map((item, index) => ({
      id: item?.songId ?? item?.song_id ?? item?.id ?? item,
      score: Number(item?.score ?? item?.similarity_score ?? 0),
      index,
    }))
    .filter((item) => item.id)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index))
    .reduce((acc, item) => {
      const key = String(item.id);
      if (!acc.includes(key)) acc.push(key);
      return acc;
    }, []);

const extractSeedSongIds = (items = []) => {
  const seen = new Set();

  return items.reduce((acc, item) => {
    const id = normalizeSongId(item?.song || item);
    if (id === null || seen.has(id)) return acc;

    seen.add(id);
    acc.push(id);
    return acc;
  }, []);
};

const extractNewReleaseSongs = (response) => {
  const rawSongs =
    response?.data?.data?.songs ||
    response?.data?.data ||
    response?.data?.items ||
    response?.data ||
    [];

  return filterPlayableSongs(Array.isArray(rawSongs) ? rawSongs : []);
};

const pickRandomSongId = (songIds = []) => {
  if (!songIds.length) return null;
  return songIds[Math.floor(Math.random() * songIds.length)] ?? null;
};

export default function Home() {
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [newAlbums, setNewAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [continueSongs, setContinueSongs] = useState([]);
  const [weeklyTop, setWeeklyTop] = useState([]);
  const [loadingHome, setLoadingHome] = useState(true);
  const [continueLoading, setContinueLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : XL_BREAKPOINT
  );

  const ranRef = useRef(false);
  const artistRailRef = useRef(null);
  const newAlbumRailRef = useRef(null);
  const artistTimerRef = useRef(null);
  const newAlbumTimerRef = useRef(null);
  const artistResumeRef = useRef(null);
  const newAlbumResumeRef = useRef(null);
  const historyCacheRef = useRef([]);
  const recommendationSeedPoolRef = useRef([]);

  const playSong = usePlayerStore((state) => state.playSong);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const getUsedRecommendationSeedIds = useRecommendationSessionStore(
    (state) => state.getUsedSeedSongIds
  );
  const markRecommendationSeedUsed = useRecommendationSessionStore(
    (state) => state.markSeedSongId
  );
  const clearRecommendationSeedSession = useRecommendationSessionStore(
    (state) => state.clearUserSeedSongIds
  );
  const recommendationSessionUserId = user?.id ? String(user.id) : "guest";

  const fetchSongsByIds = useCallback(
    async (ids = [], limit = RECOMMENDATION_DESKTOP_LIMIT) => {
      const queue = ids.filter(Boolean);
      const collected = [];

      for (let index = 0; index < queue.length; index += 6) {
        if (collected.length >= limit) break;
        const chunk = queue.slice(index, index + 6);
        const results = await Promise.allSettled(chunk.map((id) => getSongById(id)));

        for (const result of results) {
          if (result.status !== "fulfilled") continue;
          const song = toPlayableSong(result.value?.data?.data || result.value?.data || {});
          if (!song?.id) continue;
          collected.push(song);
          if (collected.length >= limit) break;
        }
      }

      return dedupeSongIds(collected).slice(0, limit);
    },
    []
  );

  const fetchRecommendedSongs = useCallback(
    async (seedSongId) => {
      const excludedIds = new Set(
        [seedSongId].map((id) => normalizeSongId(id)).filter((id) => id !== null).map(String)
      );
      const recRes = seedSongId ? await getRecommendations(seedSongId) : await getColdStartRecommendations(30);
      const selectedIds = normalizeRecommendedIds(recRes?.data?.data || recRes?.data || []).filter(
        (id) => !excludedIds.has(String(id))
      );

      if (selectedIds.length < RECOMMENDATION_DESKTOP_LIMIT) {
        const fallbackRes = await getColdStartRecommendations(50);
        for (const id of normalizeRecommendedIds(fallbackRes?.data?.data || fallbackRes?.data || [])) {
          if (excludedIds.has(String(id))) continue;
          if (!selectedIds.includes(id)) selectedIds.push(id);
          if (selectedIds.length >= 30) break;
        }
      }

      const fetchedSongs = await fetchSongsByIds(
        selectedIds,
        RECOMMENDATION_DESKTOP_LIMIT + excludedIds.size
      );

      return fetchedSongs
        .filter((song) => !excludedIds.has(String(normalizeSongId(song))))
        .slice(0, RECOMMENDATION_DESKTOP_LIMIT);
    },
    [fetchSongsByIds]
  );

  const loadUserHistory = useCallback(
    async ({ force = false } = {}) => {
      if (!isAuthenticated) {
        historyCacheRef.current = [];
        return [];
      }

      if (historyCacheRef.current.length && !force) {
        return historyCacheRef.current;
      }

      try {
        const historyRes = await getMyHistory({ limit: HOME_HISTORY_LIMIT });
        const items = toList(historyRes?.data?.data ?? historyRes?.data);
        historyCacheRef.current = items;
        return items;
      } catch {
        historyCacheRef.current = [];
        return [];
      }
    },
    [isAuthenticated]
  );

  const loadRecommendationSeedPool = useCallback(async ({ force = false } = {}) => {
    if (recommendationSeedPoolRef.current.length && !force) {
      return recommendationSeedPoolRef.current;
    }

    try {
      const response = await getNewReleaseChart({
        page: 1,
        limit: RECOMMENDATION_NEW_RELEASE_SEED_LIMIT,
      });
      const items = dedupeSongIds(extractNewReleaseSongs(response));
      recommendationSeedPoolRef.current = items;
      return items;
    } catch (error) {
      console.error("Load new release seed pool error:", error);
      recommendationSeedPoolRef.current = [];
      return [];
    }
  }, []);

  const loadRecommendations = useCallback(
    async (seedSongId, { silent = false } = {}) => {
      if (!silent) setRecommendationLoading(true);
      try {
        setSongs(await fetchRecommendedSongs(seedSongId));
        return true;
      } catch (error) {
        console.error("Load recommendations error:", error);
        return false;
      } finally {
        if (!silent) setRecommendationLoading(false);
      }
    },
    [fetchRecommendedSongs]
  );

  const rememberRecommendationSeed = useCallback(
    (seedSongId, { resetUsedSeeds = false } = {}) => {
      if (!recommendationSessionUserId || !seedSongId) return;

      if (resetUsedSeeds) {
        clearRecommendationSeedSession(recommendationSessionUserId);
      }

      markRecommendationSeedUsed(recommendationSessionUserId, seedSongId);
    },
    [
      clearRecommendationSeedSession,
      markRecommendationSeedUsed,
      recommendationSessionUserId,
    ]
  );

  const selectRecommendationSeed = useCallback(
    (historyItems = [], fallbackSeedSongs = []) => {
      const historySeedIds = extractSeedSongIds(historyItems);
      const fallbackSeedIds = extractSeedSongIds(fallbackSeedSongs);
      const usedSeedIds = new Set(
        (recommendationSessionUserId
          ? getUsedRecommendationSeedIds(recommendationSessionUserId)
          : []
        ).map(String)
      );

      const unusedHistorySeedIds = historySeedIds.filter(
        (songId) => !usedSeedIds.has(String(songId))
      );

      if (unusedHistorySeedIds.length) {
        return {
          seedSongId: pickRandomSongId(unusedHistorySeedIds),
          resetUsedSeeds: false,
        };
      }

      if (historySeedIds.length) {
        return {
          seedSongId: pickRandomSongId(historySeedIds),
          resetUsedSeeds: true,
        };
      }

      const unusedFallbackSeedIds = fallbackSeedIds.filter(
        (songId) => !usedSeedIds.has(String(songId))
      );

      if (unusedFallbackSeedIds.length) {
        return {
          seedSongId: pickRandomSongId(unusedFallbackSeedIds),
          resetUsedSeeds: false,
        };
      }

      if (fallbackSeedIds.length) {
        return {
          seedSongId: pickRandomSongId(fallbackSeedIds),
          resetUsedSeeds: true,
        };
      }

      return {
        seedSongId: null,
        resetUsedSeeds: false,
      };
    },
    [getUsedRecommendationSeedIds, recommendationSessionUserId]
  );

  const loadHome = useCallback(async () => {
    try {
      setLoadingHome(true);
      setChartLoading(true);
      if (isAuthenticated) {
        setContinueLoading(true);
      }

      const [artistRes, albumRes, topRes, historyItems, recommendationSeedPool] = await Promise.all([
        getArtistCollections({ limit: 20 }),
        getAlbums({ limit: 20, sort: "release_date", order: "desc" }),
        getWeeklyTopSongs(),
        isAuthenticated ? loadUserHistory({ force: true }) : Promise.resolve([]),
        loadRecommendationSeedPool({ force: true }),
      ]);

      setArtistAlbums(toList(artistRes?.data?.data || artistRes?.data));
      setNewAlbums(toList(albumRes?.data?.data || albumRes?.data));

      if (isAuthenticated) {
        setContinueSongs(buildContinueSongs(historyItems));
        setContinueLoading(false);
      } else {
        historyCacheRef.current = [];
        setContinueSongs([]);
      }

      const rawTop = toList(topRes?.data?.data || topRes?.data);
      const metricMap = new Map(
        rawTop.map((item) => [
          String(item?.id ?? item?.song_id ?? item?.songId ?? ""),
          Number(item?.weekly_play_count ?? item?.play_count ?? item?.score ?? 0),
        ])
      );

      setWeeklyTop(
        filterPlayableSongs(rawTop)
          .slice(0, 5)
          .map((song, index) => ({
            ...song,
            rank: index + 1,
            metric: metricMap.get(String(song.id)) || Number(song?.play_count || 0),
          }))
      );
      setChartLoading(false);

      const mostRecentHistorySeedId = extractSeedSongIds(historyItems)[0] ?? null;
      const { seedSongId, resetUsedSeeds } = mostRecentHistorySeedId
        ? {
            seedSongId: mostRecentHistorySeedId,
            resetUsedSeeds: false,
          }
        : selectRecommendationSeed([], recommendationSeedPool);
      const hasLoadedRecommendations = await loadRecommendations(seedSongId, {
        silent: true,
      });
      if (hasLoadedRecommendations && seedSongId) {
        rememberRecommendationSeed(seedSongId, { resetUsedSeeds });
      }
    } catch (error) {
      console.error("Load home error:", error);
    } finally {
      setLoadingHome(false);
      setContinueLoading(false);
      setChartLoading(false);
    }
  }, [
      isAuthenticated,
      loadRecommendations,
      loadRecommendationSeedPool,
      loadUserHistory,
      rememberRecommendationSeed,
      selectRecommendationSeed,
    ]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    loadHome();
  }, [loadHome]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getScrollStep = useCallback((ref) => {
    const node = ref.current;
    if (!node) return 0;

    const firstItem = node.querySelector("[data-carousel-item]");
    if (!firstItem) return node.clientWidth * 0.72;

    const styles = window.getComputedStyle(node);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0");
    return firstItem.getBoundingClientRect().width + gap;
  }, []);

  const scrollForwardWithLoop = useCallback(
    (ref) => {
      const node = ref.current;
      if (!node) return;
      const maxScroll = node.scrollWidth - node.clientWidth;
      if (maxScroll <= 0) return;
      const distance = getScrollStep(ref) || node.clientWidth * 0.72;
      const atEnd = Math.abs(node.scrollLeft - maxScroll) < 2;
      node.scrollTo({
        left: atEnd ? 0 : Math.min(node.scrollLeft + distance, maxScroll),
        behavior: "smooth",
      });
    },
    [getScrollStep]
  );

  const scrollByAmount = useCallback(
    (ref, direction = 1) => {
      const node = ref.current;
      if (!node) return;
      const amount = getScrollStep(ref) || node.clientWidth * 0.72;
      const maxScroll = node.scrollWidth - node.clientWidth;
      node.scrollTo({
        left:
          direction > 0
            ? Math.min(node.scrollLeft + amount, maxScroll)
            : Math.max(node.scrollLeft - amount, 0),
        behavior: "smooth",
      });
    },
    [getScrollStep]
  );

  const clearResumeTimeout = (resumeRef) => {
    if (resumeRef.current) {
      clearTimeout(resumeRef.current);
      resumeRef.current = null;
    }
  };

  const startAutoScroll = useCallback(
    (ref, timerRef, itemCount) => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!ref.current || itemCount < 2) return;
      if (
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
      ) {
        return;
      }
      timerRef.current = setInterval(() => {
        scrollForwardWithLoop(ref);
      }, 3800);
    },
    [scrollForwardWithLoop]
  );

  const pauseAutoScroll = (timerRef) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const pauseAndResumeAutoScroll = (ref, timerRef, resumeRef, itemCount) => {
    pauseAutoScroll(timerRef);
    clearResumeTimeout(resumeRef);
    resumeRef.current = setTimeout(() => startAutoScroll(ref, timerRef, itemCount), 1200);
  };

  useEffect(() => {
    startAutoScroll(artistRailRef, artistTimerRef, artistAlbums.length);
    return () => {
      pauseAutoScroll(artistTimerRef);
      clearResumeTimeout(artistResumeRef);
    };
  }, [artistAlbums, startAutoScroll]);

  useEffect(() => {
    startAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbums.length);
    return () => {
      pauseAutoScroll(newAlbumTimerRef);
      clearResumeTimeout(newAlbumResumeRef);
    };
  }, [newAlbums, startAutoScroll]);

  const featuredSong = songs[0] || null;
  const featuredArtistLabel = getArtistLabel(
    featuredSong,
    featuredSong?.artist_name || ""
  );
  const featuredCover =
    resolveAssetUrl(featuredSong?.cover_url) ||
    resolveAssetUrl(newAlbums?.[0]?.cover_url) ||
    resolveAssetUrl(artistAlbums?.[0]?.cover_url) ||
    "";
  const featuredReleaseLabel =
    featuredSong?.album_title ||
    featuredSong?.album?.title ||
    newAlbums?.[0]?.title ||
    "Khoaluan Selection";
  const featuredReleaseDateLabel = formatReleaseDate(
    featuredSong
      ? featuredSong.release_date
      : newAlbums?.[0]?.release_date || newAlbums?.[0]?.releaseDate
  );
  const heroSummary = featuredSong
    ? `${featuredArtistLabel || "Khoaluan Music"} mở đầu hôm nay với một lựa chọn đáng nghe.`
    : "Mở nhanh bài hát nổi bật, MChart và album mới trong một không gian gọn gàng.";
  const homeSectionShellClassName =
    "border-transparent bg-transparent px-0 py-0 shadow-none sm:px-0 sm:py-0";
  const homeSectionSurfaceClassName =
    "home-section-surface border-transparent bg-[#171819] shadow-[0_24px_58px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]";
  const homeRaisedCardClassName =
    "home-raised-card bg-[#18191a] shadow-[0_20px_48px_rgba(0,0,0,0.26),inset_0_1px_0_rgba(255,255,255,0.035)]";
  const homeRaisedCardHoverClassName = "transition-colors duration-200 md:hover:bg-[#1c1d1f]";
  const homeInsetTileClassName =
    "home-inset-tile bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]";
  const homeFeatureSectionHeaderClassName = "items-end gap-4 px-1";
  const homeFeatureSectionSubtitleClassName =
    "home-feature-section-subtitle mb-2 inline-flex rounded-full bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-white/62 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]";
  const homeFeatureSectionTitleClassName =
    "home-feature-section-title text-[2rem] font-black tracking-[-0.05em] text-white sm:text-[2.3rem]";
  const homeMetaDescription = useMemo(() => {
    const highlights = [];

    if (weeklyTop.length) {
      highlights.push(`cập nhật MChart với ${weeklyTop.length} bài hát nổi bật trong tuần`);
    }

    if (newAlbums.length) {
      highlights.push(`khám phá ${newAlbums.length} album phát hành gần đây`);
    }

    if (artistAlbums.length) {
      highlights.push("theo dõi nghệ sĩ và gợi ý nghe nhạc cá nhân hóa");
    }

    return highlights.length
      ? `${highlights.join(", ")} trên Khoaluan Music.`
      : "Nghe nhạc trực tuyến, khám phá album mới, MChart và nghệ sĩ nổi bật trên Khoaluan Music.";
  }, [artistAlbums.length, newAlbums.length, weeklyTop.length]);
  const homeJsonLd = useMemo(
    () => [
      buildWebSiteJsonLd(),
      buildOrganizationJsonLd(),
      buildCollectionPageJsonLd({
        name: "Trang chủ Khoaluan Music",
        description: homeMetaDescription,
        url: "/",
        image: featuredCover || "/logo-brand.png",
      }),
    ],
    [featuredCover, homeMetaDescription]
  );

  const continueQueue = useMemo(() => continueSongs.map((song) => ({ ...song })), [continueSongs]);
  const primaryContinueSong = continueSongs[0] || null;
  const secondaryContinueSongs = useMemo(
    () => continueSongs.slice(1),
    [continueSongs]
  );
  const weeklyQueue = useMemo(() => weeklyTop.map((song) => ({ ...song })), [weeklyTop]);
  const maxTopMetric = Math.max(...weeklyTop.map((song) => Number(song?.metric || 0)), 1);
  const recommendationLimit =
    viewportWidth >= SM_BREAKPOINT && viewportWidth < XL_BREAKPOINT
      ? RECOMMENDATION_TABLET_LIMIT
      : RECOMMENDATION_DESKTOP_LIMIT;
  const visibleRecommendedSongs = useMemo(
    () => songs.slice(0, recommendationLimit),
    [recommendationLimit, songs]
  );

  usePageMetadata({
    title: "Nghe nhạc trực tuyến",
    description: homeMetaDescription,
    image: featuredCover || "/logo-brand.png",
    url: "/",
    jsonLd: homeJsonLd,
  });

  const refreshRecommendations = async () => {
    const [historyItems, recommendationSeedPool] = await Promise.all([
      loadUserHistory({ force: true }),
      loadRecommendationSeedPool(),
    ]);
    const hasHistorySeeds = extractSeedSongIds(historyItems).length > 0;
    const { seedSongId, resetUsedSeeds } = hasHistorySeeds
      ? selectRecommendationSeed(historyItems, [])
      : selectRecommendationSeed([], recommendationSeedPool);
    const hasLoadedRecommendations = await loadRecommendations(seedSongId);

    if (hasLoadedRecommendations && seedSongId) {
      rememberRecommendationSeed(seedSongId, { resetUsedSeeds });
    }
  };

  const handleContinuePlay = useCallback(
    async (song) => {
      const playable = (await fetchPlayableSong(song, getSongById)) || song;
      if (playable?.id) playSong(playable, continueQueue);
    },
    [continueQueue, playSong]
  );

const artistRailAction = (
    <>
      <button
        type="button"
        onClick={() => {
          scrollByAmount(artistRailRef, -1);
          pauseAndResumeAutoScroll(artistRailRef, artistTimerRef, artistResumeRef, artistAlbums.length);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/72 transition-colors duration-200 md:hover:bg-white/[0.08] md:hover:text-white"
        aria-label="Xem nghệ sĩ trước"
      >
        <FiChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          scrollByAmount(artistRailRef, 1);
          pauseAndResumeAutoScroll(artistRailRef, artistTimerRef, artistResumeRef, artistAlbums.length);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/72 transition-colors duration-200 md:hover:bg-white/[0.08] md:hover:text-white"
        aria-label="Xem nghệ sĩ tiếp theo"
      >
        <FiChevronRight size={16} />
      </button>
    </>
  );

const albumRailAction = (
    <>
      <button
        type="button"
        onClick={() => {
          scrollByAmount(newAlbumRailRef, -1);
          pauseAndResumeAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbumResumeRef, newAlbums.length);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/72 transition-colors duration-200 md:hover:bg-white/[0.08] md:hover:text-white"
        aria-label="Xem album trước"
      >
        <FiChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => {
          scrollByAmount(newAlbumRailRef, 1);
          pauseAndResumeAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbumResumeRef, newAlbums.length);
        }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] text-white/72 transition-colors duration-200 md:hover:bg-white/[0.08] md:hover:text-white"
        aria-label="Xem album tiếp theo"
      >
        <FiChevronRight size={16} />
      </button>
    </>
  );

  return (
    <div className="home-page-view user-page-shell min-h-screen space-y-8 px-4 py-6 sm:space-y-12 sm:px-8">
      <section className="home-hero-shell user-surface relative overflow-hidden border-transparent bg-[#161718] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.045)] sm:p-5 lg:p-6">
        {featuredCover ? (
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.42]"
            style={{
              backgroundImage: `url(${featuredCover})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
            aria-hidden
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,17,17,0.86)_0%,rgba(16,17,17,0.76)_34%,rgba(16,17,17,0.5)_72%,rgba(16,17,17,0.4)_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-emerald-400/[0.05] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />

        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
          <div className="min-w-0 space-y-4">
            {loadingHome && !featuredSong ? (
              <div className="space-y-4">
                <div className="ui-skeleton-line h-3 w-28" />
                <div className="ui-skeleton-line h-9 w-[70%] rounded-lg" />
                <div className="ui-skeleton-line h-4 w-[48%]" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/8 px-3 py-1.5 text-[11px] font-semibold text-emerald-100/92">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Nổi bật hôm nay
                  </span>
                  {featuredArtistLabel ? (
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/38">
                      {featuredArtistLabel}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2.5">
                  {featuredSong ? (
                    <SongDetailLink
                      song={featuredSong}
                      className="home-hero-title max-w-3xl text-2xl font-black leading-tight text-white transition md:hover:text-emerald-200 sm:text-[2rem] xl:text-[2.35rem]"
                    >
                      {featuredSong.title}
                    </SongDetailLink>
                  ) : (
                    <h1 className="home-hero-title max-w-3xl text-2xl font-black leading-tight text-white sm:text-[2rem] xl:text-[2.35rem]">
                      Khoaluan Music
                    </h1>
                  )}
                  <p className="home-hero-summary max-w-xl text-sm leading-7 text-white/68 sm:text-[15px]">
                    {heroSummary}
                  </p>
                </div>

              </>
            )}

            <div className="home-hero-actions flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!featuredSong}
                onClick={() => featuredSong && playSong(featuredSong, songs)}
                className="user-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold disabled:opacity-60"
              >
                <FiPlay />
                <span>Nghe ngay</span>
              </button>

              <Link
                to="/zing-chart"
                className="user-btn-secondary inline-flex items-center gap-2 border-transparent bg-white/[0.05] px-4 py-2.5 text-sm font-semibold md:hover:border-transparent md:hover:bg-white/[0.08]"
              >
                MChart
                <FiChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="home-hero-sidecard rounded-[26px] bg-[#16181a]/96 p-4 shadow-[0_24px_62px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.045)]">
            <div className="flex items-center gap-4">
              <div className="home-hero-cover h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[20px] bg-white/5 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
                <img
                  src={resolveAssetUrl(featuredSong?.cover_url) || featuredCover || "/logo-brand.png"}
                  alt={featuredSong?.title || "Khoaluan Music"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  Bài mở đầu
                </p>
                {featuredSong ? (
                  <SongDetailLink
                    song={featuredSong}
                    className="block truncate text-[1.05rem] font-black text-white transition md:hover:text-emerald-200"
                  >
                    {featuredSong.title}
                  </SongDetailLink>
                ) : (
                  <p className="truncate text-[1.05rem] font-black text-white">Khoaluan Music</p>
                )}
                <p className="truncate text-xs text-white/56">
                  {featuredSong
                    ? getArtistLabel(featuredSong, featuredSong.artist_name || "") || "Đang cập nhật"
                    : "Danh sách phát được cập nhật liên tục"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className={`rounded-[18px] px-3 py-2.5 ${homeInsetTileClassName}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Từ album
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-white/88">
                  {featuredReleaseLabel}
                </p>
              </div>
              <div className={`rounded-[18px] px-3 py-2.5 ${homeInsetTileClassName}`}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Phát hành
                </p>
                <p className="mt-1 text-sm font-semibold text-white/88">
                  {featuredReleaseDateLabel}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section
        title="Tiếp tục nghe"
        subtitle="Theo hoạt động của bạn"
        shellClassName={homeSectionShellClassName}
        surfaceClassName={homeSectionSurfaceClassName}
        action={
          isAuthenticated ? (
            <Link
              to="/history"
              className="user-btn-secondary border-transparent bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold md:hover:border-transparent md:hover:bg-white/[0.08]"
            >
              Xem lịch sử
            </Link>
          ) : null
        }
      >
        {!isAuthenticated ? (
          <div className={`rounded-[24px] p-4 sm:p-5 ${homeRaisedCardClassName}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-1.5">
                <p className="user-heading-label">CÁ NHÂN HÓA</p>
                <h3 className="text-lg font-extrabold text-white sm:text-xl">
                  Đăng nhập để giữ lại những bài vừa nghe
                </h3>
                <p className="text-sm leading-6 text-white/66">
                  Mở lại nhanh bài hát bạn vừa nghe gần đây mà không phải tìm lại từ đầu.
                </p>
              </div>

              <Link
                to="/login"
                className="user-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold"
              >
                Đăng nhập
                <FiChevronRight />
              </Link>
            </div>
          </div>
        ) : continueLoading ? (
          <div className="space-y-3">
            <div className="ui-skeleton h-[108px] rounded-[24px]" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: CONTINUE_SONGS_LIMIT - 1 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`rounded-[20px] p-3 ${homeRaisedCardClassName}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="ui-skeleton h-12 w-12 rounded-2xl" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="ui-skeleton-line h-4 w-[76%]" />
                      <div className="ui-skeleton-line h-3 w-[54%]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !continueSongs.length ? (
          <div className={`rounded-[24px] p-4 sm:p-5 ${homeRaisedCardClassName}`}>
            <p className="user-heading-label">CHƯA CÓ DỮ LIỆU</p>
            <h3 className="mt-2 text-lg font-extrabold text-white sm:text-xl">
              Chưa có bài nào để tiếp tục nghe
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/66">
              Khi bạn nghe nhạc, phần này sẽ gợi lại những bài vừa mở gần đây để quay lại nhanh
              hơn ngay trên trang chủ.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {primaryContinueSong ? (
              <article
                className={`home-primary-continue-card overflow-hidden rounded-[24px] p-3.5 sm:p-4 ${homeRaisedCardClassName} ${homeRaisedCardHoverClassName}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                    <img
                      src={resolveAssetUrl(primaryContinueSong.cover_url) || "/logo-brand.png"}
                      alt={primaryContinueSong.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-white/60">
                      <span className="rounded-full border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-1 text-emerald-100">
                        Vừa nghe gần đây
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FiClock size={11} />
                        {formatRelativeTime(primaryContinueSong.listened_at)}
                      </span>
                    </div>

                    <SongDetailLink
                      song={primaryContinueSong}
                      className="home-primary-title mt-2 block truncate text-lg font-extrabold text-white transition md:hover:text-emerald-200 md:hover:underline sm:text-[1.35rem]"
                    >
                      {primaryContinueSong.title}
                    </SongDetailLink>
                    <ArtistNames
                      item={primaryContinueSong}
                      stopPropagation
                      className="mt-1 text-sm text-white/64"
                      linkClassName="transition md:hover:text-emerald-200 md:hover:underline"
                    />
                    <p className="mt-2 text-xs text-white/48 sm:text-sm">
                      Nghe lại từ đầu • {formatContinueMeta(primaryContinueSong)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 sm:pl-2">
                    <button
                      type="button"
                      onClick={() => handleContinuePlay(primaryContinueSong)}
                      className="user-btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-bold"
                    >
                      <FiPlay />
                      <span>Nghe lại</span>
                    </button>
                    <SongDetailLink
                      song={primaryContinueSong}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/82 transition md:hover:bg-white/[0.1] md:hover:text-white"
                      aria-label={`Mở chi tiết ${primaryContinueSong.title}`}
                    >
                      <FiChevronRight size={16} />
                    </SongDetailLink>
                  </div>
                </div>
              </article>
            ) : null}

            {secondaryContinueSongs.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {secondaryContinueSongs.map((song) => (
                  <article
                    key={song.continueKey || `${song.id}-${song.listened_at || song.title}`}
                    className={`rounded-[20px] p-3 ${homeRaisedCardClassName} ${homeRaisedCardHoverClassName}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white/5">
                        <img
                          src={resolveAssetUrl(song.cover_url) || "/logo-brand.png"}
                          alt={song.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <SongDetailLink
                          song={song}
                          className="block truncate text-sm font-bold text-white transition md:hover:text-emerald-300 md:hover:underline"
                        >
                          {song.title}
                        </SongDetailLink>
                        <ArtistNames
                          item={song}
                          stopPropagation
                          className="mt-0.5 truncate text-[12px] text-white/56"
                          linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                        />
                        <p className="mt-1 text-[11px] text-white/45">
                          {formatContinueMeta(song)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleContinuePlay(song)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-300/35 bg-emerald-500/16 text-emerald-100 transition-colors duration-200 md:hover:bg-emerald-500/28"
                        aria-label={`Phát ${song.title}`}
                      >
                        <FiPlay size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </Section>

      <Section
        title="Dành cho bạn"
        subtitle="Gợi ý bài hát"
        shellClassName={homeSectionShellClassName}
        surfaceClassName={homeSectionSurfaceClassName}
        action={
          <button
            onClick={refreshRecommendations}
            disabled={recommendationLoading}
            className="user-btn-secondary inline-flex items-center gap-2 border-transparent bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-60 md:hover:border-transparent md:hover:bg-white/[0.08] sm:px-4 sm:text-[13px]"
          >
            <FiRefreshCw className={recommendationLoading ? "animate-spin" : ""} />
            {recommendationLoading ? "Đang làm mới..." : "Làm mới"}
          </button>
        }
      >
        {recommendationLoading && !songs.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {Array.from({ length: recommendationLimit }).map((_, idx) => (
              <div key={idx} className="ui-skeleton h-28 rounded-2xl" />
            ))}
          </div>
        ) : !songs.length ? (
          <div className={`rounded-2xl p-4 text-sm text-white/70 ${homeRaisedCardClassName}`}>
            Chưa có bài hát phù hợp, hãy làm mới gợi ý.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {visibleRecommendedSongs.map((song) => (
              <div key={song.id} className="space-y-1.5">
                <SongCard song={song} queue={visibleRecommendedSongs} />
                {/* <p className="px-1 text-xs text-white/55">
                  {reasonById.get(normalizeSongId(song)) || "Gợi ý theo sở thích gần đây"}
                </p> */}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Top tuần"
        subtitle="Xu hướng nổi bật"
        shellClassName={homeSectionShellClassName}
        surfaceClassName={homeSectionSurfaceClassName}
        action={
          <Link
            to="/zing-chart"
            className="user-btn-secondary border-transparent bg-white/[0.05] px-3 py-1.5 text-[12px] font-semibold md:hover:border-transparent md:hover:bg-white/[0.08]"
          >
            Mở MChart
          </Link>
        }
      >
        {chartLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="ui-skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : !weeklyTop.length ? (
          <div className={`rounded-2xl p-4 text-sm text-white/70 ${homeRaisedCardClassName}`}>
            Chưa có dữ liệu top tuần.
          </div>
        ) : (
          <div className="space-y-2.5">
            {weeklyTop.map((song, index) => {
              const accentColor = TOP_WEEK_COLORS[index % TOP_WEEK_COLORS.length];
              return (
                <article
                  key={song.id}
                  className={`group relative overflow-hidden rounded-2xl p-3 ${homeRaisedCardClassName} transition md:hover:bg-[#1d1f20]`}
                  style={{ boxShadow: `inset 2px 0 0 ${accentColor}` }}
                >
                  <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/10" />
                  <div
                    className="absolute bottom-0 left-0 h-[2px]"
                    style={{
                      width: `${Math.min(100, (Number(song.metric || 0) / maxTopMetric) * 100)}%`,
                      backgroundColor: accentColor,
                    }}
                  />
                  <div className="relative flex items-center gap-3">
                    <span className="w-7 text-center text-lg font-black" style={{ color: accentColor }}>
                      {song.rank}
                    </span>
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={resolveAssetUrl(song.cover_url)}
                        alt={song.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <SongDetailLink
                        song={song}
                        className="truncate text-sm font-semibold text-white transition md:hover:text-emerald-300 md:hover:underline sm:text-base"
                      >
                        {song.title}
                      </SongDetailLink>
                      <ArtistNames
                        item={song}
                        stopPropagation
                        className="truncate text-xs text-white/60"
                        linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const playable = (await fetchPlayableSong(song, getSongById)) || song;
                        if (playable?.id) playSong(playable, weeklyQueue);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full border transition md:hover:scale-105"
                      style={{
                        borderColor: `${accentColor}99`,
                        backgroundColor: `${accentColor}22`,
                        color: accentColor,
                      }}
                      aria-label={`Phát ${song.title}`}
                    >
                      <FiPlay size={14} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Section>

      <Section
        title="Nghệ sĩ nổi bật"
        subtitle="Tuyển tập nổi bật"
        shellClassName={homeSectionShellClassName}
        surfaceClassName={homeSectionSurfaceClassName}
        headerClassName={homeFeatureSectionHeaderClassName}
        subtitleClassName={homeFeatureSectionSubtitleClassName}
        titleClassName={homeFeatureSectionTitleClassName}
      >
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center justify-end gap-3 px-1">
            <p className="hidden">
              Rail spotlight giữ nhịp chuyển nhẹ để phần nghệ sĩ nổi bật bớt giống một hàng card lặp lại.
            </p>
            <div className="flex items-center gap-2">{artistRailAction}</div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 top-12 z-10 hidden w-10 bg-gradient-to-r from-[#101010] to-transparent lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 top-12 z-10 hidden w-12 bg-gradient-to-l from-[#101010] to-transparent lg:block"
          />
          <div
            ref={artistRailRef}
            onMouseEnter={() => pauseAutoScroll(artistTimerRef)}
            onMouseLeave={() => startAutoScroll(artistRailRef, artistTimerRef, artistAlbums.length)}
            onTouchStart={() => pauseAutoScroll(artistTimerRef)}
            onTouchEnd={() =>
              pauseAndResumeAutoScroll(artistRailRef, artistTimerRef, artistResumeRef, artistAlbums.length)
            }
            className="home-feature-rail flex gap-4 overflow-x-auto pb-1 pr-6 scroll-smooth scrollbar-hidden sm:pr-8 lg:snap-x lg:snap-mandatory"
          >
            {loadingHome && !artistAlbums.length
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    data-carousel-item
                    className="home-artist-skeleton ui-skeleton h-[320px] w-[76vw] max-w-[300px] shrink-0 rounded-[26px] sm:w-[280px] lg:w-[292px] xl:w-[304px]"
                  />
                ))
              : artistAlbums.map((artist) => {
                  const artistPath = getArtistPath(artist) || "/";
                  const artistSongCount = getArtistSongCount(artist);

                  return (
                    <Link
                      key={artist.artist_id || artist.id || artist.artist_name}
                      to={artistPath}
                      data-carousel-item
                      className="home-artist-card group relative w-[76vw] max-w-[300px] shrink-0 overflow-hidden rounded-[26px] bg-[#18191a] p-3 shadow-[0_22px_52px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors duration-300 lg:w-[292px] lg:snap-start xl:w-[304px] md:hover:bg-[#1d1f20]"
                    >
                      <div className="relative aspect-[0.9] overflow-hidden rounded-[20px] bg-white/5">
                        <img
                          src={resolveAssetUrl(artist.cover_url) || "/logo-brand.png"}
                          alt={artist.artist_name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.04]"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.05),rgba(4,4,4,0.56)_48%,rgba(4,4,4,0.92))]" />

                        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72 backdrop-blur">
                            <FiUsers size={11} className="text-emerald-300" />
                            Spotlight
                          </span>
                          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                            {artistSongCount ? `${artistSongCount} bài` : "Nổi bật"}
                          </span>
                        </div>

                        <div className="absolute inset-x-3 bottom-3 space-y-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                            Nghệ sĩ được chú ý
                          </p>
                          <h3 className="truncate text-xl font-black text-white sm:text-[1.35rem]">
                            {artist.artist_name}
                          </h3>
                          <p className="text-sm leading-5 text-white/68">
                            Khám phá tuyển tập nổi bật và ca khúc đáng nghe nhất của {artist.artist_name}.
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="truncate text-xs font-medium text-white/45">
                          Cập nhật nghệ sĩ và tuyển chọn mới
                        </p>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/72 transition-colors duration-300 md:group-hover:bg-white/[0.08]">
                          Xem trang
                          <FiChevronRight size={13} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
          </div>
        </div>
      </Section>

      <Section
        title="Album mới phát hành"
        subtitle="Ra mắt gần đây"
        shellClassName={homeSectionShellClassName}
        surfaceClassName={homeSectionSurfaceClassName}
        headerClassName={homeFeatureSectionHeaderClassName}
        subtitleClassName={homeFeatureSectionSubtitleClassName}
        titleClassName={homeFeatureSectionTitleClassName}
      >
        <div className="relative">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">
                Cập nhật liên tục
              </span>
              <span className="hidden">
                Rail tự chuyển theo từng album để giữ nhịp khám phá nhẹ hơn.
              </span>
            </div>
            <div className="flex items-center gap-2">{albumRailAction}</div>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 top-12 z-10 hidden w-8 bg-gradient-to-r from-[#101010] to-transparent lg:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 top-12 z-10 hidden w-10 bg-gradient-to-l from-[#101010] to-transparent lg:block"
          />
          <div
            ref={newAlbumRailRef}
            onMouseEnter={() => pauseAutoScroll(newAlbumTimerRef)}
            onMouseLeave={() => startAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbums.length)}
            onTouchStart={() => pauseAutoScroll(newAlbumTimerRef)}
            onTouchEnd={() =>
              pauseAndResumeAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbumResumeRef, newAlbums.length)
            }
            className="home-feature-rail flex gap-4 overflow-x-auto pb-1 pr-6 scroll-smooth scrollbar-hidden sm:pr-8 lg:snap-x lg:snap-mandatory"
          >
            {loadingHome && !newAlbums.length
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    data-carousel-item
                    className="home-album-skeleton ui-skeleton h-[285px] w-[62vw] max-w-[216px] shrink-0 rounded-[22px] sm:w-[196px] lg:w-[208px] xl:w-[220px]"
                  />
                ))
              : newAlbums.map((album) => (
                  <Link
                    key={album.id}
                    to={getAlbumPath(album) || "/albums"}
                    data-carousel-item
                    className="home-album-card group w-[62vw] max-w-[216px] shrink-0 rounded-[22px] bg-[#18191a] p-3 shadow-[0_18px_42px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.035)] transition-colors duration-300 sm:w-[196px] lg:w-[208px] lg:snap-start xl:w-[220px] md:hover:bg-[#1d1f20]"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-[18px] bg-white/5">
                      <img
                        src={resolveAssetUrl(album.cover_url) || "/logo-brand.png"}
                        alt={album.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.6))]" />
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                          <FiDisc size={11} className="text-emerald-300" />
                          Mới
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
                          {formatReleaseDate(album.release_date)}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-200/80 transition-transform duration-300 md:group-hover:translate-x-0.5">
                          Nghe
                        </span>
                      </div>

                      <h3 className="truncate text-sm font-bold text-white sm:text-[15px]">
                        {album.title}
                      </h3>

                      <p className="truncate text-[12px] text-white/58">
                        {getArtistLabel(album, album.artist_name || album.artist?.name || "")}
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
