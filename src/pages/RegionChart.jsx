import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRegionCharts } from "../api/chart.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs } from "../utils/song";

const REGION_CONFIG = {
  vietnam: { title: "BXH Việt Nam", subtitle: "Những ca khúc nổi bật tại Việt Nam" },
  usuk: { title: "BXH US-UK", subtitle: "Thị trường Âu Mỹ đình đám" },
  kpop: { title: "BXH K-Pop", subtitle: "Nhạc Hàn Quốc được yêu thích" },
};

export default function RegionChart() {
  const { region } = useParams();
  const navigate = useNavigate();
  const normalizedRegion = (region || "").toLowerCase();
  const config = useMemo(() => REGION_CONFIG[normalizedRegion], [normalizedRegion]);

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      const res = await getRegionCharts({ limit: 50 });
      const payload = res?.data?.data || res?.data || {};
      const list = payload[normalizedRegion] || [];

      setSongs(filterPlayableSongs(list));
    } catch (err) {
      console.error("Load region chart failed", err);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [config, normalizedRegion]);

  useEffect(() => {
    if (!config) {
      navigate("/zing-chart");
      return;
    }

    loadChart();
  }, [config, loadChart, navigate]);

  if (!config) return null;

  return (
    <SongTable
      title={config.title}
      subtitle={config.subtitle}
      songs={songs}
      loading={loading}
      onRefresh={loadChart}
    />
  );
}