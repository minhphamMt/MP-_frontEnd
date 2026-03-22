import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowUpRight,
  FiClock,
  FiDisc,
  FiHeadphones,
  FiPlus,
  FiUser,
} from "react-icons/fi";
import * as echarts from "echarts/core";
import { PieChart, BarChart, LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import ReactEChartsCore from "echarts-for-react/lib/core";
import useAuthStore from "../../store/auth.store";
import { getAlbums } from "../../api/album.api";
import { getArtistSongs } from "../../api/song.api";
import ChartLoadingState from "../../components/charts/ChartLoadingState";
import ArtistAlbumTile from "../../components/artist/ArtistAlbumTile";
import { getMyArtistProfile } from "../../api/artist.api";

echarts.use([
  GridComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  BarChart,
  LineChart,
  SVGRenderer,
]);

const STATUS_STYLE = {
  approved: { label: "Đã duyệt", color: "#7dd3fc" },
  pending: { label: "Chờ duyệt", color: "#fbbf24" },
  rejected: { label: "Từ chối", color: "#fb7185" },
  draft: { label: "Nháp", color: "#94a3b8" },
  blocked: { label: "Bị chặn", color: "#ef4444" },
  other: { label: "Khác", color: "#a78bfa" },
};

const safeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeStatus = (value) => `${value ?? ""}`.trim().toLowerCase();

const isTruthyFlag = (value) => {
  if (value === true || value === 1) return true;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }
  return false;
};

const APPROVED_SONG_STATUS = new Set([
  "approved",
]);

const PUBLISHED_ALBUM_STATUS = new Set([
  "approved",
  "published",
  "release",
  "released",
  "public",
  "active",
]);

const SONG_RELEASE_DATE_KEYS = ["release_date", "releaseDate"];
const SONG_CREATED_DATE_KEYS = [
  "approved_at",
  "approval_date",
  "created_at",
  "createdAt",
  "updated_at",
  "updatedAt",
];

const ALBUM_PUBLISHED_DATE_KEYS = [
  "release_date",
  "releaseDate",
  "published_at",
  "publishedAt",
  "released_at",
  "releasedAt",
  "publish_date",
  "publishDate",
];

const isAlbumPublished = (album) => {
  const status = normalizeStatus(album?.status);
  if (PUBLISHED_ALBUM_STATUS.has(status)) return true;

  if (isTruthyFlag(album?.is_published) || isTruthyFlag(album?.is_public)) return true;

  const releaseDate = pickDate(album, ALBUM_PUBLISHED_DATE_KEYS);
  if (!releaseDate) return false;

  return releaseDate.getTime() <= Date.now();
};

const isSongApproved = (song) => {
  const status = normalizeStatus(song?.status);
  return APPROVED_SONG_STATUS.has(status);
};

const getSongPublishedDate = (song) => {
  const releaseDate = pickDate(song, SONG_RELEASE_DATE_KEYS);
  if (releaseDate) {
    if (releaseDate.getTime() > Date.now()) return null;
    return releaseDate;
  }

  return pickDate(song, SONG_CREATED_DATE_KEYS);
};

const toMonthKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const getLastMonthKeys = (count = 6) => {
  const now = new Date();
  const keys = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(toMonthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return keys;
};

const formatMonthLabel = (monthKey) => {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) return monthKey || "";
  const [year, month] = monthKey.split("-");
  return `${month}/${year}`;
};

const pickDate = (item, keys) => {
  for (const key of keys) {
    const raw = item?.[key];
    if (!raw) continue;
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

function ChartCard({ title, children }) {
  return (
    <article data-card className="artist-soft-card p-4">
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/55">{title}</p>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function MiniChart({ option, height = "clamp(180px, 28vw, 220px)" }) {
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      notMerge
      lazyUpdate
      opts={{ renderer: "svg" }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-black/25"
      style={{ width: "100%", height }}
    />
  );
}

export default function ArtistDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [albums, setAlbums] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [artistProfile, setArtistProfile] = useState(user?.artist ?? null);

  const artistId = artistProfile?.id ?? user?.artist_id ?? null;
  const artistName =
    artistProfile?.name || user?.display_name || user?.name || user?.email || "Nghệ sĩ";

  useEffect(() => {
    const loadArtistProfile = async () => {
      if (artistProfile?.id || user?.artist_id) return;
      try {
        const res = await getMyArtistProfile();
        const artist = res?.data?.data ?? res?.data ?? null;
        if (artist) {
          setArtistProfile(artist);
          if (user) {
            updateUser({
              ...user,
              artist,
            });
          }
        }
      } catch (error) {
        console.error("Load artist profile failed", error);
      }
    };

    loadArtistProfile();
  }, [artistProfile?.id, updateUser, user, user?.artist_id]);

  const loadDashboardData = useCallback(async () => {
    if (!artistId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [albumsRes, songsRes] = await Promise.all([
        getAlbums({ artist_id: artistId, limit: 100 }),
        getArtistSongs(artistId),
      ]);

      const albumData = albumsRes?.data?.data || [];
      setAlbums(Array.isArray(albumData) ? albumData : []);

      const payload = songsRes?.data?.data || songsRes?.data || {};
      const list = payload?.songs || payload?.data || payload || [];
      setSongs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Load artist dashboard failed", error);
      setAlbums([]);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const stats = useMemo(() => {
    const totalAlbums = albums.length;
    const totalSongs = songs.length;
    const pendingSongs = songs.filter((song) => song?.status === "pending").length;
    const newestAlbum = albums[0]?.title || "Chưa có album";

    return { totalAlbums, totalSongs, pendingSongs, newestAlbum };
  }, [albums, songs]);

  const songStatusData = useMemo(() => {
    const counts = { approved: 0, pending: 0, rejected: 0, draft: 0, blocked: 0, other: 0 };
    songs.forEach((song) => {
      const key = `${song?.status || "other"}`.toLowerCase();
      if (counts[key] !== undefined) counts[key] += 1;
      else counts.other += 1;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: STATUS_STYLE[key]?.label || STATUS_STYLE.other.label,
        value,
        color: STATUS_STYLE[key]?.color || STATUS_STYLE.other.color,
      }));
  }, [songs]);

  const albumStatusData = useMemo(() => {
    const published = albums.filter((album) => isAlbumPublished(album)).length;
    const unpublished = Math.max(0, albums.length - published);

    return [
      { name: "Đã phát hành", value: published, color: "#7dd3fc" },
      { name: "Chưa phát hành", value: unpublished, color: "#fbbf24" },
    ].filter((item) => item.value > 0);
  }, [albums]);

  const songTimeline = useMemo(() => {
    const months = getLastMonthKeys(6);
    const map = new Map(months.map((key) => [key, 0]));

    songs.forEach((song) => {
      if (!isSongApproved(song)) return;
      const date = getSongPublishedDate(song);
      if (!date) return;
      const key = toMonthKey(date);
      if (map.has(key)) map.set(key, safeNumber(map.get(key)) + 1);
    });

    return months.map((key) => ({ key, label: formatMonthLabel(key), value: safeNumber(map.get(key)) }));
  }, [songs]);

  const releaseTypeData = useMemo(() => {
    const inAlbum = songs.filter(
      (song) =>
        song?.album_id || song?.albumId || song?.album?.id || song?.album_title || song?.albumTitle
    ).length;
    const single = Math.max(0, songs.length - inAlbum);

    return [
      { name: "Single", value: single, color: "#67e8f9" },
      { name: "Trong album", value: inAlbum, color: "#60a5fa" },
    ];
  }, [songs]);

  const songStatusOption = useMemo(
    () => ({
      animationDuration: 300,
      tooltip: { trigger: "item" },
      legend: {
        bottom: 0,
        textStyle: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "70%"],
          center: ["50%", "42%"],
          label: { show: false },
          labelLine: { show: false },
          data: songStatusData.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    [songStatusData]
  );

  const albumStatusOption = useMemo(
    () => ({
      animationDuration: 300,
      tooltip: { trigger: "item" },
      legend: {
        bottom: 0,
        textStyle: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "70%"],
          center: ["50%", "42%"],
          label: { show: false },
          labelLine: { show: false },
          data: albumStatusData.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    [albumStatusData]
  );

  const songTimelineOption = useMemo(
    () => ({
      animationDuration: 300,
      grid: { top: 14, right: 8, bottom: 22, left: 30 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: songTimeline.map((item) => item.label),
        boundaryGap: false,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.55)", fontSize: 10 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)", type: "dashed" } },
      },
      series: [
        {
          type: "line",
          smooth: 0.3,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2, color: "#67e8f9" },
          itemStyle: { color: "#67e8f9" },
          data: songTimeline.map((item) => item.value),
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(103,232,249,0.28)" },
                { offset: 1, color: "rgba(103,232,249,0.02)" },
              ],
            },
          },
        },
      ],
    }),
    [songTimeline]
  );

  const releaseTypeOption = useMemo(
    () => ({
      animationDuration: 300,
      grid: { top: 14, right: 8, bottom: 22, left: 20 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        type: "category",
        data: releaseTypeData.map((item) => item.name),
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.15)" } },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10 },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.08)", type: "dashed" } },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 28,
          data: releaseTypeData.map((item) => ({
            value: item.value,
            itemStyle: {
              color: item.color,
              borderRadius: [8, 8, 0, 0],
            },
          })),
          label: {
            show: true,
            position: "top",
            color: "rgba(255,255,255,0.75)",
            fontSize: 11,
            formatter: ({ value }) => Number(value).toFixed(0),
          },
        },
      ],
    }),
    [releaseTypeData]
  );

  const latestAlbums = albums.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="artist-page-shell artist-glass overflow-hidden p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="artist-label">Artist Workspace</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Xin chào, {artistName}</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/70">
              Theo dõi hiệu suất phát hành, quản lý album và bài hát trong một giao diện thống nhất.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/artist/albums/new")}
                className="artist-btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <FiPlus />
                Tạo album mới
              </button>
              <button
                type="button"
                onClick={() => navigate("/artist/songs/new")}
                className="artist-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <FiHeadphones />
                Thêm bài hát
              </button>
              <button
                type="button"
                onClick={() => navigate("/artist/profile")}
                className="artist-btn-secondary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <FiUser />
                Cập nhật hồ sơ
              </button>
            </div>
          </div>

          <div className="artist-soft-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Album mới nhất</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{stats.newestAlbum}</h3>
            <p className="mt-2 text-sm text-white/60">
              Duy trì lịch phát hành ổn định để tăng độ phủ và lượt nghe.
            </p>
            <button
              type="button"
              onClick={() => navigate("/artist/albums")}
              className="artist-btn-secondary mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              Đi tới quản lý album
              <FiArrowUpRight />
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article data-card className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Tổng album</p>
          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{stats.totalAlbums}</h3>
            <span className="rounded-xl bg-sky-400/18 p-3 text-sky-100">
              <FiDisc className="text-lg" />
            </span>
          </div>
        </article>
        <article data-card className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Tổng bài hát</p>
          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{stats.totalSongs}</h3>
            <span className="rounded-xl bg-blue-400/18 p-3 text-blue-100">
              <FiHeadphones className="text-lg" />
            </span>
          </div>
        </article>
        <article data-card className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Chờ duyệt</p>
          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-white">{stats.pendingSongs}</h3>
            <span className="rounded-xl bg-amber-400/20 p-3 text-amber-100">
              <FiClock className="text-lg" />
            </span>
          </div>
        </article>
        <article data-card className="artist-kpi p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Hành động nhanh</p>
          <button
            type="button"
            onClick={() => navigate("/artist/songs")}
            className="artist-btn-secondary mt-3 inline-flex w-full items-center justify-center gap-2 px-4 py-2 text-sm"
          >
            Quản lý bài hát
            <FiArrowUpRight />
          </button>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Trạng thái bài hát">
          {loading ? (
            <ChartLoadingState height="clamp(180px, 28vw, 220px)" bars={4} compact tone="artist" />
          ) : (
            <MiniChart option={songStatusOption} />
          )}
        </ChartCard>

        <ChartCard title="Trạng thái album">
          {loading ? (
            <ChartLoadingState height="clamp(180px, 28vw, 220px)" bars={4} compact tone="artist" />
          ) : (
            <MiniChart option={albumStatusOption} />
          )}
        </ChartCard>

        <ChartCard title="Bài hát mới theo tháng">
          {loading ? (
            <ChartLoadingState height="clamp(180px, 28vw, 220px)" bars={5} tone="artist" />
          ) : (
            <MiniChart option={songTimelineOption} />
          )}
        </ChartCard>

        <ChartCard title="Single và bài trong album">
          {loading ? (
            <ChartLoadingState height="clamp(180px, 28vw, 220px)" bars={4} compact tone="artist" />
          ) : (
            <MiniChart option={releaseTypeOption} />
          )}
        </ChartCard>
      </section>

      <section className="artist-page-shell artist-glass p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="artist-label">Recent Albums</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Phát hành gần đây</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/artist/albums")}
            className="artist-btn-secondary inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            Xem tất cả
            <FiArrowUpRight />
          </button>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`artist-album-skeleton-${index}`}
                className="artist-soft-card overflow-hidden p-4"
              >
                <div className="ui-skeleton aspect-square w-full rounded-[24px] bg-white/8" />
                <div className="mt-4 space-y-3">
                  <div className="ui-skeleton h-4 w-2/3 rounded-full bg-white/8" />
                  <div className="ui-skeleton h-3 w-1/2 rounded-full bg-white/8" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !latestAlbums.length && (
          <div className="artist-soft-card p-5 text-sm text-white/70">
            Bạn chưa có album nào. Hãy tạo album đầu tiên để bắt đầu phát hành.
          </div>
        )}

        {!loading && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestAlbums.map((album) => (
              <ArtistAlbumTile
                key={album.id}
                album={album}
                onView={() => navigate(`/artist/albums/${album.id}`)}
                onEdit={() => navigate(`/artist/albums/${album.id}/edit`)}
                onDelete={() => navigate(`/artist/albums/${album.id}/edit`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
