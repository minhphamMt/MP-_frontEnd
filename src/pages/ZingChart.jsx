import { useEffect, useMemo, useState } from "react";
import { FaPlay, FaRegClock, FaSearch } from "react-icons/fa";
import {
  getNewReleaseChart,
  getTop100Chart,
  getZingChart,
} from "../api/chart.api";
import { formatDuration, filterPlayableSongs } from "../utils/song";
import usePlayerStore from "../store/player.store";
import SongTable from "../components/song/SongTable";

const POINTS_PER_LINE = 12;

const createTrendPoints = (playCount = 0, offset = 0) => {
  const safePlayCount = Number.isFinite(Number(playCount))
    ? Math.max(Number(playCount), 1000)
    : 1000;

  return Array.from({ length: POINTS_PER_LINE }, (_, idx) => {
    const phase = (idx + offset) * 0.8;
    const wave = Math.sin(phase) * 0.18 + Math.cos(phase * 0.6) * 0.08;
    const decay = 1 - idx * 0.015;
    return safePlayCount * (0.68 + wave) * decay;
  });
};

const buildPath = (values, width, height) => {
  if (!values.length) return "";

  const maxValue = Math.max(...values);
  const xStep = values.length > 1 ? width / (values.length - 1) : width;

  const points = values.map((value, idx) => {
    const x = Math.round(idx * xStep);
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
  const [newReleaseSongs, setNewReleaseSongs] = useState([]);
  const [top100Songs, setTop100Songs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNewRelease, setLoadingNewRelease] = useState(true);
  const [loadingTop100, setLoadingTop100] = useState(true);
  const { playSong } = usePlayerStore();

  const loadChart = async () => {
    try {
      setLoading(true);
      const res = await getZingChart();
      const rawSongs =
        res?.data?.data?.songs ||
        res?.data?.data?.items ||
        res?.data?.data ||
        res?.data ||
        [];

      setSongs(filterPlayableSongs(rawSongs));
    } catch (err) {
      console.error("Load Zing Chart failed", err);
      setSongs([]);
    } finally {
      setLoading(false);
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

  const highlighted = useMemo(() => songs.slice(0, 3), [songs]);
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
    const datasets = highlighted.map((song, index) => {
      const points = createTrendPoints(song.play_count ?? song.playCount, index);
      return {
        song,
        points,
        color: colors[index % colors.length],
        path: buildPath(points, 900, 240),
      };
    });

    if (!datasets.length) return [];

    const maxPoint = Math.max(...datasets.flatMap((d) => d.points), 1);

    return datasets.map((dataset) => ({
      ...dataset,
      maxPoint,
    }));
  }, [highlighted]);

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
            src={song.cover_url}
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#241540] via-[#1b0f33] to-[#0f0a22] p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_40%)]" />

        <div className="relative flex flex-wrap gap-4 items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 text-lg font-semibold uppercase tracking-tight">
              <span className="text-[#6fff8c]">#zingchart</span>
              <span className="px-2 py-1 text-xs rounded-full border border-white/15 text-white/70">
                Live
              </span>
            </div>
            <div className="text-sm text-white/60">Thứ Tư, 12/02/2025</div>
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

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-6">
          <div className="relative">
            <svg viewBox="0 0 960 280" className="w-full h-[280px]">
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
                {chartLines.map((line, idx) => {
                  const xStep = line.points.length > 1 ? 900 / (line.points.length - 1) : 0;
                  const maxPoint = Math.max(...line.points);

                  return line.points.map((value, i) => {
                    const x = Math.round(i * xStep);
                    const y = Math.round(240 - (value / (maxPoint || 1)) * (240 * 0.85));
                    return (
                      <circle
                        key={`${idx}-${i}`}
                        cx={x}
                        cy={Math.max(12, y)}
                        r={4}
                        fill="#0b071a"
                        stroke={line.color.main}
                        strokeWidth={2}
                      />
                    );
                  });
                })}
              </g>
            </svg>

            <div className="absolute bottom-4 left-4 flex gap-4 flex-wrap">
              {highlighted.map((song, idx) => (
                <div
                  key={song.id || idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div
                    className="w-8 h-8 rounded-md"
                    style={{ backgroundColor: colors[idx % colors.length].main, opacity: 0.8 }}
                  />
                  <div className="text-sm">
                    <div className="font-semibold">{song.title}</div>
                    <div className="text-white/60">{song.artist_name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="text-sm font-semibold text-white/80">BXH tuần</div>
              <div className="text-xs text-white/60">Cập nhật mỗi thứ 2</div>
            </div>
            <div className="space-y-1 overflow-y-auto max-h-[260px] pr-1">
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
                <div className="text-xs text-white/60">Bảng xếp hạng tuần</div>
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
                        src={song.cover_url}
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

      <div className="grid lg:grid-cols-2 gap-4">
        <SongTable
          title="Bài hát mới"
          subtitle="Những ca khúc vừa ra mắt trên bảng xếp hạng"
          songs={newReleaseSongs}
          loading={loadingNewRelease}
          onRefresh={loadNewRelease}
        />
        <SongTable
          title="Top 100"
          subtitle="Những ca khúc được nghe nhiều nhất"
          songs={top100Songs}
          loading={loadingTop100}
          onRefresh={loadTop100}
        />
      </div>
    </div>
  );
}