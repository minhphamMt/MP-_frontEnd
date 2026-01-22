import { useEffect, useMemo, useState } from "react";
import {
  FiDisc,
  FiMusic,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { getAdminOverview } from "../../api/admin.api";

const overviewCards = [
  { key: "users", label: "Người dùng", icon: FiUsers },
  { key: "artists", label: "Nghệ sĩ", icon: FiUser },
  { key: "albums", label: "Album", icon: FiDisc },
  { key: "songs", label: "Bài hát", icon: FiMusic },
];

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [weeklyTopSongs, setWeeklyTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const res = await getAdminOverview({ limit: 5 });
        console.log(">>cehck res : ", res)
        const payload = res?.data?.data ?? res?.data ?? {};
        const resolvedOverview =
          payload.overview ?? payload.data?.overview ?? payload ?? null;
        const resolvedTopSongs =
          payload.weeklyTopSongs ?? payload.data?.weeklyTopSongs ?? [];

        setOverview(resolvedOverview);
        setWeeklyTopSongs(
          Array.isArray(resolvedTopSongs) ? resolvedTopSongs : []
        );
        setErrorMessage("");
      } catch (error) {
        console.error("Load admin overview failed", error);
        setErrorMessage("Không thể tải dữ liệu tổng quan.");
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const songStatus = useMemo(() => {
    const stats = overview?.songsByStatus || {};
    // console.log("check start: ",overview)
    return [
      { label: "Chờ duyệt", value: stats.pending ?? 0, tone: "text-amber-300" },
      {
        label: "Đã duyệt",
        value: stats.approved ?? 0,
        tone: "text-emerald-300",
      },
      { label: "Từ chối", value: stats.rejected ?? 0, tone: "text-rose-300" },
    ];
  }, [overview]);

  return (
    <div className="min-h-screen space-y-8 bg-[#121212] px-4 py-6 sm:px-8">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Quản trị
        </p>
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Tổng quan hệ thống
        </h1>
        <p className="text-sm text-white/60">
          Theo dõi nhanh tình trạng người dùng, nội dung và hiệu suất tuần.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-center justify-between text-white/60">
              <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
              <Icon />
            </div>
            <div className="mt-4 text-3xl font-black text-white">
              {loading ? "..." : overview?.[key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 text-white">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-300 to-violet-400" />
            <h2 className="text-xl font-bold">Trạng thái bài hát</h2>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {songStatus.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {item.label}
                </p>
                <p className={`mt-2 text-2xl font-bold ${item.tone}`}>
                  {loading ? "..." : item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#181818] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2 text-white">
            <FiTrendingUp />
            <h2 className="text-xl font-bold">Top bài hát tuần</h2>
          </div>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            {loading && <p>Đang tải dữ liệu...</p>}
            {!loading && weeklyTopSongs.length === 0 && (
              <p>Chưa có dữ liệu bảng xếp hạng.</p>
            )}
            {!loading &&
              weeklyTopSongs.map((song, index) => (
                <div
                  key={song.id || song.song_id || index}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-white">
                      {song.title || song.name || "Bài hát"}
                    </p>
                    <p className="text-xs text-white/60">
                      {song.artist_name || song.artist || "Nghệ sĩ"}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300">
                    #{index + 1}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}