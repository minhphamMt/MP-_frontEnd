import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaRegClock } from "react-icons/fa";
import {
  getRegionCharts,
  getWeeklyTopSeries,
  getWeeklyTopSongs,
} from "../api/chart.api";
import {
  formatDuration,
  filterPlayableSongs,
  fetchPlayableSong,
} from "../utils/song";
import { getSongById } from "../api/song.api";
import usePlayerStore from "../store/player.store";
import Section from "../components/section/Section";
import OptimizedImage from "../components/common/OptimizedImage";

const CHART_WIDTH = 820;
const CHART_HEIGHT = 240;
const CHART_PADDING_X = 24;

const formatWeeklyDate = (dateStr) => {
  const parsed = dateStr ? new Date(dateStr) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return dateStr || "";

  return parsed.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
};

const buildPath = (values, width, height, scaleMax, paddingX = 0) => {
  if (!values.length) return "";

  const maxValue = scaleMax ?? Math.max(...values);
  const xStep =
    values.length > 1 ? (width - paddingX * 2) / (values.length - 1) : width;

  const points = values.map((value, idx) => {
    const x = Math.round(paddingX + idx * xStep);
    const y = Math.round(height - (value / (maxValue || 1)) * (height * 0.85));
    return [x, Math.max(12, y)];
  });

  return points
    .map((point, idx) => `${idx === 0 ? "M" : "L"}${point[0]},${point[1]}`)
    .join(" ");
};

const colors = [
  {
    main: "#4dd1ff",
    glow: "rgba(77, 209, 255, 0.15)",
  },
  {
    main: "#ff6bca",
    glow: "rgba(255, 107, 202, 0.12)",
  },
  {
    main: "#6fff8c",
    glow: "rgba(111, 255, 140, 0.12)",
  },
  {
    main: "#ffd166",
    glow: "rgba(255, 209, 102, 0.12)",
  },
  {
    main: "#9b8cff",
    glow: "rgba(155, 140, 255, 0.12)",
  },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const computeMedian = (values) => {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
};

const toSeed = (seedSource) => {
  const text = `${seedSource || "seed"}`;
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) + 1;
};

const seededNoise = (seed) => {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

const toDateKey = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const buildWeekDates = (referenceDate) => {
  const base = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  const safe = Number.isNaN(base.getTime()) ? new Date() : base;
  const dates = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(safe);
    day.setDate(safe.getDate() - offset);
    dates.push(day);
  }
  return dates;
};

const buildWeeklySeries = (rawPoints, seriesSeed, config = {}) => {
  const points = Array.isArray(rawPoints) ? [...rawPoints] : [];
  points.sort((a, b) => {
    const aTime = a.rawDate ? new Date(a.rawDate).getTime() : 0;
    const bTime = b.rawDate ? new Date(b.rawDate).getTime() : 0;
    return aTime - bTime;
  });

  const {
    index = 0,
    count = 5,
    base = 58,
    amplitude = 6,
    globalMedian = 0,
    localAverage = 0,
  } = config;

  const lastPoint = points[points.length - 1];
  const referenceDate = lastPoint?.rawDate || lastPoint?.date || new Date();
  const weekDates = buildWeekDates(referenceDate);

  const localFactor = Math.log10((localAverage || globalMedian || base) + 1);
  const globalFactor = Math.log10((globalMedian || base) + 1);
  const localOffset = clamp((localFactor - globalFactor) * 6, -4, 4);

  const midIndex = Math.round((count - 1) / 2);
  const rankOffset = clamp((midIndex - index) * 2, -6, 6);
  const biasSeed = toSeed(`${seriesSeed}-bias`);
  const bias = (seededNoise(biasSeed) - 0.5) * 4;

  const center = clamp(base + rankOffset + localOffset + bias, base - 10, base + 10);
  const ampSeed = toSeed(`${seriesSeed}-amp`);
  const amp = clamp(
    amplitude * (0.85 + seededNoise(ampSeed) * 0.3),
    amplitude * 0.7,
    amplitude * 1.3
  );

  const phaseSeed = toSeed(`${seriesSeed}-phase`);
  const phase = ((phaseSeed % 360) * Math.PI) / 180;
  const phase2 = (((phaseSeed >> 1) % 360) * Math.PI) / 180;

  return weekDates.map((date, dayIndex) => {
    const key = toDateKey(date);
    const noise = seededNoise(toSeed(`${seriesSeed}-${key}`)) - 0.5;
    const wave =
      Math.sin(phase + dayIndex * 1.05) +
      0.45 * Math.sin(phase2 + dayIndex * 2.1);
    const nextValue = Math.max(
      1,
      Math.round(center + amp * wave + amp * 0.25 * noise)
    );

    return {
      date: formatWeeklyDate(date.toISOString()),
      rawDate: date.toISOString(),
      plays: nextValue,
    };
  });
};

export default function ZingChart() {
  const [songs, setSongs] = useState([]);
  const [weeklySongs, setWeeklySongs] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [regionCharts, setRegionCharts] = useState({
    vietnam: [],
    usuk: [],
    kpop: [],
  });
  const [chartSize, setChartSize] = useState(null);
   const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const { playSong } = usePlayerStore();
  const chartRef = useRef(null);

  const chartWidth = chartSize?.width || CHART_WIDTH;
  const chartHeight = CHART_HEIGHT + 20;
  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };
  const loadChart = async () => {
    try {
      setLoading(true);
      setLoadingSeries(true);
      setLoadingWeekly(true);
      setLoadingRegions(true);

      const [weeklyRes, regionRes, weeklySeriesRes] = await Promise.all([
        getWeeklyTopSongs(),
        getRegionCharts({ limit: 5 }),
        getWeeklyTopSeries(),
      ]);


      const regionPayloadRaw = regionRes?.data?.data || regionRes?.data || {};
      const normalizedRegions = {
        vietnam: toArray(regionPayloadRaw.vietnam || regionPayloadRaw.vn),
        usuk: toArray(regionPayloadRaw.usuk || regionPayloadRaw.us_uk),
        kpop: toArray(regionPayloadRaw.kpop || regionPayloadRaw.k_pop),
      };

      setRegionCharts({
        vietnam: filterPlayableSongs(normalizedRegions.vietnam),
        usuk: filterPlayableSongs(normalizedRegions.usuk),
        kpop: filterPlayableSongs(normalizedRegions.kpop),
      });
          const weeklyPayload = toArray(weeklyRes?.data?.data || weeklyRes?.data);
      const weeklySeriesPayload = toArray(
        weeklySeriesRes?.data?.data || weeklySeriesRes?.data
      );

      const normalizedWeekly = filterPlayableSongs(weeklyPayload).slice(0, 5);

      const seriesMap = weeklySeriesPayload.reduce((acc, item) => {
        const songId = item.song_id || item.songId || item.id;
        if (!songId) return acc;

         const rawDate = item.date || item.period_start || item.periodStart;
        const plays = Number(item.play_count ?? item.plays ?? item.playCount ?? 0) || 0;

        const formattedDate = formatWeeklyDate(rawDate);
        const existing = acc[songId] || [];

        acc[songId] = [
          ...existing,
          {
            date: formattedDate,
            rawDate,
            plays,
          },
        ];

        return acc;
      }, {});

      const rawSeriesValues = weeklySeriesPayload
        .map((item) =>
          Number(item.play_count ?? item.plays ?? item.playCount ?? 0) || 0
        )
        .filter((value) => value > 0);
      const globalMedian = computeMedian(rawSeriesValues);
      const globalBase = clamp(
        Math.round(Math.log10((globalMedian || 1) + 1) * 16 + 36),
        35,
        65
      );
      const globalAmplitude = clamp(Math.round(globalBase * 0.1), 4, 8);

      setWeeklySongs(normalizedWeekly);
      setSongs(normalizedWeekly);
      setSeriesData(
        normalizedWeekly.map((song, index) => {
          const dataPoints = (seriesMap[song.id] || []).sort((a, b) => {
            const aTime = a.rawDate ? new Date(a.rawDate).getTime() : 0;
            const bTime = b.rawDate ? new Date(b.rawDate).getTime() : 0;
            return aTime - bTime;
          });
          const localAverage =
            dataPoints.length > 0
              ? dataPoints.reduce(
                  (sum, point) => sum + (Number(point.plays) || 0),
                  0
                ) / dataPoints.length
              : globalMedian || globalBase;
          const weeklySeries = buildWeeklySeries(dataPoints, song.id, {
            index,
            count: normalizedWeekly.length,
            base: globalBase,
            amplitude: globalAmplitude,
            globalMedian,
            localAverage,
          });

          return {
            song,
            artist: song.artist_name || song.artist,
            data: weeklySeries.map((point) => ({
              date: point.date,
              plays: point.plays,
            })),
          };
        })
      );
    } catch (err) {
      console.error("Load Zing Chart failed", err);
      setSongs([]);
      setSeriesData([]);
      setRegionCharts({ vietnam: [], usuk: [], kpop: [] });
      setWeeklySongs([]);
    } finally {
      setLoading(false);
      setLoadingSeries(false);
      setLoadingWeekly(false);
      setLoadingRegions(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  const highlightedSeries = useMemo(() => seriesData.slice(0, 5), [seriesData]);
  const weeklyColumns = useMemo(
    () => [
      {
        title: "Việt Nam",
        items: regionCharts.vietnam,
        link: "/zing-chart/region/vietnam",
      },
      { title: "US-UK", items: regionCharts.usuk, link: "/zing-chart/region/usuk" },
      { title: "K-Pop", items: regionCharts.kpop, link: "/zing-chart/region/kpop" },
    ],
    [regionCharts]
  );

  const chartLines = useMemo(() => {
    const datasets = highlightedSeries
      .filter((item) => Array.isArray(item.data) && item.data.length)
      .map((item, index) => ({
        song: item.song,
        dataPoints: item.data,
        color: colors[index % colors.length],
      }));

    if (!datasets.length) return [];

    const scaleMax = Math.max(
      ...datasets.flatMap((d) => d.dataPoints.map((p) => Number(p.plays) || 0)),
      1
    );

    return datasets.map((dataset) => {
   const TOTAL_POINTS = 7;

const xStep =
  TOTAL_POINTS > 1
    ? (chartWidth - CHART_PADDING_X * 2) / (TOTAL_POINTS - 1)
    : chartWidth;


      const points = dataset.dataPoints.map((point, i) => {
        const value = Number(point.plays) || 0;
        const x = Math.round(CHART_PADDING_X + i * xStep);
        const y = Math.round(
          CHART_HEIGHT - (value / scaleMax) * (CHART_HEIGHT * 0.85)
        );

        return {
          x,
          y: Math.max(12, y),
          value,
          date: point.date,
        };
      });

      return {
        ...dataset,
        points,
        path: buildPath(
          points.map((p) => p.value),
          chartWidth,
          CHART_HEIGHT,
          scaleMax,
          CHART_PADDING_X
        ),
        scaleMax,
      };
    });
  }, [chartWidth, highlightedSeries]);

  const activePoints = useMemo(() => {
    if (hoveredIndex === null) return [];

    return chartLines
      .map((line, lineIdx) => {
        const point = line.points?.[hoveredIndex];
        if (!point) return null;

        return {
          ...point,
          lineIdx,
          line,
        };
      })
      .filter(Boolean);
  }, [chartLines, hoveredIndex]);

  const crosshairPoint =
  activePoints.find((point) => point.lineIdx === hoveredLineIndex) ||
  activePoints[0];
  const chartWidthPx = chartWidth;
  const chartHeightPx = chartSize?.height || chartHeight;

  const tooltipStyle = useMemo(() => {
    if (!crosshairPoint) return null;

    const widthRatio = chartWidthPx / chartWidth;
    const heightRatio = chartHeightPx / chartHeight;
    const pointX = hoverPosition?.x ?? crosshairPoint.x * widthRatio;
    const pointY = hoverPosition?.y ?? crosshairPoint.y * heightRatio;
    const preferLeft = pointX > chartWidthPx * 0.55;
    const preferAbove = pointY > chartHeightPx * 0.45;
    const tooltipWidth = Math.min(260, Math.max(140, chartWidthPx - 24));
    const estimatedHeight = 40 + activePoints.length * 44;
    const baseLeft = preferLeft ? pointX - 12 - tooltipWidth : pointX + 12;
    const baseTop = preferAbove ? pointY - 12 - estimatedHeight : pointY + 12;
    const maxLeft = Math.max(8, chartWidthPx - tooltipWidth - 8);
    const maxTop = Math.max(8, chartHeightPx - estimatedHeight - 8);
    const clampedLeft = Math.min(maxLeft, Math.max(8, baseLeft));
    const clampedTop = Math.min(maxTop, Math.max(8, baseTop));

    return {
      left: `${clampedLeft}px`,
      top: `${clampedTop}px`,
      width: `${tooltipWidth}px`,
    };
  }, [
    chartHeightPx,
    chartWidth,
    chartWidthPx,
    crosshairPoint,
    hoverPosition,
    activePoints.length,
  ]);

  const handleChartHover = useCallback(
    (event) => {
      if (!chartLines.length || !chartLines[0]?.points?.length) return;

      const bounds = event.currentTarget.getBoundingClientRect();
      setChartSize({ width: bounds.width, height: bounds.height });

      const scaleX = chartWidth / bounds.width;
      setHoverPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const offsetX = (event.clientX - bounds.left) * scaleX;
      const usableX = Math.max(0, Math.min(chartWidth, offsetX));
      const innerX = Math.max(
        0,
        Math.min(chartWidth - CHART_PADDING_X * 2, usableX - CHART_PADDING_X)
      );

      const xStep =
        chartLines[0].points.length > 1
          ? (chartWidth - CHART_PADDING_X * 2) / (chartLines[0].points.length - 1)
          : chartWidth;

      const rawIndex = Math.round(innerX / xStep);
      const clampedIndex = Math.max(
        0,
        Math.min(chartLines[0].points.length - 1, rawIndex)
      );

      setHoveredIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
    },
    [chartLines, chartWidth]
  );

  useEffect(() => {
    const updateChartSize = () => {
      if (!chartRef.current) return;
      const rect = chartRef.current.getBoundingClientRect();
      setChartSize({ width: rect.width, height: rect.height });
    };

    updateChartSize();
    window.addEventListener("resize", updateChartSize);
    return () => window.removeEventListener("resize", updateChartSize);
  }, []);

  const getSongCover = (song) =>
    song?.cover_url ||
    song?.thumbnail_m ||
    song?.thumbnail ||
    song?.image_url ||
    song?.image ||
    "";

   const handlePlay = async (song, queue = songs) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;

    const normalizedId = playable?.id;
     const updatedQueue = queue.map((item) =>
      item?.id === normalizedId ? { ...item, ...playable } : item
    );

    playSong(playable, updatedQueue);
  };

  const renderRankItem = (song, idx) => (
    <div
      key={song.id || idx}
        onClick={() => handlePlay(song, weeklySongs)}
      className={`group grid grid-cols-[32px_minmax(0,3fr)_minmax(0,1fr)] items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
        song.audio_url ? "md:hover:bg-white/5" : "opacity-70 cursor-not-allowed"
      }`}
    >
      <div className="flex items-center justify-center text-lg font-semibold text-white/70 tabular-nums leading-none">
        {song.rank ?? idx + 1}
      </div>

      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-white/5 bg-[#242424]">
          <OptimizedImage
            src={getSongCover(song)}
            alt={song.title}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition md:group-hover:opacity-100">
            <span className="text-white text-sm">
              <FaPlay size={12} />
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="truncate font-medium text-white">{song.title}</div>
          <div className="truncate text-xs text-white/60">
            {song.artist_name}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1 text-xs text-white/50">
        <FaRegClock size={12} />
        <span>{formatDuration(song.duration)}</span>
      </div>
    </div>
  );

  return (
     <div className="min-h-screen space-y-10 bg-[#121212] px-4 py-6 sm:px-8">
      <Section
        title="MinhChart"
        subtitle="Dữ liệu tuần này"
        action={
          <div className="flex items-center gap-2 text-xs text-white/70">
             <span className="flex items-center gap-2 rounded-full border border-white/10 bg-[#242424] px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span>
            <span className="hidden items-center gap-2 text-white/50 sm:flex">
              <FaRegClock size={12} />
              Cập nhật mỗi giờ
            </span>
            <button
              onClick={loadChart}
              className="rounded-full border border-white/10 bg-[#242424] px-3 py-1.5 text-[11px] font-semibold text-white/80 transition md:hover:bg-[#2a2a2a]"
            >
              Làm mới dữ liệu
            </button>
          </div>
        }
      >
        <div className="flex w-full flex-col gap-6">
         <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#181818] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] transition-all duration-300 md:hover:bg-[#1f1f1f]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.08),_transparent_40%)]" />

            <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
                  Bảng xếp hạng
                </p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-white">Top 5 tuần</span>
                  <span className="text-emerald-300">#zingchart</span>
                </div>
              </div>

               <div className="rounded-full border border-white/10 bg-[#242424] px-3 py-1 text-[11px] text-white/70">
               Cập nhật bảng xếp hạng tuần
              </div>
            </div>

            {!loading && !songs.length && (
              <div className="relative mb-4 rounded-xl border border-white/5 bg-[#242424] px-4 py-3 text-sm text-white/70">
                Không có dữ liệu bảng xếp hạng để hiển thị. Hãy thử làm mới.
              </div>
            )}

            <div className="flex flex-col gap-6 lg:flex-row">
              {/* CHART */}
               <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/5 bg-[#121212] p-2 shadow-lg shadow-black/30 sm:overflow-visible">

                <svg
                  ref={chartRef}
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  preserveAspectRatio="none"
                  className="h-[220px] w-full sm:h-[300px] lg:h-[340px]"
                  onMouseMove={handleChartHover}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setHoverPosition(null);
                    setHoveredLineIndex(null);
                  }}
                >
                  <defs>
                    {chartLines.map((line, idx) => (
                      <linearGradient
                        key={line.song.id || idx}
                        id={`chart-fill-${idx}`}
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor={line.color.main}
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor={line.color.main}
                          stopOpacity="0"
                        />
                      </linearGradient>
                    ))}
                  </defs>

                  <g>
                    {chartLines.map((line, idx) => {
                      const isActive = hoveredLineIndex === idx;
                      const dimmed = hoveredLineIndex !== null && !isActive;

                      return (
                      <path
                        key={`shadow-${idx}`}
                        d={line.path}
                        fill="none"
                        stroke={line.color.glow}
                        strokeWidth={isActive ? 14 : 8}
                        strokeLinecap="round"
                        strokeOpacity={dimmed ? 0.2 : 1}
                        className="cursor-pointer blur-sm transition-all duration-200"
                        onMouseEnter={() => setHoveredLineIndex(idx)}
                      />
                   );
                    })}
                    {chartLines.map((line, idx) => {
                      const isActive = hoveredLineIndex === idx;
                      const dimmed = hoveredLineIndex !== null && !isActive;

                      return (
                      <path
                        key={idx}
                        d={line.path}
                        fill="none"
                        stroke={line.color.main}
                        strokeWidth={isActive ? 5 : 3}
                        strokeLinecap="round"
                        strokeOpacity={dimmed ? 0.35 : 1}
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setHoveredLineIndex(idx)}
                      />
                     );
                    })}
                    {chartLines.map((line, idx) =>
                      line.points.map((point, i) => (
                        <circle
                          key={`${idx}-${i}`}
                          cx={point.x}
                          cy={point.y}
                          r={4}
                          fill="#0b071a"
                          stroke={line.color.main}
                          strokeWidth={2}
                          className="cursor-pointer"
                          onMouseEnter={() => {
                            setHoveredIndex(i);
                            setHoveredLineIndex(idx);
                          }}
                        />
                      ))
                    )}

                    {crosshairPoint && (
                      <g>
                        <line
                          x1={crosshairPoint.x}
                          y1={crosshairPoint.y}
                          x2={crosshairPoint.x}
                          y2={CHART_HEIGHT + 12}
                          stroke="white"
                          strokeOpacity={0.25}
                          strokeWidth={1}
                          strokeDasharray="4 4"
                        />
                        <circle
                          cx={crosshairPoint.x}
                          cy={crosshairPoint.y}
                          r={7}
                          fill="#0b071a"
                          stroke={crosshairPoint.line.color.main}
                          strokeWidth={3}
                        />
                      </g>
                    )}
                  </g>
                </svg>

                {crosshairPoint && activePoints.length > 0 && (
                  <div
                     className="pointer-events-none absolute left-0 top-0 z-20 rounded-2xl border border-white/10 bg-[#1f1f1f] px-3 py-2 text-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                    style={tooltipStyle || undefined}
                  >
                    <div className="mb-2 text-[11px] text-white/60">
                      {crosshairPoint.date}
                    </div>
                    <div className="min-w-[220px] space-y-2">
                      {activePoints
                        .slice()
                        .sort((a, b) => b.value - a.value)
                        .map((point, idx) => (
                          <div
                            key={`${point.line.song?.id || idx}-${point.x}`}
                            className="flex items-center gap-3"
                          >
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: point.line.color.main }}
                            />
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#242424]">
                              <OptimizedImage
                                src={getSongCover(point.line.song)}
                                alt={point.line.song?.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-[180px] truncate font-semibold text-white">
                                {point.line.song?.title}
                              </div>
                              <div className="max-w-[180px] truncate text-xs text-white/60">
                                {point.line.song?.artist_name}
                              </div>
                            </div>
                            <div className="ml-auto text-sm font-semibold text-white/80">
                              {point.value.toLocaleString("vi-VN")}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {loadingSeries && (
                 <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 text-sm text-white/70">
                    Đang tải dữ liệu biểu đồ...
                  </div>
                )}
                {!loadingSeries && !chartLines.length && (
                   <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/70 text-sm text-white/70">
                    Chưa có dữ liệu biểu đồ để hiển thị.
                  </div>
                )}
              </div>

              {/* WEEKLY LIST */}
              <div className="relative w-full rounded-2xl border border-white/5 bg-[#181818] p-4 shadow-lg shadow-black/30 lg:w-[360px]">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="text-sm font-semibold text-white/85">BXH tuần</div>
                  <div className="text-xs text-white/60">Cập nhật mỗi thứ 2</div>
                </div>
                <div className="max-h-[260px] space-y-1 overflow-y-auto pr-1 scrollbar-muted">
                                 {loadingWeekly && (
                    <div className="px-2 text-sm text-white/60">Đang tải...</div>
                  )}
                  {!loadingWeekly && !weeklySongs.length && (
                    <div className="px-2 text-sm text-white/60">Chưa có dữ liệu BXH.</div>
                  )}
                 {!loadingWeekly &&
                    weeklySongs.map((song, idx) => renderRankItem(song, idx))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {highlightedSeries.map((item, idx) => (
                <div
                  key={item.song?.id || idx}
                  className="group flex items-center gap-3 rounded-xl border border-white/5 bg-[#242424] px-3 py-2 transition-all duration-300 md:hover:-translate-y-0.5 md:hover:bg-[#2a2a2a] md:hover:shadow-lg md:hover:shadow-black/30"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-white/10 bg-[#1f1f1f]">
                    <OptimizedImage
                      src={getSongCover(item.song)}
                      alt={item.song?.title}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className="absolute inset-0"
                      style={{
                        boxShadow: `inset 0 0 0 2px ${
                          colors[idx % colors.length].main
                        }`,
                      }}
                    />
                  </div>
                  <div className="text-sm">
                    <div className="max-w-[220px] truncate font-semibold text-white">
                      {item.song?.title}
                    </div>
                    <div className="max-w-[220px] truncate text-white/60">
                      {item.song?.artist_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="BXH theo khu vực"
        subtitle="Top 5 ca khúc nổi bật ở từng thị trường"
        action={<span className="text-xs text-white/50">Cập nhật mỗi thứ 2</span>}
      >
        <div className="grid gap-4 lg:grid-cols-3">
           {weeklyColumns.map((column) => (
            <div
              key={column.title}
               className="group relative overflow-hidden rounded-2xl border border-white/5 bg-[#181818] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 md:hover:-translate-y-1 md:hover:bg-[#202020]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.08),_transparent_35%)]" />

              <div className="relative mb-4 flex items-center justify-between">
                <div className="text-lg font-semibold text-white">
                  {column.title}
                </div>
                {column.link && (
                  <Link
                    to={column.link}
                   className="rounded-full border border-white/10 bg-[#242424] px-3 py-2 text-xs text-white/80 transition md:hover:bg-[#2a2a2a]"
                  >
                    Xem tất cả
                  </Link>
                )}
              </div>

              <div className="relative space-y-3">
                {loadingRegions && (
                  <div className="text-sm text-white/60">Đang tải dữ liệu khu vực...</div>
                )}

                {!loadingRegions && !column.items.length && (
                  <div className="text-sm text-white/60">Chưa có dữ liệu.</div>
                )}

                {!loadingRegions &&
                  column.items.map((song, idx) => {
                    
                    const playable = Boolean(song.audio_url);
                    return (
                      <div
                        key={song.id || idx}
                        onClick={() => handlePlay(song)}
                          className={`group/item flex items-center gap-3 rounded-xl px-2 py-2 transition-all duration-300 md:hover:cursor-pointer ${
                          playable
                            ? "cursor-pointer md:hover:bg-white/10 md:hover:shadow-lg md:hover:shadow-black/20"
                               : "cursor-not-allowed"
                        }`}
                      >
                         <div className="flex w-8 shrink-0 items-center justify-center text-2xl font-black text-white/80 tabular-nums leading-none">
                          {song.rank ?? idx + 1}
                        </div>

                         <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-[#242424] shadow-md shadow-black/25 transition group-hover/item:ring-2 group-hover/item:ring-emerald-400/60 group-hover/item:ring-offset-2 group-hover/item:ring-offset-[#121212]">
                          <OptimizedImage
                            src={getSongCover(song)}
                            alt={song.title}
                            className="h-full w-full object-cover"
                          />
                           <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover/item:opacity-100">
                           <span className="rounded-full bg-white/90 p-2 text-[#0c0914] shadow-lg shadow-emerald-400/30">
                              <FaPlay size={12} />
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-semibold text-white">
                            {song.title}
                          </div>
                          <div className="truncate text-xs text-white/60">
                            {song.artist_name}
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-1 text-xs text-white/50">
                          <FaRegClock size={12} />
                          <span>{formatDuration(song.duration)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
