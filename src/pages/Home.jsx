import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiClock, FiPlay, FiRefreshCw } from "react-icons/fi";
import { getAlbums } from "../api/album.api";
import { getMyHistory } from "../api/history.api";
import { getArtistCollections } from "../api/artist.api";
import { getWeeklyTopSongs } from "../api/chart.api";
import { getRecommendations, getColdStartRecommendations } from "../api/recommendation.api";
import { getSongById } from "../api/song.api";
import AlbumCard from "../components/album/AlbumCard";
import ArtistAlbumCard from "../components/album/ArtistAlbumCard";
import ArtistNames from "../components/artist/ArtistNames";
import Section from "../components/section/Section";
import SongCard from "../components/song/SongCard";
import { SongDetailLink } from "../components/song/SongDetailLink";
import usePageMetadata from "../hooks/usePageMetadata";
import useAuthStore from "../store/auth.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import useRecommendationSessionStore from "../store/recommendation-session.store";
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
  buildWebSiteJsonLd,
} from "../utils/seo";

const HOME_HISTORY_LIMIT = 60;
const CONTINUE_SONGS_LIMIT = 5;
const RECOMMENDATION_DESKTOP_LIMIT = 9;
const RECOMMENDATION_TABLET_LIMIT = 8;
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

  const currentSong = usePlayerStore((state) => state.currentSong);
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
  const recommendationSessionUserId = user?.id ? String(user.id) : null;

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
      const recRes = seedSongId ? await getRecommendations(seedSongId) : await getColdStartRecommendations(30);
      const selectedIds = normalizeRecommendedIds(recRes?.data?.data || recRes?.data || []);

      if (selectedIds.length < RECOMMENDATION_DESKTOP_LIMIT) {
        const fallbackRes = await getColdStartRecommendations(50);
        for (const id of normalizeRecommendedIds(fallbackRes?.data?.data || fallbackRes?.data || [])) {
          if (!selectedIds.includes(id)) selectedIds.push(id);
          if (selectedIds.length >= 30) break;
        }
      }

      return fetchSongsByIds(selectedIds, RECOMMENDATION_DESKTOP_LIMIT);
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
    (historyItems = []) => {
      const historySeedIds = extractSeedSongIds(historyItems);
      const currentSeedId = normalizeSongId(currentSong);
      const usedSeedIds = recommendationSessionUserId
        ? getUsedRecommendationSeedIds(recommendationSessionUserId)
        : [];

      const unusedHistorySeedIds = historySeedIds.filter(
        (songId) => !usedSeedIds.includes(songId)
      );

      if (unusedHistorySeedIds.length) {
        return {
          seedSongId:
            unusedHistorySeedIds[
              Math.floor(Math.random() * unusedHistorySeedIds.length)
            ],
          resetUsedSeeds: false,
        };
      }

      if (currentSeedId && !usedSeedIds.includes(currentSeedId)) {
        return {
          seedSongId: currentSeedId,
          resetUsedSeeds: false,
        };
      }

      if (historySeedIds.length) {
        return {
          seedSongId:
            historySeedIds[Math.floor(Math.random() * historySeedIds.length)],
          resetUsedSeeds: true,
        };
      }

      return {
        seedSongId: currentSeedId,
        resetUsedSeeds: Boolean(currentSeedId && usedSeedIds.includes(currentSeedId)),
      };
    },
    [currentSong, getUsedRecommendationSeedIds, recommendationSessionUserId]
  );

  const loadHome = useCallback(async () => {
    try {
      setLoadingHome(true);
      setChartLoading(true);
      if (isAuthenticated) {
        setContinueLoading(true);
      }

      const [artistRes, albumRes, topRes, historyItems] = await Promise.all([
        getArtistCollections({ limit: 20 }),
        getAlbums({ limit: 20, sort: "release_date", order: "desc" }),
        getWeeklyTopSongs(),
        isAuthenticated ? loadUserHistory({ force: true }) : Promise.resolve([]),
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

      const firstHistorySongId = normalizeSongId(
        historyItems?.[0]?.song || historyItems?.[0]
      );
      const seed = isAuthenticated
        ? firstHistorySongId || normalizeSongId(currentSong)
        : null;
      const hasLoadedRecommendations = await loadRecommendations(seed, {
        silent: true,
      });
      if (hasLoadedRecommendations && seed) {
        rememberRecommendationSeed(seed);
      }
    } catch (error) {
      console.error("Load home error:", error);
    } finally {
      setLoadingHome(false);
      setContinueLoading(false);
      setChartLoading(false);
    }
  }, [
      currentSong,
      isAuthenticated,
      loadRecommendations,
      loadUserHistory,
      rememberRecommendationSeed,
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

  const scrollForwardWithLoop = useCallback((ref, distance) => {
    const node = ref.current;
    if (!node) return;
    const maxScroll = node.scrollWidth - node.clientWidth;
    if (maxScroll <= 0) return;
    const atEnd = Math.abs(node.scrollLeft - maxScroll) < 2;
    node.scrollTo({
      left: atEnd ? 0 : Math.min(node.scrollLeft + distance, maxScroll),
      behavior: "smooth",
    });
  }, []);

  const scrollByAmount = (ref, direction = 1) => {
    const node = ref.current;
    if (!node) return;
    const amount = node.clientWidth * 0.7;
    const maxScroll = node.scrollWidth - node.clientWidth;
    node.scrollTo({
      left: direction > 0 ? Math.min(node.scrollLeft + amount, maxScroll) : Math.max(node.scrollLeft - amount, 0),
      behavior: "smooth",
    });
  };

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
      timerRef.current = setInterval(() => {
        const node = ref.current;
        if (!node) return;
        scrollForwardWithLoop(ref, node.clientWidth * 0.65);
      }, 3500);
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
      buildCollectionPageJsonLd({
        name: "Trang chủ Khoaluan Music",
        description: homeMetaDescription,
        url: "/",
        image: featuredCover || "/logo-brand.png",
      }),
    ],
    [featuredCover, homeMetaDescription]
  );

  const reasonById = useMemo(() => {
    const map = new Map();
    const currentArtist = getArtistLabel(currentSong, "").toLowerCase();

    songs.forEach((song, index) => {
      const id = normalizeSongId(song);
      if (id === null) return;

      const artist = getArtistLabel(song, "").toLowerCase();
      let reason = "Khớp với gu nghe gần đây";

      if (currentArtist && artist && currentArtist === artist) reason = "Cùng nghệ sĩ với bài vừa nghe";
      else if (index <= 2) reason = "Đang nổi bật trong tuần";
      else if (song?.album_title) reason = `Từ album ${song.album_title}`;

      map.set(id, reason);
    });

    return map;
  }, [currentSong, songs]);

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
    const historyItems = await loadUserHistory({ force: true });
    const { seedSongId, resetUsedSeeds } = selectRecommendationSeed(historyItems);
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

  return (
    <div className="user-page-shell min-h-screen space-y-8 px-4 py-6 sm:space-y-12 sm:px-8">
      <section className="user-surface relative overflow-hidden p-6 sm:p-8">
        {featuredCover ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${featuredCover})` }}
            aria-hidden
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0b0b] via-[#0b0b0bcc] to-[#0b0b0b99]" aria-hidden />

        <div className="relative z-10 max-w-2xl space-y-4">
          {loadingHome && !featuredSong ? (
            <div className="space-y-3">
              <div className="ui-skeleton-line h-3 w-32" />
              <div className="ui-skeleton-line h-9 w-[70%] rounded-lg" />
            </div>
          ) : (
            <>
              <p className="user-heading-label">BÀI NHẠC NỔI BẬT</p>
              <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
                {featuredSong?.title || "Khám phá âm nhạc mỗi ngày"}
              </h1>
              <p className="text-sm text-white/70 sm:text-base">
                {featuredArtistLabel
                  ? `Từ ${featuredArtistLabel}. Cập nhật nhanh những bài hát phù hợp gu nghe của bạn.`
                  : "Luồng gợi ý được làm mới theo lịch sử nghe để bạn khám phá nhạc nhanh hơn."}
              </p>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={!featuredSong}
              onClick={() => featuredSong && playSong(featuredSong, songs)}
              className="user-btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold disabled:opacity-60"
            >
              <FiPlay />
              <span>Nghe ngay</span>
            </button>
            <button
              type="button"
              onClick={refreshRecommendations}
              disabled={recommendationLoading}
              className="user-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              <FiRefreshCw className={recommendationLoading ? "animate-spin" : ""} />
              {recommendationLoading ? "Đang làm mới..." : "Làm mới gợi ý"}
            </button>
          </div>
        </div>
      </section>

      <Section
        title="Tiếp tục nghe"
        subtitle="Theo hoạt động của bạn"
        action={
          isAuthenticated ? (
            <Link to="/history" className="user-btn-secondary px-3 py-1.5 text-[12px] font-semibold">
              Xem lịch sử
            </Link>
          ) : null
        }
      >
        {!isAuthenticated ? (
          <div className="rounded-[24px] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_36%),linear-gradient(135deg,#141414,#0d0d0d)] p-4 sm:p-5">
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
                  className="rounded-[20px] border border-white/10 bg-[#151515] p-3"
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
          <div className="rounded-[24px] border border-dashed border-white/12 bg-[linear-gradient(135deg,#151515,#101010)] p-4 sm:p-5">
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
                className="overflow-hidden rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_32%),linear-gradient(135deg,#151515,#101010)] p-3.5 transition-colors duration-200 md:hover:border-emerald-300/15 md:hover:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_34%),linear-gradient(135deg,#171717,#111111)] sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-white/5 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
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
                      className="mt-2 block truncate text-lg font-extrabold text-white transition md:hover:text-emerald-200 md:hover:underline sm:text-[1.35rem]"
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
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/82 transition md:hover:border-white/20 md:hover:bg-white/[0.1] md:hover:text-white"
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
                    className="rounded-[20px] border border-white/10 bg-[linear-gradient(135deg,#151515,#101010)] p-3 transition-colors duration-200 md:hover:border-white/16 md:hover:bg-[#171717]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/8 bg-white/5">
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
        action={
          <button
            onClick={refreshRecommendations}
            disabled={recommendationLoading}
            className="user-btn-secondary inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-[13px]"
          >
            <FiRefreshCw className={recommendationLoading ? "animate-spin" : ""} />
            {recommendationLoading ? "Đang làm mới..." : "Làm mới"}
          </button>
        }
      >
        {recommendationLoading && !songs.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {Array.from({ length: recommendationLimit }).map((_, idx) => (
              <div key={idx} className="ui-skeleton h-28 rounded-2xl border border-white/10" />
            ))}
          </div>
        ) : !songs.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-4 text-sm text-white/70">
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
        action={
          <Link to="/zing-chart" className="user-btn-secondary px-3 py-1.5 text-[12px] font-semibold">
            Mở MChart
          </Link>
        }
      >
        {chartLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="ui-skeleton h-14 rounded-xl border border-white/10" />
            ))}
          </div>
        ) : !weeklyTop.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-4 text-sm text-white/70">
            Chưa có dữ liệu top tuần.
          </div>
        ) : (
          <div className="space-y-2.5">
            {weeklyTop.map((song, index) => {
              const accentColor = TOP_WEEK_COLORS[index % TOP_WEEK_COLORS.length];
              return (
                <article
                  key={song.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] p-3 transition md:hover:border-white/20 md:hover:bg-[#1a1a1a]"
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
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/15">
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

      <Section title="Nghệ sĩ nổi bật" subtitle="Tuyển tập nổi bật">
        <div className="relative">
          <div
            ref={artistRailRef}
            onMouseEnter={() => pauseAutoScroll(artistTimerRef)}
            onMouseLeave={() => startAutoScroll(artistRailRef, artistTimerRef, artistAlbums.length)}
            className="flex gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth scrollbar-hidden"
          >
            {loadingHome && !artistAlbums.length
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="ui-skeleton h-60 w-44 shrink-0 rounded-2xl border border-white/10 sm:w-60 lg:w-64"
                  />
                ))
              : artistAlbums.map((artist) => (
                  <div key={artist.artist_id} className="w-44 shrink-0 sm:w-60 lg:w-64">
                    <ArtistAlbumCard artist={artist} />
                  </div>
                ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <button
              onClick={() => {
                scrollByAmount(artistRailRef, -1);
                pauseAndResumeAutoScroll(artistRailRef, artistTimerRef, artistResumeRef, artistAlbums.length);
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white/80 shadow-lg transition md:hover:border-white/30 md:hover:text-white sm:flex"
            >
              <FiChevronLeft />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={() => {
                scrollByAmount(artistRailRef, 1);
                pauseAndResumeAutoScroll(artistRailRef, artistTimerRef, artistResumeRef, artistAlbums.length);
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white/80 shadow-lg transition md:hover:border-white/30 md:hover:text-white sm:flex"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Album mới phát hành" subtitle="Ra mắt gần đây">
        <div className="relative">
          <div
            ref={newAlbumRailRef}
            onMouseEnter={() => pauseAutoScroll(newAlbumTimerRef)}
            onMouseLeave={() => startAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbums.length)}
            className="flex gap-4 overflow-x-auto pb-2 pr-10 scroll-smooth scrollbar-hidden"
          >
            {loadingHome && !newAlbums.length
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="ui-skeleton h-60 w-44 shrink-0 rounded-2xl border border-white/10 sm:w-60 lg:w-64"
                  />
                ))
              : newAlbums.map((album) => <AlbumCard key={album.id} album={album} />)}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1">
            <button
              onClick={() => {
                scrollByAmount(newAlbumRailRef, -1);
                pauseAndResumeAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbumResumeRef, newAlbums.length);
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white/80 shadow-lg transition md:hover:border-white/30 md:hover:text-white sm:flex"
            >
              <FiChevronLeft />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1">
            <button
              onClick={() => {
                scrollByAmount(newAlbumRailRef, 1);
                pauseAndResumeAutoScroll(newAlbumRailRef, newAlbumTimerRef, newAlbumResumeRef, newAlbums.length);
              }}
              className="pointer-events-auto hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#121212] text-white/80 shadow-lg transition md:hover:border-white/30 md:hover:text-white sm:flex"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
