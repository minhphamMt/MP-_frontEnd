import { useEffect, useState } from "react";
import { getNewReleaseChart } from "../api/chart.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

export default function NewRelease() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = async () => {
    try {
            setLoading(true);
      const res = await getNewReleaseChart();
      const rawSongs =
        res?.data?.data?.songs ||
        res?.data?.data ||
        res?.data?.items ||
        res?.data ||
        [];

      setSongs(filterPlayableSongs(rawSongs));
    } catch (err) {
      console.error("Load new release chart failed", err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  return (
   <div className="min-h-screen bg-[#121212] px-4 py-6 sm:px-8">
      {/* PAGE HEADER */}
      <div className="mb-6 rounded-3xl border border-white/5 bg-[#181818] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Bảng xếp hạng
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          BXH Nhạc Mới
        </h1>
        <p className="mt-2 text-sm text-white/60">
          Những ca khúc phát hành gần đây
        </p>
      </div>

      {/* SONG TABLE */}
      <SongTable
        title="BXH Nhạc Mới"
        subtitle="Những ca khúc phát hành gần đây"
        songs={songs}
        loading={loading}
        onRefresh={loadChart}
      />
    </div>
  );
}