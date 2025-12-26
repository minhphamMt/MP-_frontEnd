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
    <SongTable
      title="BXH Nhạc Mới"
      subtitle="Những ca khúc phát hành gần đây"
      songs={songs}
      loading={loading}
      onRefresh={loadChart}
    />
  );
}