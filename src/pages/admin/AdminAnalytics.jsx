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
import {
  getAdminOverview,
  listAdminSongs,
  listArtistRequests,
  listUsers,
} from "../../api/admin.api";
import { getAlbums } from "../../api/album.api";

const extractData = (payload) => payload?.data?.data ?? payload?.data ?? payload;

const extractList = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
};

const normalizeGenreValue = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) return genres.filter(Boolean);
  if (typeof genres === "string") {
    return genres
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const pad2 = (value) => String(value).padStart(2, "0");

const toLocalDateKey = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const toMonthKey = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}/.test(value)) {
    return value.slice(0, 7);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
};

const formatDayLabel = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [, month, day] = value.split("-");
    return `${day}-${month}`;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}`;
};

const formatMonthLabel = (value) => {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
};

const safeNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
};

function ChartPanel({ title, subtitle, icon: Icon, children, right }) {
  return (
    <section className="admin-glass rounded-3xl border border-white/10 bg-[#181818] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
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
      {children}
    </section>
  );
}

function DonutChart({ segments, total }) {
  const radius = 76;
  const size = 184;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {segments.map((segment) => {
            const length = total > 0 ? (segment.value / total) * circumference : 0;
            const circle = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Tổng</p>
          <p className="text-3xl font-black text-white">{total}</p>
        </div>
      </div>
      <div className="w-full space-y-2">
        {segments.map((segment) => {
          const percent = total > 0 ? ((segment.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div
              key={segment.label}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-white/80">{segment.label}</span>
              </div>
              <span className="text-white/65">
                {segment.value} ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChart({ labels, values }) {
  const width = 640;
  const height = 220;
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = labels.length > 1 ? (index / (labels.length - 1)) * (width - 40) + 20 : width / 2;
    const y = height - 24 - (value / max) * (height - 56);
    return `${x},${y}`;
  });

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[210px] w-full rounded-2xl border border-white/10 bg-[#141414]"
      >
        {[0, 1, 2, 3].map((line) => {
          const y = 22 + line * ((height - 46) / 3);
          return (
            <line
              key={line}
              x1="20"
              x2={width - 20}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 6"
            />
          );
        })}
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((value, index) => {
          const [x, y] = points[index].split(",").map(Number);
          return (
            <g key={`${labels[index]}-${index}`}>
              <circle cx={x} cy={y} r="4.5" fill="#34d399" />
              <text x={x} y={y - 10} fill="#9ae6c7" fontSize="10" textAnchor="middle">
                {value}
              </text>
            </g>
          );
        })}
      </svg>

      <div
        className="grid gap-1 text-center text-[11px] text-white/55"
        style={{ gridTemplateColumns: `repeat(${labels.length || 1}, minmax(0, 1fr))` }}
      >
        {labels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [overview, setOverview] = useState(null);
  const [weeklyTopSongs, setWeeklyTopSongs] = useState([]);
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [artistRequests, setArtistRequests] = useState([]);
  const [albums, setAlbums] = useState([]);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, songsRes, usersRes, requestsRes, albumsRes] = await Promise.all([
        getAdminOverview({ limit: 10 }),
        listAdminSongs({ page: 1, limit: 200 }),
        listUsers({ page: 1, limit: 200 }),
        listArtistRequests({ page: 1, limit: 200 }),
        getAlbums({ page: 1, limit: 200 }),
      ]);

      const overviewPayload = extractData(overviewRes) ?? {};
      const resolvedOverview =
        overviewPayload?.overview ?? overviewPayload?.data?.overview ?? overviewPayload;
      const resolvedTopSongs =
        overviewPayload?.weeklyTopSongs ?? overviewPayload?.data?.weeklyTopSongs ?? [];

      setOverview(resolvedOverview ?? null);
      setWeeklyTopSongs(Array.isArray(resolvedTopSongs) ? resolvedTopSongs : []);

      const songsPayload = extractData(songsRes) ?? [];
      setSongs(extractList(songsPayload, ["items", "songs"]));

      const usersPayload = extractData(usersRes) ?? [];
      setUsers(extractList(usersPayload, ["items", "users"]));

      const requestPayload = extractData(requestsRes) ?? [];
      setArtistRequests(extractList(requestPayload, ["items", "requests"]));

      const albumsPayload = extractData(albumsRes) ?? [];
      setAlbums(extractList(albumsPayload, ["items", "albums"]));

      setErrorMessage("");
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Load admin analytics failed", error);
      setErrorMessage("Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const songStatusSummary = useMemo(() => {
    const fallback = songs.reduce(
      (acc, song) => {
        const status = `${song?.status || ""}`.toLowerCase();
        if (status === "approved") acc.approved += 1;
        else if (status === "pending") acc.pending += 1;
        else if (status === "rejected" || status === "blocked") acc.rejected += 1;
        else acc.other += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, other: 0 }
    );

    const fromOverview = overview?.songsByStatus || {};
    const pending = safeNumber(fromOverview.pending ?? fallback.pending);
    const approved = safeNumber(fromOverview.approved ?? fallback.approved);
    const rejected =
      safeNumber(fromOverview.rejected ?? fallback.rejected) +
      safeNumber(fromOverview.blocked ?? 0);
    const other = safeNumber(fallback.other);

    const segments = [
      { label: "Chờ duyệt", value: pending, color: "#fbbf24" },
      { label: "Đã duyệt", value: approved, color: "#34d399" },
      { label: "Từ chối", value: rejected, color: "#fb7185" },
      { label: "Khác", value: other, color: "#a78bfa" },
    ].filter((item) => item.value > 0);

    const total = segments.reduce((sum, item) => sum + item.value, 0);
    return { segments, total };
  }, [overview, songs]);

  const weeklyRanking = useMemo(() => {
    const base = weeklyTopSongs.slice(0, 8).map((song, index, array) => {
      const value =
        safeNumber(
          song?.play_count ||
            song?.total_plays ||
            song?.score ||
            song?.views ||
            song?.points
        ) || array.length - index;
      return {
        label: song?.title || song?.name || `Bài hát #${index + 1}`,
        artist: song?.artist_name || song?.artist || "Nghệ sĩ",
        value,
      };
    });

    const max = Math.max(...base.map((item) => item.value), 1);
    return base.map((item) => ({
      ...item,
      percent: (item.value / max) * 100,
    }));
  }, [weeklyTopSongs]);

  const genreStatusRows = useMemo(() => {
    const map = new Map();
    songs.forEach((song) => {
      const genres = normalizeGenreValue(song?.genres);
      const names = genres.length ? genres : [song?.genre_name || "Khác"];
      const status = `${song?.status || ""}`.toLowerCase();
      names.forEach((name) => {
        const current = map.get(name) || {
          name,
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0,
        };
        if (status === "approved") current.approved += 1;
        else if (status === "pending") current.pending += 1;
        else current.rejected += 1;
        current.total += 1;
        map.set(name, current);
      });
    });

    return [...map.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [songs]);

  const roleSummary = useMemo(() => {
    const counts = users.reduce(
      (acc, user) => {
        const role = `${user?.role || "USER"}`.toUpperCase();
        if (role === "ADMIN") acc.admin += 1;
        else if (role === "ARTIST") acc.artist += 1;
        else acc.user += 1;
        if (user?.is_active) acc.active += 1;
        else acc.inactive += 1;
        return acc;
      },
      { admin: 0, artist: 0, user: 0, active: 0, inactive: 0 }
    );
    const total = counts.admin + counts.artist + counts.user;
    return { counts, total };
  }, [users]);

  const requestTrend = useMemo(() => {
    const days = 14;
    const now = new Date();
    const timeline = Array.from({ length: days }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - 1 - index));
      const key = toLocalDateKey(date);
      return {
        key,
        label: formatDayLabel(key),
        total: 0,
      };
    });
    const indexMap = new Map(timeline.map((item, index) => [item.key, index]));

    artistRequests.forEach((request) => {
      const raw = request?.created_at || request?.createdAt || request?.updated_at;
      if (!raw) return;
      const key = toLocalDateKey(raw);
      if (!key) return;
      const idx = indexMap.get(key);
      if (idx === undefined) return;
      timeline[idx].total += 1;
    });

    return {
      labels: timeline.map((item) => item.label),
      values: timeline.map((item) => item.total),
      total: timeline.reduce((sum, item) => sum + item.total, 0),
    };
  }, [artistRequests]);

  const albumByMonth = useMemo(() => {
    const months = 6;
    const now = new Date();
    const timeline = [];
    for (let i = months - 1; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      timeline.push({ key, label: formatMonthLabel(key), value: 0 });
    }
    const indexMap = new Map(timeline.map((item, index) => [item.key, index]));

    albums.forEach((album) => {
      if (!album?.release_date) return;
      const key = toMonthKey(album.release_date);
      if (!key) return;
      const idx = indexMap.get(key);
      if (idx === undefined) return;
      timeline[idx].value += 1;
    });

    const max = Math.max(...timeline.map((item) => item.value), 1);
    return timeline.map((item) => ({
      ...item,
      percent: (item.value / max) * 100,
    }));
  }, [albums]);

  const overviewKpi = useMemo(() => {
    return [
      {
        key: "users",
        label: "Người dùng",
        value: safeNumber(overview?.users ?? users.length),
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
        value: safeNumber(overview?.albums ?? albums.length),
        icon: FiDisc,
      },
      {
        key: "songs",
        label: "Bài hát",
        value: safeNumber(overview?.songs ?? songs.length),
        icon: FiMusic,
      },
    ];
  }, [albums.length, overview, roleSummary.counts.artist, songs.length, users.length]);

  return (
    <div className="admin-page-shell min-h-screen space-y-6 px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">Quản trị</p>
          <h1 className="text-3xl font-extrabold text-white">Thống kê hệ thống</h1>
          <p className="mt-1 text-sm text-white/60">
            Tổng hợp dữ liệu bài hát, người dùng, yêu cầu nghệ sĩ và album.
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewKpi.map((item) => (
          <article
            key={item.key}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between text-white/60">
              <span className="text-xs uppercase tracking-[0.2em]">{item.label}</span>
              <item.icon />
            </div>
            <p className="mt-3 text-3xl font-black text-white">{loading ? "..." : item.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Trạng thái bài hát"
          subtitle="Tỷ trọng trạng thái duyệt bài hát"
          icon={FiBarChart2}
        >
          {loading ? (
            <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
          ) : songStatusSummary.total === 0 ? (
            <p className="text-sm text-white/60">Không có dữ liệu trạng thái bài hát.</p>
          ) : (
            <DonutChart segments={songStatusSummary.segments} total={songStatusSummary.total} />
          )}
        </ChartPanel>

        <ChartPanel
          title="Top tuần"
          subtitle="Biểu đồ top bài hát trong tuần"
          icon={FiTrendingUp}
        >
          {loading ? (
            <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
          ) : weeklyRanking.length === 0 ? (
            <p className="text-sm text-white/60">Chưa có dữ liệu top bài hát tuần.</p>
          ) : (
            <div className="space-y-3">
              {weeklyRanking.map((item, index) => (
                <div key={`${item.label}-${index}`} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-white">
                        #{index + 1} {item.label}
                      </p>
                      <p className="truncate text-xs text-white/55">{item.artist}</p>
                    </div>
                    <span className="text-xs text-emerald-300">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartPanel
          title="Thể loại x Trạng thái"
          subtitle="Top thể loại và tình trạng duyệt"
          icon={FiMusic}
        >
          {loading ? (
            <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
          ) : genreStatusRows.length === 0 ? (
            <p className="text-sm text-white/60">Không có dữ liệu thể loại bài hát.</p>
          ) : (
            <div className="space-y-3">
              {genreStatusRows.map((row) => (
                <div key={row.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="truncate text-white">{row.name}</span>
                    <span className="text-xs text-white/55">{row.total}</span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="bg-amber-300"
                      style={{ width: `${(row.pending / row.total) * 100}%` }}
                    />
                    <span
                      className="bg-emerald-300"
                      style={{ width: `${(row.approved / row.total) * 100}%` }}
                    />
                    <span
                      className="bg-rose-300"
                      style={{ width: `${(row.rejected / row.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-white/60">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  Chờ duyệt
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  Đã duyệt
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-300" />
                  Từ chối
                </span>
              </div>
            </div>
          )}
        </ChartPanel>

        <ChartPanel
          title="Phân bố người dùng"
          subtitle="Phân bố vai trò và trạng thái người dùng"
          icon={FiUsers}
        >
          {loading ? (
            <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
          ) : roleSummary.total === 0 ? (
            <p className="text-sm text-white/60">Không có dữ liệu người dùng.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: "USER", value: roleSummary.counts.user, color: "#93c5fd" },
                { label: "ARTIST", value: roleSummary.counts.artist, color: "#34d399" },
                { label: "ADMIN", value: roleSummary.counts.admin, color: "#fbbf24" },
              ].map((item) => {
                const percent = (item.value / roleSummary.total) * 100;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/80">{item.label}</span>
                      <span className="text-white/60">
                        {item.value} ({percent.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <ChartPanel
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
            <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
          ) : requestTrend.total === 0 ? (
            <p className="text-sm text-white/60">14 ngày gần nhất không có yêu cầu nào.</p>
          ) : (
            <LineChart labels={requestTrend.labels} values={requestTrend.values} />
          )}
        </ChartPanel>

        <ChartPanel
          title="Album theo tháng"
          subtitle="Số album phát hành theo tháng"
          icon={FiDisc}
        >
          {loading ? (
            <p className="text-sm text-white/60">Đang tải dữ liệu...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex h-44 items-end justify-between gap-2 rounded-2xl border border-white/10 bg-[#141414] px-3 pb-3 pt-4">
                {albumByMonth.map((item) => (
                  <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="relative flex w-full items-end justify-center rounded-t-xl bg-white/5">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-cyan-400/90 to-emerald-300/90"
                        style={{ height: `${Math.max(item.percent, 4)}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-white/55">{item.value}</span>
                  </div>
                ))}
              </div>
              <div
                className="grid gap-2 text-[11px] text-white/55"
                style={{ gridTemplateColumns: `repeat(${albumByMonth.length || 1}, minmax(0, 1fr))` }}
              >
                {albumByMonth.map((item) => (
                  <span key={`label-${item.key}`} className="text-center">
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </ChartPanel>
      </div>
    </div>
  );
}
