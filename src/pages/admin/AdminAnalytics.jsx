import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiBarChart2,
  FiClock,
  FiDisc,
  FiMusic,
  FiRefreshCw,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import * as echarts from "echarts/core";
import { LineChart as ELineChart, BarChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { getAdminOverview, getReportCharts } from "../../api/admin.api";
import ChartLoadingState from "../../components/charts/ChartLoadingState";
import { getArtistLabel } from "../../utils/artist";

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  ELineChart,
  BarChart,
  SVGRenderer,
]);

const CHART_INCLUDE =
  "song_status,weekly_top,genre_status,user_distribution,artist_request_trend,album_by_month";

const extractData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

const safeNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

const formatCount = (value) => new Intl.NumberFormat("vi-VN").format(safeNumber(value));

const formatPercent = (value, total) => {
  if (total <= 0) return "0.0";
  return ((safeNumber(value) / total) * 100).toFixed(1);
};

const formatDayLabel = (value) => {
  if (!value || typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || "";
  const [, month, day] = value.split("-");
  return `${day}-${month}`;
};

const formatMonthLabel = (value) => {
  if (!value || typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) return value || "";
  const [year, month] = value.split("-");
  return `${month}/${year}`;
};

const SONG_STATUS_HEIGHT = "clamp(280px, 34vw, 340px)";
const WEEKLY_TOP_HEIGHT = "clamp(360px, 48vw, 470px)";
const GENRE_STATUS_HEIGHT = "clamp(260px, 30vw, 300px)";
const ROLE_DISTRIBUTION_HEIGHT = "clamp(176px, 24vw, 190px)";
const REQUEST_TREND_HEIGHT = "clamp(220px, 28vw, 250px)";
const ALBUM_BY_MONTH_HEIGHT = "clamp(220px, 28vw, 250px)";

function ChartPanel({ title, subtitle, icon: Icon, children, right, className = "" }) {
  return (
    <section
      data-card
      className={`admin-glass flex h-full w-full min-w-0 flex-col rounded-3xl border border-white/10 bg-[#181818] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">{title}</p>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {right}
          <span className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/70">
            <Icon />
          </span>
        </div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </section>
  );
}

function SongStatusBreakdown({ segments, total, height }) {
  const normalizedSegments = useMemo(
    () =>
      segments.map((item) => {
        const value = safeNumber(item.value);
        return {
          ...item,
          value,
          percentValue: total > 0 ? (value / total) * 100 : 0,
          percentLabel: formatPercent(value, total),
        };
      }),
    [segments, total]
  );

  const dominantSegment = useMemo(() => {
    return (
      normalizedSegments.reduce((winner, item) => {
        if (!winner || item.value > winner.value) return item;
        return winner;
      }, null) || null
    );
  }, [normalizedSegments]);

  return (
    <div
      className="flex h-full rounded-2xl border border-white/10 bg-[#141414] p-4 sm:p-5"
      style={{ minHeight: height }}
    >
      <div className="grid h-full flex-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_rgba(20,20,20,0.92)_62%)] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Tổng bài hát</p>
          <p className="mt-3 text-4xl font-black text-white sm:text-5xl">{formatCount(total)}</p>
          <p className="mt-2 text-sm text-white/55">
            Theo dõi nhanh số lượng bài hát ở mỗi trạng thái duyệt.
          </p>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/8">
            <div className="flex h-full w-full gap-[2px]">
              {normalizedSegments.map((segment) => (
                <span
                  key={segment.label}
                  className="h-full rounded-full"
                  style={{
                    width: `${segment.percentValue}%`,
                    minWidth: segment.value > 0 ? "6px" : "0px",
                    backgroundColor: segment.color,
                  }}
                />
              ))}
            </div>
          </div>

          {dominantSegment && (
            <div className="mt-auto rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                Trạng thái nhiều nhất
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: dominantSegment.color }}
                />
                <div>
                  <p className="text-base font-semibold text-white">{dominantSegment.label}</p>
                  <p className="text-sm text-white/55">
                    {formatCount(dominantSegment.value)} bài hát ({dominantSegment.percentLabel}%)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid h-full auto-rows-fr gap-3">
          {normalizedSegments.map((segment) => (
            <article
              key={segment.label}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{segment.label}</p>
                    <p className="text-xs text-white/45">{formatCount(segment.value)} bài hát</p>
                  </div>
                </div>
                <p className="text-lg font-black text-white">{segment.percentLabel}%</p>
              </div>

              <div className="mt-auto pt-4">
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${Math.max(segment.percentValue, segment.value > 0 ? 2.5 : 0)}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklyTopChart({ items }) {
  const option = useMemo(
    () => ({
      animationDuration: 350,
      animationEasing: "cubicOut",
      grid: { top: 12, right: 14, bottom: 8, left: 16, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(16, 16, 16, 0.95)",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#e5e7eb" },
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params;
          const idx = p?.dataIndex ?? 0;
          const row = items[idx] || {};
          return `#${idx + 1} ${row.label || ""}<br/>${row.artist || ""}<br/>Điểm: ${safeNumber(
            row.value
          )}`;
        },
      },
      xAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)", type: "dashed" } },
        axisLabel: { color: "rgba(255,255,255,0.45)", fontSize: 11 },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: items.map((item, idx) => `#${idx + 1} ${item.label}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "rgba(255,255,255,0.86)",
          fontSize: 12,
          width: 220,
          overflow: "truncate",
        },
      },
      series: [
        {
          type: "bar",
          data: items.map((item) => safeNumber(item.value)),
          barMaxWidth: 14,
          itemStyle: {
            borderRadius: [0, 999, 999, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: "#34d399" },
                { offset: 1, color: "#67e8f9" },
              ],
            },
          },
          label: {
            show: true,
            position: "right",
            color: "#6ee7b7",
            fontWeight: 700,
            formatter: ({ value }) => Number(value).toFixed(0),
          },
        },
      ],
    }),
    [items]
  );

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      opts={{ renderer: "svg" }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
      style={{ width: "100%", height: WEEKLY_TOP_HEIGHT }}
    />
  );
}

function GenreStatusChart({ rows }) {
  const option = useMemo(
    () => ({
      animationDuration: 350,
      animationEasing: "cubicOut",
      grid: { top: 34, right: 12, bottom: 8, left: 12, containLabel: true },
      legend: {
        top: 0,
        right: 8,
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(16, 16, 16, 0.95)",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#e5e7eb" },
      },
      xAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)", type: "dashed" } },
        axisLabel: { color: "rgba(255,255,255,0.45)", fontSize: 11 },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: rows.map((row) => row.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "rgba(255,255,255,0.85)",
          fontSize: 12,
          width: 160,
          overflow: "truncate",
        },
      },
      series: [
        {
          name: "Chờ duyệt",
          type: "bar",
          stack: "total",
          barMaxWidth: 14,
          data: rows.map((row) => safeNumber(row.pending)),
          itemStyle: { color: "#fbbf24", borderRadius: [0, 0, 0, 0] },
        },
        {
          name: "Đã duyệt",
          type: "bar",
          stack: "total",
          barMaxWidth: 14,
          data: rows.map((row) => safeNumber(row.approved)),
          itemStyle: { color: "#34d399", borderRadius: [0, 0, 0, 0] },
        },
        {
          name: "Từ chối",
          type: "bar",
          stack: "total",
          barMaxWidth: 14,
          data: rows.map((row) => safeNumber(row.rejected)),
          itemStyle: { color: "#fb7185", borderRadius: [0, 999, 999, 0] },
          label: {
            show: true,
            position: "right",
            color: "rgba(255,255,255,0.62)",
            fontSize: 11,
            formatter: ({ dataIndex }) => safeNumber(rows[dataIndex]?.total).toFixed(0),
          },
        },
      ],
    }),
    [rows]
  );

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      opts={{ renderer: "svg" }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
      style={{ width: "100%", height: GENRE_STATUS_HEIGHT }}
    />
  );
}

function RoleDistributionChart({ counts, total }) {
  const roleRows = useMemo(
    () => [
      { name: "USER", value: safeNumber(counts.user), color: "#93c5fd" },
      { name: "ARTIST", value: safeNumber(counts.artist), color: "#34d399" },
      { name: "ADMIN", value: safeNumber(counts.admin), color: "#fbbf24" },
    ],
    [counts]
  );

  const option = useMemo(
    () => ({
      animationDuration: 350,
      animationEasing: "cubicOut",
      grid: { top: 8, right: 12, bottom: 6, left: 8, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(16, 16, 16, 0.95)",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#e5e7eb" },
      },
      xAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: roleRows.map((item) => item.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 600 },
      },
      series: [
        {
          type: "bar",
          data: roleRows.map((item) => ({ value: item.value, itemStyle: { color: item.color } })),
          barMaxWidth: 10,
          showBackground: true,
          backgroundStyle: { color: "rgba(255,255,255,0.12)", borderRadius: 999 },
          itemStyle: { borderRadius: [0, 999, 999, 0] },
          label: {
            show: true,
            position: "right",
            color: "rgba(255,255,255,0.72)",
            formatter: ({ value }) => {
              const v = safeNumber(value);
              const p = total > 0 ? ((v / total) * 100).toFixed(1) : "0.0";
              return `${v} (${p}%)`;
            },
          },
        },
      ],
    }),
    [roleRows, total]
  );

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      opts={{ renderer: "svg" }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
      style={{ width: "100%", height: ROLE_DISTRIBUTION_HEIGHT }}
    />
  );
}

function LineChart({ labels, values }) {
  const option = useMemo(
    () => ({
      animationDuration: 350,
      animationEasing: "cubicOut",
      grid: { top: 24, right: 16, bottom: 34, left: 42 },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(16, 16, 16, 0.95)",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#e5e7eb" },
        axisPointer: { type: "line", lineStyle: { color: "rgba(52,211,153,0.6)" } },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.58)", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "rgba(255,255,255,0.5)",
          fontSize: 11,
          formatter: (value) => Number(value).toFixed(0),
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)", type: "dashed" } },
      },
      series: [
        {
          type: "line",
          data: values,
          smooth: 0.25,
          symbol: "circle",
          symbolSize: 8,
          showSymbol: true,
          lineStyle: { width: 3, color: "#34d399" },
          itemStyle: { color: "#34d399" },
          label: {
            show: true,
            position: "top",
            color: "#9ae6c7",
            fontSize: 10,
            formatter: ({ value }) => Number(value).toFixed(0),
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(52, 211, 153, 0.28)" },
                { offset: 1, color: "rgba(52, 211, 153, 0.02)" },
              ],
            },
          },
        },
      ],
    }),
    [labels, values]
  );

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      opts={{ renderer: "svg" }}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
      style={{ width: "100%", height: REQUEST_TREND_HEIGHT }}
    />
  );
}

function AlbumByMonthChart({ items }) {
  const useWideBars = items.length <= 3;

  const option = useMemo(
    () => ({
      animationDuration: 350,
      animationEasing: "cubicOut",
      grid: { top: 20, right: 12, bottom: 34, left: 34 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(16, 16, 16, 0.95)",
        borderColor: "rgba(255,255,255,0.12)",
        textStyle: { color: "#e5e7eb" },
      },
      xAxis: {
        type: "category",
        data: items.map((item) => item.label),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
        axisLabel: { color: "rgba(255,255,255,0.58)", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "rgba(255,255,255,0.5)",
          fontSize: 11,
          formatter: (value) => Number(value).toFixed(0),
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)", type: "dashed" } },
      },
      series: [
        {
          type: "bar",
          data: items.map((item) => item.value),
          barWidth: useWideBars ? "42%" : undefined,
          barMaxWidth: useWideBars ? 72 : 28,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#67e8f9" },
                { offset: 1, color: "#34d399" },
              ],
            },
          },
          label: {
            show: true,
            position: "top",
            color: "rgba(255,255,255,0.72)",
            fontSize: 11,
            formatter: ({ value }) => Number(value).toFixed(0),
          },
        },
      ],
    }),
    [items, useWideBars]
  );

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      opts={{ renderer: "svg" }}
      className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
      style={{ width: "100%", height: ALBUM_BY_MONTH_HEIGHT }}
    />
  );
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState({
    song_status: [],
    weekly_top: [],
    genre_status: [],
    user_distribution: {
      role: { USER: 0, ARTIST: 0, ADMIN: 0 },
      activity: { active: 0, inactive: 0 },
    },
    artist_request_trend: [],
    album_by_month: [],
  });

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const timezone =
        Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || "Asia/Ho_Chi_Minh";

      const [overviewRes, chartsRes] = await Promise.all([
        getAdminOverview({ limit: 10 }),
        getReportCharts({
          tz: timezone,
          bucket: "day",
          include: CHART_INCLUDE,
        }),
      ]);

      const overviewPayload = extractData(overviewRes) ?? {};
      const resolvedOverview =
        overviewPayload?.overview ?? overviewPayload?.data?.overview ?? overviewPayload ?? null;
      setOverview(resolvedOverview);

      const chartPayload = extractData(chartsRes) ?? {};
      setCharts({
        song_status: Array.isArray(chartPayload.song_status) ? chartPayload.song_status : [],
        weekly_top: Array.isArray(chartPayload.weekly_top) ? chartPayload.weekly_top : [],
        genre_status: Array.isArray(chartPayload.genre_status) ? chartPayload.genre_status : [],
        user_distribution: {
          role: {
            USER: safeNumber(chartPayload?.user_distribution?.role?.USER),
            ARTIST: safeNumber(chartPayload?.user_distribution?.role?.ARTIST),
            ADMIN: safeNumber(chartPayload?.user_distribution?.role?.ADMIN),
          },
          activity: {
            active: safeNumber(chartPayload?.user_distribution?.activity?.active),
            inactive: safeNumber(chartPayload?.user_distribution?.activity?.inactive),
          },
        },
        artist_request_trend: Array.isArray(chartPayload.artist_request_trend)
          ? chartPayload.artist_request_trend
          : [],
        album_by_month: Array.isArray(chartPayload.album_by_month)
          ? chartPayload.album_by_month
          : [],
      });

      setErrorMessage("");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Load admin analytics failed", error);
      setErrorMessage("Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const songStatusSummary = useMemo(() => {
    const overviewStats = overview?.songsByStatus;
    if (overviewStats && typeof overviewStats === "object") {
      const pending = safeNumber(overviewStats.pending);
      const approved = safeNumber(overviewStats.approved);
      const rejected = safeNumber(overviewStats.rejected);
      const overviewTotal = safeNumber(overview?.songs);
      const knownTotal = pending + approved + rejected;
      const other = Math.max(0, overviewTotal - knownTotal);

      const segments = [
        { label: "Chờ duyệt", value: pending, color: "#fbbf24" },
        { label: "Đã duyệt", value: approved, color: "#34d399" },
        { label: "Từ chối", value: rejected, color: "#fb7185" },
        { label: "Khác", value: other, color: "#a78bfa" },
      ].filter((item) => item.value > 0);

      const total =
        overviewTotal > 0
          ? overviewTotal
          : segments.reduce((sum, item) => sum + item.value, 0);
      return { segments, total };
    }

    const accumulator = { pending: 0, approved: 0, rejected: 0, other: 0 };

    charts.song_status.forEach((item) => {
      const key = `${item?.key || "other"}`.toLowerCase();
      const value = safeNumber(item?.value);
      if (key === "pending") accumulator.pending += value;
      else if (key === "approved") accumulator.approved += value;
      else if (key === "rejected") accumulator.rejected += value;
      else accumulator.other += value;
    });

    const segments = [
      { label: "Chờ duyệt", value: accumulator.pending, color: "#fbbf24" },
      { label: "Đã duyệt", value: accumulator.approved, color: "#34d399" },
      { label: "Từ chối", value: accumulator.rejected, color: "#fb7185" },
      { label: "Khác", value: accumulator.other, color: "#a78bfa" },
    ].filter((item) => item.value > 0);

    const total = segments.reduce((sum, item) => sum + item.value, 0);
    return { segments, total };
  }, [charts.song_status, overview]);

  const weeklyRanking = useMemo(() => {
    return charts.weekly_top.slice(0, 8).map((song, index, array) => {
      const score = safeNumber(song?.score) || array.length - index;
      return {
        label: song?.title || `Bài hát #${index + 1}`,
        artist: getArtistLabel(song, song?.artist_name || "") || "Nghệ sĩ",
        value: score,
      };
    });
  }, [charts.weekly_top]);

  const genreStatusRows = useMemo(() => {
    return charts.genre_status
      .map((row) => ({
        name: row?.genre || "Khác",
        pending: safeNumber(row?.pending),
        approved: safeNumber(row?.approved),
        rejected: safeNumber(row?.rejected),
        total: safeNumber(row?.total),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [charts.genre_status]);

  const roleSummary = useMemo(() => {
    const role = charts.user_distribution?.role || {};
    const activity = charts.user_distribution?.activity || {};
    const counts = {
      user: safeNumber(role.USER),
      artist: safeNumber(role.ARTIST),
      admin: safeNumber(role.ADMIN),
      active: safeNumber(activity.active),
      inactive: safeNumber(activity.inactive),
    };
    const total = counts.user + counts.artist + counts.admin;
    return { counts, total };
  }, [charts.user_distribution]);

  const requestTrend = useMemo(() => {
    const list = charts.artist_request_trend.map((item) => ({
      key: item?.date || "",
      value: safeNumber(item?.count),
    }));
    return {
      labels: list.map((item) =>
        /^\d{4}-\d{2}-\d{2}$/.test(item.key) ? formatDayLabel(item.key) : item.key
      ),
      values: list.map((item) => item.value),
      total: list.reduce((sum, item) => sum + item.value, 0),
    };
  }, [charts.artist_request_trend]);

  const albumByMonth = useMemo(() => {
    return charts.album_by_month.map((item) => ({
      key: item?.month || "",
      label: formatMonthLabel(item?.month || ""),
      value: safeNumber(item?.count),
    }));
  }, [charts.album_by_month]);

  const overviewKpi = useMemo(() => {
    const totalSongFromStatus = songStatusSummary.total;
    const totalAlbumFromTrend = albumByMonth.reduce((sum, item) => sum + item.value, 0);
    const totalUsersFromRole = roleSummary.total;

    return [
      {
        key: "users",
        label: "Người dùng",
        value: safeNumber(overview?.users ?? totalUsersFromRole),
        icon: FiUsers,
      },
      {
        key: "artists",
        label: "Nghệ sĩ",
        value: safeNumber(overview?.artists ?? roleSummary.counts.artist),
        icon: FiUserCheck,
      },
      {
        key: "albums",
        label: "Album",
        value: safeNumber(overview?.albums ?? totalAlbumFromTrend),
        icon: FiDisc,
      },
      {
        key: "songs",
        label: "Bài hát",
        value: safeNumber(overview?.songs ?? totalSongFromStatus),
        icon: FiMusic,
      },
    ];
  }, [albumByMonth, overview, roleSummary, songStatusSummary.total]);

  return (
    <div className="admin-page-shell min-h-screen w-full max-w-full min-w-0 space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Quản trị</p>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-white/60">
            Dữ liệu biểu đồ được tổng hợp trực tiếp từ backend để bảo đảm đồng bộ.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50">
            {lastUpdated
              ? `Cập nhật lúc ${lastUpdated.toLocaleTimeString("vi-VN")}`
              : "Chưa cập nhật"}
          </span>
          <button
            type="button"
            onClick={loadAnalytics}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition md:hover:border-white/30 md:hover:bg-white/10"
          >
            <FiRefreshCw />
            Làm mới
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="admin-alert rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="grid w-full min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewKpi.map((item) => (
          <article
            key={item.key}
            data-card
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between text-white/60">
              <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
              <item.icon />
            </div>
            {loading ? (
              <div className="ui-skeleton mt-3 h-9 w-20 rounded-full bg-white/8" />
            ) : (
              <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
            )}
          </article>
        ))}
      </div>

      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Trạng thái bài hát"
          subtitle="Tỷ trọng trạng thái duyệt bài hát"
          icon={FiBarChart2}
        >
          {loading ? (
            <ChartLoadingState height={SONG_STATUS_HEIGHT} bars={5} />
          ) : songStatusSummary.total === 0 ? (
            <p className="text-sm text-white/60">Không có dữ liệu trạng thái bài hát.</p>
          ) : (
            <SongStatusBreakdown
              segments={songStatusSummary.segments}
              total={songStatusSummary.total}
              height={SONG_STATUS_HEIGHT}
            />
          )}
        </ChartPanel>

        <ChartPanel
          title="Top tuần"
          subtitle="Biểu đồ top bài hát trong tuần"
          icon={FiTrendingUp}
        >
          {loading ? (
            <ChartLoadingState height={WEEKLY_TOP_HEIGHT} bars={5} />
          ) : weeklyRanking.length === 0 ? (
            <p className="text-sm text-white/60">Chưa có dữ liệu top bài hát tuần.</p>
          ) : (
            <WeeklyTopChart items={weeklyRanking} />
          )}
        </ChartPanel>
      </div>

      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Thể loại x Trạng thái"
          subtitle="Top thể loại và tình trạng duyệt"
          icon={FiMusic}
        >
          {loading ? (
            <ChartLoadingState height={GENRE_STATUS_HEIGHT} bars={5} />
          ) : genreStatusRows.length === 0 ? (
            <p className="text-sm text-white/60">Không có dữ liệu thể loại bài hát.</p>
          ) : (
            <GenreStatusChart rows={genreStatusRows} />
          )}
        </ChartPanel>

        <ChartPanel
          title="Phân bố người dùng"
          subtitle="Phân bố vai trò và trạng thái người dùng"
          icon={FiUsers}
        >
          {loading ? (
            <ChartLoadingState height={ROLE_DISTRIBUTION_HEIGHT} bars={3} compact />
          ) : roleSummary.total === 0 ? (
            <p className="text-sm text-white/60">Không có dữ liệu người dùng.</p>
          ) : (
            <div className="space-y-4">
              <RoleDistributionChart counts={roleSummary.counts} total={roleSummary.total} />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">Hoạt động</p>
                  <p className="mt-1 text-xl font-bold text-emerald-300">
                    {roleSummary.counts.active}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                    Không hoạt động
                  </p>
                  <p className="mt-1 text-xl font-bold text-rose-300">
                    {roleSummary.counts.inactive}
                  </p>
                </div>
              </div>
            </div>
          )}
        </ChartPanel>
      </div>

      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-12">
        <ChartPanel
          className="xl:col-span-8 2xl:col-span-9"
          title="Xu hướng yêu cầu nghệ sĩ"
          subtitle="Số yêu cầu nâng cấp nghệ sĩ theo 14 ngày gần nhất"
          icon={FiClock}
          right={
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              Tổng {requestTrend.total}
            </span>
          }
        >
          {loading ? (
            <ChartLoadingState height={REQUEST_TREND_HEIGHT} bars={6} />
          ) : requestTrend.values.length === 0 ? (
            <p className="text-sm text-white/60">Chưa có dữ liệu yêu cầu nghệ sĩ.</p>
          ) : requestTrend.total === 0 ? (
            <p className="text-sm text-white/60">14 ngày gần nhất không có yêu cầu nào.</p>
          ) : (
            <LineChart labels={requestTrend.labels} values={requestTrend.values} />
          )}
        </ChartPanel>

        <ChartPanel
          className="xl:col-span-4 2xl:col-span-3"
          title="Album theo tháng"
          subtitle="Số album phát hành theo tháng"
          icon={FiDisc}
        >
          {loading ? (
            <ChartLoadingState height={ALBUM_BY_MONTH_HEIGHT} bars={4} compact />
          ) : albumByMonth.length === 0 ? (
            <p className="text-sm text-white/60">Chưa có dữ liệu album theo tháng.</p>
          ) : (
            <AlbumByMonthChart items={albumByMonth} />
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
