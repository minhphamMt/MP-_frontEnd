import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaRegClock } from "react-icons/fa";
import { FiExternalLink, FiRefreshCw, FiTrendingUp } from "react-icons/fi";
import ReactECharts from "echarts-for-react";
import {
  getRegionCharts,
  getWeeklyTopSeries,
  getWeeklyTopSongs,
} from "../api/chart.api";
import { getSongById } from "../api/song.api";
import {
  fetchPlayableSong,
  filterPlayableSongs,
  formatDuration,
  hydrateSongArtists,
} from "../utils/song";
import { getArtistLabel } from "../utils/artist";
import usePlayerStore from "../store/player.store";
import OptimizedImage from "../components/common/OptimizedImage";
import { resolveAssetUrl } from "../utils/asset";
import ArtistNames from "../components/artist/ArtistNames";

const LINE_COLORS = ["#fbbf24", "#60a5fa", "#a78bfa", "#fb7185", "#f97316"];

const REGION_META = [
  { key: "vietnam", title: "Việt Nam", link: "/zing-chart/region/vietnam" },
  { key: "usuk", title: "US-UK", link: "/zing-chart/region/usuk" },
  { key: "kpop", title: "K-Pop", link: "/zing-chart/region/kpop" },
];

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const formatWeeklyDate = (rawDate) => {
  const parsed = rawDate ? new Date(rawDate) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return rawDate || "";
  return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatCompactNumber = (value = 0) => {
  const numeric = Number(value || 0);
  if (numeric >= 1_000_000) return `${(numeric / 1_000_000).toFixed(1)}M`;
  if (numeric >= 1_000) return `${(numeric / 1_000).toFixed(1)}K`;
  return `${numeric}`;
};

const getRankTheme = (rank) => {
  const map = {
    1: {
      number: "text-amber-300",
      chip: "border-amber-300/45 bg-amber-500/15 text-amber-100",
      bar: "bg-amber-300",
      cover: "border-amber-300/55",
      button:
        "border-amber-300/60 bg-amber-400/20 text-amber-200 md:hover:bg-amber-400/35",
      glow: "md:hover:border-amber-300/40 md:hover:bg-amber-500/8",
    },
    2: {
      number: "text-sky-300",
      chip: "border-sky-300/45 bg-sky-500/15 text-sky-100",
      bar: "bg-sky-300",
      cover: "border-sky-300/55",
      button:
        "border-sky-300/60 bg-sky-400/20 text-sky-200 md:hover:bg-sky-400/35",
      glow: "md:hover:border-sky-300/40 md:hover:bg-sky-500/8",
    },
    3: {
      number: "text-violet-300",
      chip: "border-violet-300/45 bg-violet-500/15 text-violet-100",
      bar: "bg-violet-300",
      cover: "border-violet-300/55",
      button:
        "border-violet-300/60 bg-violet-400/20 text-violet-200 md:hover:bg-violet-400/35",
      glow: "md:hover:border-violet-300/40 md:hover:bg-violet-500/8",
    },
    4: {
      number: "text-rose-300",
      chip: "border-rose-300/45 bg-rose-500/15 text-rose-100",
      bar: "bg-rose-300",
      cover: "border-rose-300/55",
      button:
        "border-rose-300/60 bg-rose-400/20 text-rose-200 md:hover:bg-rose-400/35",
      glow: "md:hover:border-rose-300/40 md:hover:bg-rose-500/8",
    },
    5: {
      number: "text-orange-300",
      chip: "border-orange-300/45 bg-orange-500/15 text-orange-100",
      bar: "bg-orange-300",
      cover: "border-orange-300/55",
      button:
        "border-orange-300/60 bg-orange-400/20 text-orange-200 md:hover:bg-orange-400/35",
      glow: "md:hover:border-orange-300/40 md:hover:bg-orange-500/8",
    },
  };
  return (
    map[rank] || {
      number: "text-white/75",
      chip: "border-white/20 bg-white/5 text-white/75",
      bar: "bg-white/35",
      cover: "border-white/20",
      button:
        "border-white/35 bg-white/10 text-white/80 md:hover:bg-white/20 md:hover:text-white",
      glow: "md:hover:border-white/20 md:hover:bg-white/6",
    }
  );
};

export default function ZingChart() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weeklySongs, setWeeklySongs] = useState([]);
  const [weeklySeries, setWeeklySeries] = useState([]);
  const [isChartHovered, setIsChartHovered] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [syncedRowsHeight, setSyncedRowsHeight] = useState(null);
  const [regionCharts, setRegionCharts] = useState({
    vietnam: [],
    usuk: [],
    kpop: [],
  });
  const weeklyListCardRef = useRef(null);
  const weeklyRowsRef = useRef(null);
  const chartRef = useRef(null);
  const autoHoverTimerRef = useRef(null);
  const { playSong } = usePlayerStore();

  const getSongCover = useCallback(
    (song) =>
      resolveAssetUrl(
        song?.cover_url ||
          song?.thumbnail_m ||
          song?.thumbnail ||
          song?.image_url ||
          song?.image ||
          ""
      ),
    []
  );

  const getSongMetric = useCallback(
    (song) =>
      Number(
        song?.score ?? song?.weekly_play_count ?? song?.play_count ?? song?.plays ?? 0
      ) || 0,
    []
  );

  const loadChart = useCallback(async () => {
    setLoading(true);
    try {
      const [weeklyRes, weeklySeriesRes, regionRes] = await Promise.all([
        getWeeklyTopSongs(),
        getWeeklyTopSeries(),
        getRegionCharts({ limit: 5 }),
      ]);

      const topWeekly = filterPlayableSongs(
        toArray(weeklyRes?.data?.data || weeklyRes?.data)
      ).slice(0, 5);
      const seriesPayload = toArray(
        weeklySeriesRes?.data?.data || weeklySeriesRes?.data
      );
      const regionPayloadRaw = regionRes?.data?.data || regionRes?.data || {};
      const normalizedRegions = {
        vietnam: filterPlayableSongs(
          toArray(regionPayloadRaw.vietnam || regionPayloadRaw.vn)
        ).slice(0, 5),
        usuk: filterPlayableSongs(
          toArray(regionPayloadRaw.usuk || regionPayloadRaw.us_uk)
        ).slice(0, 5),
        kpop: filterPlayableSongs(
          toArray(regionPayloadRaw.kpop || regionPayloadRaw.k_pop)
        ).slice(0, 5),
      };

      const [hydratedWeekly, hydratedVietnam, hydratedUsuk, hydratedKpop] =
        await Promise.all([
          hydrateSongArtists(topWeekly, getSongById),
          hydrateSongArtists(normalizedRegions.vietnam, getSongById),
          hydrateSongArtists(normalizedRegions.usuk, getSongById),
          hydrateSongArtists(normalizedRegions.kpop, getSongById),
        ]);

      setWeeklySongs(hydratedWeekly);
      setWeeklySeries(seriesPayload);
      setRegionCharts({
        vietnam: hydratedVietnam,
        usuk: hydratedUsuk,
        kpop: hydratedKpop,
      });
    } catch (error) {
      console.error("Load MinhChart failed", error);
      setWeeklySongs([]);
      setWeeklySeries([]);
      setRegionCharts({ vietnam: [], usuk: [], kpop: [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (viewportWidth < 1280) {
      setSyncedRowsHeight(null);
      return undefined;
    }

    const target = weeklyRowsRef.current;
    if (!target) return undefined;

    const syncHeight = () => {
      const nextHeight = Math.round(target.getBoundingClientRect().height || 0);
      if (!nextHeight) return;
      setSyncedRowsHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    syncHeight();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", syncHeight);
      return () => window.removeEventListener("resize", syncHeight);
    }

    const observer = new ResizeObserver(() => {
      syncHeight();
    });
    observer.observe(target);

    return () => observer.disconnect();
  }, [viewportWidth, loading, weeklySongs, regionCharts]);

  const weeklyLineData = useMemo(() => {
    if (!weeklySongs.length || !weeklySeries.length) {
      return { categories: [], series: [], minValue: 0, maxValue: 0 };
    }

    const allowedSongIds = new Set(weeklySongs.map((song) => song.id));
    const groupedBySong = new Map();
    const allDates = new Set();

    weeklySeries.forEach((entry) => {
      const songId = entry?.song_id || entry?.songId || entry?.id;
      if (!allowedSongIds.has(songId)) return;
      const rawDate = entry?.date || entry?.period_start || entry?.periodStart;
      if (!rawDate) return;

      const count =
        Number(entry?.play_count ?? entry?.plays ?? entry?.playCount ?? 0) || 0;
      const bySong = groupedBySong.get(songId) || new Map();
      bySong.set(rawDate, count);
      groupedBySong.set(songId, bySong);
      allDates.add(rawDate);
    });

    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const allValues = [];
    const series = weeklySongs.map((song, index) => {
      const map = groupedBySong.get(song.id) || new Map();
      const values = sortedDates.map((rawDate) => map.get(rawDate) || 0);
      allValues.push(...values);
      return {
        name: song.title,
        song,
        color: LINE_COLORS[index % LINE_COLORS.length],
        values,
      };
    });

    const minValue = allValues.length ? Math.min(...allValues) : 0;
    const maxValue = allValues.length ? Math.max(...allValues) : 0;

    return {
      categories: sortedDates.map((rawDate) => formatWeeklyDate(rawDate)),
      series,
      minValue,
      maxValue,
    };
  }, [weeklySeries, weeklySongs]);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth < 1024;
  const isVerySmall = viewportWidth < 460;
  const isDesktopTwoColumn = viewportWidth >= 1280;
  const showChartLegend = viewportWidth >= 1280;
  const mobileLabelInterval = isMobile
    ? Math.max(0, Math.ceil(weeklyLineData.categories.length / 4) - 1)
    : 0;
  const chartHeightClass = isMobile
    ? "h-[238px]"
    : isTablet
      ? "h-[300px]"
      : "h-[420px]";
  const chartContainerStyle =
    isDesktopTwoColumn && syncedRowsHeight ? { height: `${syncedRowsHeight}px` } : undefined;

  const weeklyLineOption = useMemo(() => {
    if (!weeklyLineData.categories.length || !weeklyLineData.series.length) {
      return null;
    }

    const minBound = Math.max(0, Math.floor(weeklyLineData.minValue - 1));
    const maxBound = Math.max(
      minBound + 3,
      Math.ceil(weeklyLineData.maxValue + 1)
    );

    return {
      backgroundColor: "transparent",
      color: weeklyLineData.series.map((item) => item.color),
      animationDuration: isMobile ? 300 : 500,
      grid: {
        top: showChartLegend ? 58 : 24,
        right: isMobile ? 10 : 20,
        bottom: isMobile ? 30 : 40,
        left: isMobile ? 36 : isTablet ? 46 : 56,
      },
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: "transparent",
        borderWidth: 0,
        padding: 0,
        formatter: (params) => {
          const seriesItem = weeklyLineData.series?.[params.seriesIndex];
          const song = seriesItem?.song || {};
          const accentColor = seriesItem?.color || "#ffffff";
          const cover = getSongCover(song);
          const dateLabel = weeklyLineData.categories?.[params.dataIndex] || "";
          const plays = Number(params.data || 0);
          const artist = getArtistLabel(song, "Không rõ nghệ sĩ");
          const title = song?.title || params.seriesName || "Bài hát";
          const compactTooltip = isMobile;
          const tooltipMinWidth = compactTooltip ? 168 : 250;
          const tooltipMaxWidth = compactTooltip ? 198 : 290;
          const tooltipRadius = compactTooltip ? 12 : 14;
          const mediaSize = compactTooltip ? 36 : 50;
          const headerGap = compactTooltip ? 8 : 10;
          const headerPadding = compactTooltip ? "8px 9px" : "10px 12px";
          const titleFontSize = compactTooltip ? 12 : 13;
          const artistFontSize = compactTooltip ? 10 : 11;
          const rowPadding = compactTooltip ? "7px 9px" : "9px 12px";
          const rowFontSize = compactTooltip ? 10 : 11;

          return `
            <div style="
              min-width:${tooltipMinWidth}px;
              max-width:${tooltipMaxWidth}px;
              border:1px solid rgba(255,255,255,.14);
              border-radius:${tooltipRadius}px;
              background:#101010;
              box-shadow:${compactTooltip ? "0 10px 26px rgba(0,0,0,.55)" : "0 18px 45px rgba(0,0,0,.6)"};
              overflow:hidden;
            ">
              <div style="display:flex;gap:${headerGap}px;padding:${headerPadding};border-bottom:1px solid rgba(255,255,255,.08)">
                <div style="height:${mediaSize}px;width:${mediaSize}px;flex-shrink:0;overflow:hidden;border-radius:${compactTooltip ? 8 : 10}px;background:#1d1d1d">
                  ${
                    cover
                      ? `<img src="${cover}" alt="${escapeHtml(
                          title
                        )}" style="height:100%;width:100%;object-fit:cover" />`
                      : ""
                  }
                </div>
                <div style="min-width:0">
                  <div style="font-size:${titleFontSize}px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(
                    title
                  )}</div>
                  <div style="margin-top:2px;font-size:${artistFontSize}px;color:rgba(255,255,255,.68);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(
                    artist
                  )}</div>
                </div>
              </div>
              <div style="padding:${rowPadding};font-size:${rowFontSize}px;color:rgba(255,255,255,.76);display:flex;justify-content:space-between;gap:12px">
                <span>Ngày ${escapeHtml(dateLabel)}</span>
                <span style="font-weight:700;color:${accentColor}">${plays.toLocaleString(
                  "vi-VN"
                )} lượt</span>
              </div>
            </div>
          `;
        },
      },
      legend: showChartLegend
        ? {
            top: 0,
            type: "scroll",
            icon: "circle",
            itemWidth: 9,
            itemHeight: 9,
            textStyle: { color: "rgba(255,255,255,0.72)", fontSize: 11 },
          }
        : { show: false },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: weeklyLineData.categories,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.25)" } },
        axisLabel: {
          color: "rgba(255,255,255,0.62)",
          fontSize: isMobile ? 10 : 11,
          margin: isMobile ? 10 : 14,
          interval: mobileLabelInterval,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        min: minBound,
        max: maxBound,
        minInterval: 1,
        splitNumber: isMobile ? 3 : 5,
        axisLabel: {
          color: "rgba(255,255,255,0.62)",
          fontSize: isMobile ? 10 : 11,
          formatter: (value) => value.toLocaleString("vi-VN"),
        },
        splitLine: {
          lineStyle: { color: "rgba(255,255,255,0.1)", type: "dashed" },
        },
      },
      series: weeklyLineData.series.map((item) => ({
        name: item.name,
        type: "line",
        smooth: 0.3,
        data: item.values,
        symbol: "circle",
        symbolSize: isMobile ? 5 : 8,
        showSymbol: !isMobile,
        lineStyle: {
          width: isMobile ? 2.5 : 3.5,
          color: item.color,
          shadowColor: item.color,
          shadowBlur: isMobile ? 4 : 10,
        },
        areaStyle: {
          opacity: isMobile ? 0.08 : 0.12,
          color: item.color,
        },
        itemStyle: {
          color: item.color,
          borderColor: "#ffffff",
          borderWidth: 1.5,
        },
        emphasis: {
          focus: "series",
          scale: !isMobile,
          itemStyle: { borderWidth: 2, borderColor: "#ffffff" },
        },
      })),
    };
  }, [
    getSongCover,
    isMobile,
    isTablet,
    mobileLabelInterval,
    showChartLegend,
    weeklyLineData,
  ]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChart();
  };

  const handleChartReady = useCallback((instance) => {
    chartRef.current = instance || null;
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    const hasSeries = weeklyLineData.series.length > 0;
    const hasCategories = weeklyLineData.categories.length > 0;

    if (
      !chart ||
      typeof chart.dispatchAction !== "function" ||
      !hasSeries ||
      !hasCategories ||
      isChartHovered ||
      loading
    ) {
      return undefined;
    }

    if (autoHoverTimerRef.current) {
      clearInterval(autoHoverTimerRef.current);
      autoHoverTimerRef.current = null;
    }

    let currentSeries = 0;
    let currentPoint = 0;

    const safeDispatch = (payload) => {
      try {
        chart.dispatchAction(payload);
      } catch {
        // Ignore ECharts dispatch errors to avoid crashing page render.
      }
    };

    const downplayAll = () => {
      weeklyLineData.series.forEach((_, seriesIndex) => {
        safeDispatch({
          type: "downplay",
          seriesIndex,
        });
      });
    };

    const runStep = () => {
      if (!chartRef.current || chartRef.current !== chart) return;
      downplayAll();
      safeDispatch({
        type: "highlight",
        seriesIndex: currentSeries,
        dataIndex: currentPoint,
      });
      safeDispatch({
        type: "showTip",
        seriesIndex: currentSeries,
        dataIndex: currentPoint,
      });

      currentPoint += 1;
      if (currentPoint >= weeklyLineData.categories.length) {
        currentPoint = 0;
        currentSeries = (currentSeries + 1) % weeklyLineData.series.length;
      }
    };

    runStep();
    autoHoverTimerRef.current = setInterval(runStep, isMobile ? 1800 : 1400);

    return () => {
      if (autoHoverTimerRef.current) {
        clearInterval(autoHoverTimerRef.current);
        autoHoverTimerRef.current = null;
      }
      downplayAll();
      safeDispatch({ type: "hideTip" });
    };
  }, [isChartHovered, isMobile, loading, weeklyLineData]);

  useEffect(
    () => () => {
      if (autoHoverTimerRef.current) {
        clearInterval(autoHoverTimerRef.current);
        autoHoverTimerRef.current = null;
      }
    },
    []
  );

  const handlePlay = async (song, queue) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;
    const normalizedId = playable?.id;
    const updatedQueue = queue.map((item) =>
      item?.id === normalizedId ? { ...item, ...playable } : item
    );
    playSong(playable, updatedQueue);
  };

  const topMetric = useMemo(() => {
    const max = Math.max(...weeklySongs.map((song) => getSongMetric(song)), 0);
    return max || 1;
  }, [getSongMetric, weeklySongs]);

  return (
    <div className="user-page-shell min-h-screen w-full min-w-0 space-y-6 overflow-x-hidden px-4 py-6 pb-28 sm:space-y-8 sm:px-8 sm:pb-8">
      <div className="user-surface w-full min-w-0 overflow-x-hidden p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">
              Dữ liệu top nhạc trong tuần
            </p>
            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">
              MChart
            </h1>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="user-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold disabled:opacity-60"
          >
            <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Đang cập nhật..." : "Làm mới dữ liệu"}
          </button>
        </div>

        <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)]">
          <div
            className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-4 sm:p-5 xl:flex xl:flex-col"
          >
            <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">
                  Weekly Trend
                </p>
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  Xu hướng top tuần
                </p>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/70 ${
                  isVerySmall ? "hidden" : ""
                }`}
              >
                <FiTrendingUp className="text-sky-300" />
                {weeklySongs.length} bài hát
              </span>
            </div>

            <div className="min-h-0 xl:flex-1">
              {loading ? (
                <div
                  className={`${chartHeightClass} rounded-2xl border border-white/10 bg-[#101010] p-4 text-sm text-white/60`}
                  style={chartContainerStyle}
                >
                  Đang tải biểu đồ...
                </div>
              ) : weeklyLineOption ? (
                <div
                  className={`${chartHeightClass} min-w-0 overflow-hidden`}
                  style={chartContainerStyle}
                  onMouseEnter={() => setIsChartHovered(true)}
                  onMouseLeave={() => setIsChartHovered(false)}
                >
                  <ReactECharts
                    option={weeklyLineOption}
                    style={{ height: "100%", width: "100%", minWidth: 0 }}
                    onChartReady={handleChartReady}
                    notMerge
                    lazyUpdate
                  />
                </div>
              ) : (
                <div
                  className={`${chartHeightClass} rounded-2xl border border-white/10 bg-[#101010] p-4 text-sm text-white/60`}
                  style={chartContainerStyle}
                >
                  Chưa có dữ liệu biểu đồ.
                </div>
              )}
            </div>
          </div>

          <div
            ref={weeklyListCardRef}
            className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-4 sm:p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-white sm:text-lg">
                Top 5 bài hát tuần
              </h2>
              <span className={`text-xs text-white/50 ${isVerySmall ? "hidden" : ""}`}>
                Cập nhật mới
              </span>
            </div>

            <div ref={weeklyRowsRef} className="space-y-2.5">
              {loading && (
                <div className="text-sm text-white/60">Đang tải bảng xếp hạng...</div>
              )}
              {!loading && !weeklySongs.length && (
                <div className="text-sm text-white/60">
                  Chưa có dữ liệu bảng xếp hạng.
                </div>
              )}

              {!loading &&
                weeklySongs.map((song, index) => {
                  const rank = index + 1;
                  const theme = getRankTheme(rank);
                  const metric = getSongMetric(song);
                  const widthPercent = Math.max(
                    8,
                    Math.min(100, (metric / topMetric) * 100)
                  );

                  return (
                    <div
                      key={song.id || index}
                      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] px-3 py-2.5 transition-all duration-200 md:hover:-translate-y-0.5 ${theme.glow}`}
                    >
                      <div className="absolute bottom-0 left-0 h-[2px] bg-white/15" />
                      <div
                        className={`absolute bottom-0 left-0 h-[2px] ${theme.bar}`}
                        style={{ width: `${widthPercent}%` }}
                      />

                      <div className="relative flex items-center gap-3">
                        <div
                          className={`w-8 text-center text-lg font-black leading-none ${theme.number}`}
                        >
                          {rank}
                        </div>
                        <div
                          className={`h-11 w-11 shrink-0 overflow-hidden rounded-lg border ${theme.cover}`}
                        >
                          <OptimizedImage
                            src={getSongCover(song)}
                            alt={song.title}
                            className="h-full w-full object-cover transition duration-300 md:group-hover:scale-110"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white sm:text-base">
                            {song.title}
                          </p>
                          <p className="truncate text-xs text-white/60">
                            <ArtistNames
                              item={song}
                              fallback="Nghệ sĩ"
                              linkClassName="inline-block transition md:hover:text-white md:hover:underline"
                            />
                          </p>
                        </div>

                        <span
                          className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline-flex ${theme.chip}`}
                        >
                          {formatCompactNumber(metric)}
                        </span>

                        <span className="hidden items-center gap-1 text-xs text-white/55 sm:inline-flex">
                          <FaRegClock size={11} />
                          {formatDuration(song.duration)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handlePlay(song, weeklySongs)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full border transition md:hover:scale-105 ${theme.button}`}
                          aria-label={`Phát ${song.title}`}
                        >
                          <FaPlay size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="user-surface w-full min-w-0 overflow-x-hidden p-4 sm:p-6">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/50">
            Top 5 ca khúc nổi bật theo từng thị trường
          </p>
          <h2 className="mt-1 text-2xl font-black text-white sm:text-4xl">
            BXH theo khu vực
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {REGION_META.map((region) => {
            const songs = regionCharts[region.key] || [];
            const topRegionMetric = Math.max(
              ...songs.map((song) => getSongMetric(song)),
              0
            ) || 1;
            return (
              <div
                key={region.key}
                className="min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-4 sm:p-5"
              >
                <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
                  <h3 className="min-w-0 truncate text-xl font-black text-white sm:text-2xl">
                    {region.title}
                  </h3>
                  <Link
                    to={region.link}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] whitespace-nowrap text-white/75 transition md:hover:border-sky-300/45 md:hover:text-sky-300 sm:px-3 sm:text-xs"
                  >
                    Xem tất cả
                    <FiExternalLink size={12} className="hidden sm:inline-block" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {loading && (
                    <div className="text-sm text-white/60">
                      Đang tải dữ liệu khu vực...
                    </div>
                  )}
                  {!loading && !songs.length && (
                    <div className="text-sm text-white/60">Chưa có dữ liệu.</div>
                  )}

                  {!loading &&
                    songs.map((song, index) => {
                      const rank = index + 1;
                      const theme = getRankTheme(rank);
                      const metric = getSongMetric(song);
                      const widthPercent = Math.max(
                        8,
                        Math.min(100, (metric / topRegionMetric) * 100)
                      );

                      return (
                        <div
                          key={song.id || `${region.key}-${index}`}
                          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] px-3 py-2.5 transition-all duration-200 md:hover:-translate-y-0.5 ${theme.glow}`}
                        >
                          <div className="absolute bottom-0 left-0 h-[2px] bg-white/15" />
                          <div
                            className={`absolute bottom-0 left-0 h-[2px] ${theme.bar}`}
                            style={{ width: `${widthPercent}%` }}
                          />
                          <div className="relative flex items-center gap-3">
                            <span
                              className={`w-8 text-center text-lg font-black leading-none ${theme.number}`}
                            >
                              {rank}
                            </span>
                            <div
                              className={`h-11 w-11 shrink-0 overflow-hidden rounded-lg border ${theme.cover}`}
                            >
                              <OptimizedImage
                                src={getSongCover(song)}
                                alt={song.title}
                                className="h-full w-full object-cover transition duration-300 md:group-hover:scale-110"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white sm:text-base">
                                {song.title}
                              </p>
                              <p className="truncate text-xs text-white/60">
                                <ArtistNames
                                  item={song}
                                  fallback="Nghệ sĩ"
                                  linkClassName="inline-block transition md:hover:text-white md:hover:underline"
                                />
                              </p>
                            </div>
                            <span
                              className={`hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline-flex ${theme.chip}`}
                            >
                              {formatCompactNumber(metric)}
                            </span>
                            <span className="hidden items-center gap-1 text-xs text-white/55 sm:inline-flex">
                              <FaRegClock size={11} />
                              {formatDuration(song.duration)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePlay(song, songs)}
                              className={`flex h-8 w-8 items-center justify-center rounded-full border transition md:hover:scale-105 ${theme.button}`}
                              aria-label={`Phát ${song.title}`}
                            >
                              <FaPlay size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
