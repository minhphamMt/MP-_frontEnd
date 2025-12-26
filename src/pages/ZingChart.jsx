import { useEffect, useState } from "react";
import { getZingChart } from "../api/chart.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

export default function ZingChart() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = async () => {
    try {
      setLoading(true);
      const res = await getZingChart();
      const rawSongs =
        res?.data?.data?.songs || res?.data?.data || res?.data?.items || [];

      setSongs(filterPlayableSongs(rawSongs));
    } catch (err) {
      console.error("Load Zing Chart failed", err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  return (
    <SongTable
      title="#ZINGCHART"
      subtitle="Top bài hát được yêu thích nhất"
      songs={songs}
      loading={loading}
      onRefresh={loadChart}
    />
  );
}