import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaPlay, FaRegClock, FaSearch } from "react-icons/fa";
import {
  getNewReleaseChart,
  getTop100Chart,
  getZingChart,
  getZingChartSeries,
} from "../api/chart.api";
import {
  formatDuration,
  filterPlayableSongs,
  toPlayableSong,
} from "../utils/song";
import usePlayerStore from "../store/player.store";
import SongTable from "../components/song/SongTable";

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
];

export default function ZingChart() {
  const [songs, setSongs] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [seriesDays, setSeriesDays] = useState(7);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(null);
  const [newReleaseSongs, setNewReleaseSongs] = useState([]);
  const [top100Songs, setTop100Songs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNewRelease, setLoadingNewRelease] = useState(true);
  const [loadingTop100, setLoadingTop100] = useState(true);
  const [chartSize, setChartSize] = useState(null);
  const { playSong } = usePlayerStore();
  const chartRef = useRef(null);

  const loadChart = async () => {
    try {
      setLoading(true);
      setLoadingSeries(true);

      const [chartRes, seriesRes] = await Promise.all([
        getZingChart(),
        getZingChartSeries({ days: 7 }),
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
    } catch (err) {
      console.error("Load Zing Chart failed", err);
      setSongs([]);
      setSeriesData([]);
    } finally {
      setLoading(false);
      setLoadingSeries(false);
    }
  };

  const loadNewRelease = async () => {
    try {
      setLoadingNewRelease(true);
      const res = await getNewReleaseChart();
      const rawSongs =
        res?.data?.data?.songs ||
        res?.data?.data?.items ||
        res?.data?.data ||
        res?.data ||
        [];

      setNewReleaseSongs(filterPlayableSongs(rawSongs));
    } catch (err) {
      console.error("Load new release chart failed", err);
      setNewReleaseSongs([]);
    } finally {
      setLoadingNewRelease(false);
    }
  };

  const loadTop100 = async () => {
    try {
      setLoadingTop100(true);
      const res = await getTop100Chart();
      const rawSongs = res?.data?.data?.items || res?.data?.data || res?.data || [];

      setTop100Songs(filterPlayableSongs(rawSongs));
    } catch (err) {
      console.error("Load top 100 chart failed", err);
      setTop100Songs([]);
    } finally {
      setLoadingTop100(false);
    }
  };

  useEffect(() => {
    loadChart();
    loadNewRelease();
    loadTop100();
  }, []);

  const highlightedSeries = useMemo(() => seriesData, [seriesData]);
  const weeklyColumns = useMemo(() => {
    const slices = [
      { title: "Việt Nam", start: 0 },
      { title: "US-UK", start: 3 },
      { title: "K-Pop", start: 6 },
    ];

    return slices.map((slice) => ({
      title: slice.title,
      items: songs.slice(slice.start, slice.start + 5),
    }));
  }, [songs]);

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
          ? (CHART_WIDTH - CHART_PADDING_X * 2) / (dataset.dataPoints.length - 1)
          : CHART_WIDTH;

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
          CHART_WIDTH,
          CHART_HEIGHT,
          scaleMax,
          CHART_PADDING_X
        ),
        scaleMax,
      };
    });
  }, [highlightedSeries]);

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
 const chartWidthPx = chartSize?.width || CHART_WIDTH;
  const chartHeightPx = chartSize?.height || CHART_HEIGHT + 20;
  const tooltipStyle = useMemo(() => {
    if (!crosshairPoint) return null;

    const widthRatio = chartWidthPx / CHART_WIDTH;
    const heightRatio = chartHeightPx / (CHART_HEIGHT + 20);
    const pointX = (hoverPosition?.x ?? crosshairPoint.x * widthRatio);
    const pointY = (hoverPosition?.y ?? crosshairPoint.y * heightRatio);
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
  }, [chartHeightPx, chartWidthPx, crosshairPoint, hoverPosition]);

  const handleChartHover = useCallback(
    (event) => {
      if (!chartLines.length || !chartLines[0]?.points?.length) return;

      const bounds = event.currentTarget.getBoundingClientRect();
    setChartSize({ width: bounds.width, height: bounds.height });
      const scaleX = CHART_WIDTH / bounds.width;
      setHoverPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const offsetX = (event.clientX - bounds.left) * scaleX;
      const usableX = Math.max(0, Math.min(CHART_WIDTH, offsetX));
      const innerX = Math.max(
        0,
        Math.min(CHART_WIDTH - CHART_PADDING_X * 2, usableX - CHART_PADDING_X)
      );
      const xStep =
        chartLines[0].points.length > 1
          ? (CHART_WIDTH - CHART_PADDING_X * 2) / (chartLines[0].points.length - 1)
          : CHART_WIDTH;

      const rawIndex = Math.round(innerX / xStep);
      const clampedIndex = Math.max(0, Math.min(chartLines[0].points.length - 1, rawIndex));

      setHoveredIndex((prev) => (prev === clampedIndex ? prev : clampedIndex));
    },
    [chartLines]
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

  const handlePlay = (song) => {
    if (!song?.audio_url) return;
    playSong(song, songs);
  };

  const renderRankItem = (song, idx) => (
    <div
      key={song.id || idx}
      onClick={() => handlePlay(song)}
      className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 hover:bg-white/5 transition ${
        song.audio_url ? "cursor-pointer" : "opacity-60 cursor-not-allowed"
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
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(song);
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition"
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
    <div className="space-y-8">
      <div className="relative rounded-2xl bg-gradient-to-br from-[#241540] via-[#1b0f33] to-[#0f0a22] p-6 overflow-visible">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%)]" />

        <div className="relative flex flex-wrap gap-4 items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 text-lg font-semibold uppercase tracking-tight">
              <span className="text-[#6fff8c]">#zingchart</span>
              <span className="px-2 py-1 text-xs rounded-full border border-white/15 text-white/70">
                Live
              </span>
            </div>
            <div className="text-sm text-white/60">
              Dữ liệu {seriesDays} ngày gần nhất
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadChart}
              className="px-3 py-2 text-xs rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition"
            >
              Làm mới dữ liệu
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-white/70">
              <FaSearch size={12} />
              <span>Tìm kiếm bài hát, nghệ sĩ...</span>
            </div>
          </div>
        </div>

        {!loading && !songs.length && (
          <div className="relative mb-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70">
            Không có dữ liệu bảng xếp hạng để hiển thị. Hãy thử làm mới.
          </div>
        )}

        <div className="relative space-y-4">
          <div className="relative">
            <svg
              ref={chartRef}
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT + 20}`}
              className="w-full h-[320px] max-lg:h-[300px]"
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
                className="absolute z-20 rounded-xl bg-[#120926] border border-white/10 px-3 py-2 shadow-xl pointer-events-none"
                 style={tooltipStyle || undefined}
              >
                <div className="text-[11px] text-white/60 mb-2">{crosshairPoint.date}</div>
                <div className="space-y-2 min-w-[220px]">
                  {activePoints
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .map((point, idx) => (
                      <div key={`${point.line.song?.id || idx}-${point.x}`} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: point.line.color.main }}
                        />
                        <div className="relative w-10 h-10 overflow-hidden rounded-md border border-white/10 shrink-0">
                          <img
                            src={getSongCover(point.line.song)}
                            alt={point.line.song?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate max-w-[180px]">
                            {point.line.song?.title}
                          </div>
                          <div className="text-xs text-white/60 truncate max-w-[180px]">
                            {point.line.song?.artist_name}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-white/80 ml-auto">
                          {point.value.toLocaleString("vi-VN")}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {loadingSeries && (
              <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm bg-[#0f0a22]/60 backdrop-blur-sm rounded-lg">
                Đang tải dữ liệu biểu đồ...
              </div>
            )}
            {!loadingSeries && !chartLines.length && (
              <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm bg-[#0f0a22]/80 backdrop-blur-sm rounded-lg">
                Chưa có dữ liệu biểu đồ để hiển thị.
              </div>
            )}

             <div className="mt-5 flex gap-4 flex-wrap">
              {highlightedSeries.map((item, idx) => (
                <div
                  key={item.song?.id || idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="relative w-10 h-10 rounded-md overflow-hidden border border-white/10">
                    <img
                      src={getSongCover(item.song)}
                      alt={item.song?.title}
                      className="w-full h-full object-cover"
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

          <div className="relative bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="text-sm font-semibold text-white/80">BXH tuần</div>
              <div className="text-xs text-white/60">Cập nhật mỗi thứ 2</div>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[260px] pr-1 scrollbar-muted">
              {loading && <div className="text-sm text-white/60 px-2">Đang tải...</div>}
              {!loading && !songs.length && (
                <div className="text-sm text-white/60 px-2">Chưa có dữ liệu BXH.</div>
              )}
              {!loading && songs.slice(0, 10).map((song, idx) => renderRankItem(song, idx))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {weeklyColumns.map((column) => (
          <div
            key={column.title}
            className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#2c1648] via-[#23103b] to-[#150a27] border border-white/5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_35%)]" />
            <div className="relative flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-semibold">{column.title}</div>
              </div>
              <button className="text-xs px-3 py-2 rounded-full border border-white/15 hover:bg-white/5 transition">
                Xem tất cả
              </button>
            </div>

            <div className="relative space-y-3">
              {!column.items.length && (
                <div className="text-sm text-white/60">Chưa có dữ liệu.</div>
              )}
              {column.items.map((song, idx) => {
                const playable = Boolean(song.audio_url);
                return (
                  <div
                    key={song.id || idx}
                    onClick={() => handlePlay(song)}
                    className={`flex items-center gap-3 rounded-lg px-2 py-1 ${
                      playable ? "cursor-pointer hover:bg-white/5" : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="text-2xl font-black text-white/80 w-8 text-center">
                      {song.rank ?? idx + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <img
                          src={getSongCover(song)}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{song.title}</div>
                      <div className="text-xs text-white/60 truncate">{song.artist_name}</div>
                    </div>
                    <div className="ml-auto text-xs text-white/50 flex items-center gap-1">
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
    </div>
  );
}