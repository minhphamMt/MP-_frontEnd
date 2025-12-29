import { useEffect, useState } from "react";
import { getTop100Chart } from "../api/chart.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

export default function Top100() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = async () => {
    try {
      setLoading(true);
      const res = await getTop100Chart();
      const rawSongs =
        res?.data?.data?.songs ||
        res?.data?.data ||
        res?.data?.items ||
        res?.data ||
        [];

      setSongs(filterPlayableSongs(rawSongs));
    } catch (err) {
      console.error("Load top 100 chart failed", err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1d3a] via-[#0c2144] to-[#08162e] px-4 py-6 sm:px-8">
      {/* PAGE HEADER */}
      <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Bảng xếp hạng
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-white">
          Top 100
        </h1>
        <p className="mt-2 text-sm text-white/60">
          100 bản nhạc nổi bật trong tuần
        </p>
      </div>

      {/* SONG TABLE */}
      <SongTable
        title="Top 100"
        subtitle="100 bản nhạc nổi bật trong tuần"
        songs={songs}
        loading={loading}
        onRefresh={loadChart}
      />
    </div>
  );
}
