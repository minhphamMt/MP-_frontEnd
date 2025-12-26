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
        res?.data?.data?.songs || res?.data?.data || res?.data?.items || [];

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
    <SongTable
      title="Top 100"
      subtitle="100 bản nhạc nổi bật trong tuần"
      songs={songs}
      loading={loading}
      onRefresh={loadChart}
    />
  );
}