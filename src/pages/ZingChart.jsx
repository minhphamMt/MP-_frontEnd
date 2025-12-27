import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlay, FaRegClock } from "react-icons/fa";
import {
  getRegionCharts,
  getZingChart,
  getZingChartSeries,
} from "../api/chart.api";
import {
  formatDuration,
  filterPlayableSongs,
  toPlayableSong,
  fetchPlayableSong,
} from "../utils/song";
import { getSongById } from "../api/song.api";
import usePlayerStore from "../store/player.store";
import Section from "../components/section/Section";

const CHART_WIDTH = 820;
const CHART_HEIGHT = 240;
const CHART_PADDING_X = 24;

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

export default function ZingChart() {
  const [songs, setSongs] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [seriesDays, setSeriesDays] = useState(7);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [loading, setLoading] = useState(true);
   const [loadingRegions, setLoadingRegions] = useState(true);
  const [regionCharts, setRegionCharts] = useState({
    vietnam: [],
    usuk: [],
    kpop: [],
  });
  const [chartSize, setChartSize] = useState(null);
  const { playSong } = usePlayerStore();
  const chartRef = useRef(null);

  const chartWidth = chartSize?.width || CHART_WIDTH;
  const chartHeight = CHART_HEIGHT + 20;

  const loadChart = async () => {
    try {
      setLoading(true);
      setLoadingSeries(true);
      setLoadingRegions(true);

     const [chartRes, seriesRes, regionRes] = await Promise.all([
        getZingChart(),
        getZingChartSeries({ days: 7 }),
        getRegionCharts({ limit: 5}),
      ]);

      const rawSongs =
        chartRes?.data?.data?.songs ||
        chartRes?.data?.data?.items ||
        chartRes?.data?.data ||
        chartRes?.data ||
        [];

      const rawSeries = seriesRes?.data?.data?.series || [];
      const daysValue = Number(seriesRes?.data?.data?.days) || 7;

      const playableSongs = filterPlayableSongs(rawSongs);
      const songMap = new Map(playableSongs.map((s) => [String(s.id), s]));

      setSongs(playableSongs);
      setSeriesDays(daysValue);
      setSeriesData(
        rawSeries
          .filter((item) => item?.song && Array.isArray(item?.data))
          .map((item) => {
            const normalizedSong = toPlayableSong(item.song);
            const normalizedId = normalizedSong?.id ? String(normalizedSong.id) : null;
            const songFromChart = normalizedId ? songMap.get(normalizedId) : null;

            return {
              song: {
                ...(songFromChart || {}),
                ...(normalizedSong || {}),
              },
              artist: item.artist,
              data: item.data.map((point) => ({
                date: point.date || point.day || "",
                plays: Number(point.plays) || 0,
              })),
            };
          })
      );

      const regionPayload =
        regionRes?.data?.data || regionRes?.data || { vietnam: [], usuk: [], kpop: [] };

      setRegionCharts({
        vietnam: filterPlayableSongs(regionPayload.vietnam),
        usuk: filterPlayableSongs(regionPayload.usuk),
        kpop: filterPlayableSongs(regionPayload.kpop),
      });
    } catch (err) {
      console.error("Load Zing Chart failed", err);
      setSongs([]);
      setSeriesData([]);
        setRegionCharts({ vietnam: [], usuk: [], kpop: [] });
    } finally {
      setLoading(false);
      setLoadingSeries(false);
       setLoadingRegions(false);
    }
  };
  useEffect(() => {
    loadChart();
  }, []);

  const highlightedSeries = useMemo(() => seriesData.slice(0, 5), [seriesData]);
  const weeklyColumns = useMemo(
    () => [
      { title: "Việt Nam", items: regionCharts.vietnam, link: "/zing-chart/region/vietnam" },
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
      const xStep =
        dataset.dataPoints.length > 1
         ? (chartWidth - CHART_PADDING_X * 2) / (dataset.dataPoints.length - 1)
          : chartWidth;

      const points = dataset.dataPoints.map((point, i) => {
        const value = Number(point.plays) || 0;
        const x = Math.round(CHART_PADDING_X + i * xStep);
        const y = Math.round(CHART_HEIGHT - (value / scaleMax) * (CHART_HEIGHT * 0.85));

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

  const crosshairPoint = activePoints[0];
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
    const baseLeft = preferLeft ? pointX - 12 : pointX + 12;
    const baseTop = preferAbove ? pointY - 12 : pointY + 12;
    const clampedLeft = Math.min(chartWidthPx - 16, Math.max(16, baseLeft));
    const clampedTop = Math.min(chartHeightPx - 16, Math.max(16, baseTop));

    return {
      left: `${clampedLeft}px`,
      top: `${clampedTop}px`,
      transform: `translate(${preferLeft ? "-100%" : "0%"}, ${
        preferAbove ? "-100%" : "0%"
      })`,
    };
   }, [chartHeight, chartHeightPx, chartWidth, chartWidthPx, crosshairPoint, hoverPosition]);

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
      const clampedIndex = Math.max(0, Math.min(chartLines[0].points.length - 1, rawIndex));

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

  const handlePlay = async (song) => {
    const playable = (await fetchPlayableSong(song, getSongById)) || song;
    if (!playable?.audio_url) return;

    const normalizedId = playable?.id;
    const updatedQueue = songs.map((item) =>
      item?.id === normalizedId ? { ...item, ...playable } : item
    );

    playSong(playable, updatedQueue);
  };

  const renderRankItem = (song, idx) => (
    <div
      key={song.id || idx}
      onClick={() => handlePlay(song)}
      className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-white/5 transition ${
        song.audio_url ? "cursor-pointer" : "opacity-50 cursor-default"

      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-2xl font-black text-white/80 w-10 text-center">
          {song.rank ?? idx + 1}
        </div>
        <div className="relative w-12 h-12 shrink-0">
          <img
            src={getSongCover(song)}
            alt={song.title}
            className="w-full h-full object-cover rounded-lg"
          />
         <button
  onClick={(e) => e.stopPropagation()}
  className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition"
>

            <span className="bg-white/20 backdrop-blur-md rounded-full p-2">
              <FaPlay size={12} />
            </span>
          </button>
        </div>
        <div className="min-w-0">
          <div className="font-semibold truncate">{song.title}</div>
          <div className="text-xs text-white/60 truncate">{song.artist_name}</div>
        </div>
      </div>

      <div className="text-sm text-white/60 min-w-[46px] text-right">
        {formatDuration(song.duration)}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <Section
        title="MinhChart"
        subtitle={`Dữ liệu ${seriesDays} ngày gần nhất`}
        action={
          <div className="flex items-center gap-2 text-xs text-white/70">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Live
            </span>
            <span className="hidden items-center gap-2 text-white/50 sm:flex">
              <FaRegClock size={12} />
              Cập nhật mỗi giờ
            </span>
            <button
              onClick={loadChart}
              className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:border-white/40 hover:bg-white/5"
            >
              Làm mới dữ liệu
            </button>
          </div>
        }
      >
       <div className="flex flex-col gap-6 w-full">

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#241540] via-[#1b0f33] to-[#0f0a22] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%)]" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#6fff8c]/10 blur-3xl" />

            <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Bảng xếp hạng</p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-white">Top 5 realtime</span>
                  <span className="text-[#6fff8c]">#zingchart</span>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70">
                Cập nhật từ dữ liệu {seriesDays} ngày
              </div>
            </div>

            {!loading && !songs.length && (
              <div className="relative mb-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                Không có dữ liệu bảng xếp hạng để hiển thị. Hãy thử làm mới.
              </div>
            )}

          <div className="flex flex-col gap-6">

              <div className="relative rounded-xl border border-white/10 bg-[#0b071a]/40 p-2">
                <svg
                  ref={chartRef}
  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
  preserveAspectRatio="none"
  className="h-[340px] w-full"
                  onMouseMove={handleChartHover}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setHoverPosition(null);
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
                        <stop offset="0%" stopColor={line.color.main} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={line.color.main} stopOpacity="0" />
                      </linearGradient>
                    ))}
                  </defs>

                  <g>
                    {chartLines.map((line, idx) => (
                      <path
                        key={`shadow-${idx}`}
                        d={line.path}
                        fill="none"
                        stroke={line.color.glow}
                        strokeWidth={8}
                        strokeLinecap="round"
                        className="blur-sm"
                      />
                    ))}
                    {chartLines.map((line, idx) => (
                      <path
                        key={idx}
                        d={line.path}
                        fill="none"
                        stroke={line.color.main}
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    ))}
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
                          onMouseEnter={() => setHoveredIndex(i)}
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
                    className="pointer-events-none absolute left-0 top-0 z-20 rounded-xl border border-white/10 bg-[#120926] px-3 py-2 shadow-xl"
                    style={tooltipStyle || undefined}
                  >
                    <div className="mb-2 text-[11px] text-white/60">{crosshairPoint.date}</div>
                    <div className="min-w-[220px] space-y-2">
                      {activePoints
                        .slice()
                        .sort((a, b) => b.value - a.value)
                        .map((point, idx) => (
                          <div key={`${point.line.song?.id || idx}-${point.x}`} className="flex items-center gap-3">
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: point.line.color.main }}
                            />
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10">
                              <img
                                src={getSongCover(point.line.song)}
                                alt={point.line.song?.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="max-w-[180px] truncate font-semibold">
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
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#0f0a22]/60 text-sm text-white/70 backdrop-blur-sm">
                    Đang tải dữ liệu biểu đồ...
                  </div>
                )}
                {!loadingSeries && !chartLines.length && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#0f0a22]/80 text-sm text-white/70 backdrop-blur-sm">
                    Chưa có dữ liệu biểu đồ để hiển thị.
                  </div>
                )}
              </div>

              <div className="relative rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="text-sm font-semibold text-white/80">BXH tuần</div>
                  <div className="text-xs text-white/60">Cập nhật mỗi thứ 2</div>
                </div>
                <div className="max-h-[260px] space-y-1 overflow-y-auto pr-1 scrollbar-muted">
                  {loading && <div className="px-2 text-sm text-white/60">Đang tải...</div>}
                  {!loading && !songs.length && (
                    <div className="px-2 text-sm text-white/60">Chưa có dữ liệu BXH.</div>
                  )}
                  {!loading && songs.slice(0, 10).map((song, idx) => renderRankItem(song, idx))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {highlightedSeries.map((item, idx) => (
                <div
                  key={item.song?.id || idx}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-md border border-white/10">
                    <img
                      src={getSongCover(item.song)}
                      alt={item.song?.title}
                      className="h-full w-full object-cover"
                    />
                    <span
                      className="absolute inset-0"
                      style={{ boxShadow: `inset 0 0 0 2px ${colors[idx % colors.length].main}` }}
                    />
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold">{item.song?.title}</div>
                    <div className="text-white/60">{item.song?.artist_name}</div>
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
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#2c1648] via-[#23103b] to-[#150a27] p-5"
            >
                 <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)]" />
              <div className="relative mb-4 flex items-center justify-between">
                <div className="text-lg font-semibold">{column.title}</div>
                 {column.link && (
                  <Link
                    to={column.link}
                    className="text-xs rounded-full border border-white/15 px-3 py-2 transition hover:bg-white/5"
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
                        className={`flex items-center gap-3 rounded-lg px-2 py-1 ${
                          playable ? "cursor-pointer hover:bg-white/5" : "cursor-default opacity-60"

                        }`}
                      >
                        <div className="w-8 text-center text-2xl font-black text-white/80">
                          {song.rank ?? idx + 1}
                        </div>
                        <div className="h-12 w-12 overflow-hidden rounded-lg">
                          <img
                            src={getSongCover(song)}
                            alt={song.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{song.title}</div>
                          <div className="truncate text-xs text-white/60">{song.artist_name}</div>
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