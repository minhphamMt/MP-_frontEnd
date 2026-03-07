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
import useAuthStore from "../store/auth.store";
import usePlayerStore, { normalizeSongId } from "../store/player.store";
import { filterPlayableSongs, fetchPlayableSong, toPlayableSong } from "../utils/song";
import { resolveAssetUrl } from "../utils/asset";
import { getArtistLabel } from "../utils/artist";

const HISTORY_LIMIT = 10;
const HOME_HISTORY_LIMIT = 20;
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

const progressPercent = (item, fallbackDuration = 0) => {
  const ratio = Number(item?.progress_ratio ?? item?.progress_percent ?? item?.progress ?? 0);
  if (ratio > 0) return Math.min(100, Math.max(0, Math.round(ratio > 1 ? ratio : ratio * 100)));

  const listened = Number(item?.listened_seconds ?? item?.current_time ?? item?.position ?? 0) || 0;
  const duration = Number(item?.duration ?? item?.song?.duration ?? fallbackDuration ?? 0) || 0;
  if (!listened || !duration) return 0;
  return Math.min(100, Math.max(0, Math.round((listened / duration) * 100)));
};

const dedupeSongIds = (items = []) => {
  const seen = new Set();
  return items.filter((item) => {
    const id = normalizeSongId(item);
    if (id === null || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchSongsByIds = useCallback(async (ids = [], limit = 9) => {
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
  }, []);

  const fetchRecommendedSongs = useCallback(
    async (seedSongId) => {
      const recRes = seedSongId ? await getRecommendations(seedSongId) : await getColdStartRecommendations(30);
      const selectedIds = normalizeRecommendedIds(recRes?.data?.data || recRes?.data || []);

      if (selectedIds.length < 9) {
        const fallbackRes = await getColdStartRecommendations(50);
        for (const id of normalizeRecommendedIds(fallbackRes?.data?.data || fallbackRes?.data || [])) {
          if (!selectedIds.includes(id)) selectedIds.push(id);
          if (selectedIds.length >= 30) break;
        }
      }

      return fetchSongsByIds(selectedIds, 9);
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
      } catch (error) {
        console.error("Load recommendations error:", error);
      } finally {
        if (!silent) setRecommendationLoading(false);
      }
    },
    [fetchRecommendedSongs]
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
        const normalized = dedupeSongIds(
          historyItems
            .map((item) => {
              const song = toPlayableSong(item?.song || item);
              if (!song?.id) return null;
              return {
                ...song,
                listened_at: item?.listened_at || item?.listen_time || item?.created_at,
                progressPercent: progressPercent(item, song.duration),
              };
            })
            .filter(Boolean)
        ).slice(0, 8);

        setContinueSongs(normalized);
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

      const firstHistorySongId = normalizeSongId(historyItems?.[0]?.song || historyItems?.[0]);
      const seed = isAuthenticated ? firstHistorySongId || normalizeSongId(currentSong) : null;
      await loadRecommendations(seed, { silent: true });
    } catch (error) {
      console.error("Load home error:", error);
    } finally {
      setLoadingHome(false);
      setContinueLoading(false);
      setChartLoading(false);
    }
  }, [currentSong, isAuthenticated, loadRecommendations, loadUserHistory]);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    loadHome();
  }, [loadHome]);

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
  const weeklyQueue = useMemo(() => weeklyTop.map((song) => ({ ...song })), [weeklyTop]);
  const maxTopMetric = Math.max(...weeklyTop.map((song) => Number(song?.metric || 0)), 1);

  const refreshRecommendations = async () => {
    const historyItems = await loadUserHistory();
    const randomItem = historyItems.length
      ? historyItems[Math.floor(Math.random() * historyItems.length)]
      : null;
    const seedSongId =
      normalizeSongId(randomItem?.song || randomItem) ||
      normalizeSongId(historyItems?.[0]?.song || historyItems?.[0]) ||
      normalizeSongId(currentSong);
    await loadRecommendations(seedSongId);
  };

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
              <div className="h-3 w-32 animate-pulse rounded-full bg-white/15" />
              <div className="h-9 w-[70%] animate-pulse rounded-lg bg-white/20" />
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
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-4 text-sm text-white/70">
            Đăng nhập để lưu tiến độ nghe và tiếp tục bài hát mọi lúc.
            <Link to="/login" className="ml-2 font-semibold text-emerald-300 md:hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        ) : continueLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-[#151515] p-3">
                <div className="h-14 animate-pulse rounded-xl bg-white/10" />
              </div>
            ))}
          </div>
        ) : !continueSongs.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-4 text-sm text-white/70">
            Chưa có bài nào để tiếp tục nghe.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {continueSongs.map((song) => (
              <article
                key={song.id}
                className="group rounded-2xl border border-white/10 bg-[#151515] p-3 transition md:hover:border-white/20 md:hover:bg-[#1a1a1a]"
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                    <img
                      src={resolveAssetUrl(song.cover_url)}
                      alt={song.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{song.title}</p>
                    <ArtistNames
                      item={song}
                      stopPropagation
                      className="truncate text-xs text-white/60"
                      linkClassName="transition md:hover:text-emerald-300 md:hover:underline"
                    />
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/50">
                      <FiClock size={11} />
                      {formatRelativeTime(song.listened_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const playable = (await fetchPlayableSong(song, getSongById)) || song;
                      if (playable?.id) playSong(playable, continueQueue);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300/45 bg-emerald-500/20 text-emerald-200 transition md:hover:scale-105 md:hover:bg-emerald-500/35"
                    aria-label={`Phát ${song.title}`}
                  >
                    <FiPlay size={14} />
                  </button>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-300"
                    style={{ width: `${Math.max(6, song.progressPercent || 0)}%` }}
                  />
                </div>
              </article>
            ))}
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
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-[#151515]" />
            ))}
          </div>
        ) : !songs.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#151515] p-4 text-sm text-white/70">
            Chưa có bài hát phù hợp, hãy làm mới gợi ý.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {songs.map((song) => (
              <div key={song.id} className="space-y-1.5">
                <SongCard song={song} queue={songs} />
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
              <div key={idx} className="h-14 animate-pulse rounded-xl border border-white/10 bg-[#151515]" />
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
                      <p className="truncate text-sm font-semibold text-white sm:text-base">{song.title}</p>
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
                    className="h-60 w-44 shrink-0 animate-pulse rounded-2xl border border-white/10 bg-[#151515] sm:w-60 lg:w-64"
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
                    className="h-60 w-44 shrink-0 animate-pulse rounded-2xl border border-white/10 bg-[#151515] sm:w-60 lg:w-64"
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
