import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRegionCharts } from "../api/chart.api";
import { getSongById } from "../api/song.api";
import SongTable from "../components/song/SongTable";
import { filterPlayableSongs, hydrateSongArtists } from "../utils/song";

const REGION_CONFIG = {
  vietnam: {
    title: "BXH Việt Nam",
    subtitle: "Những ca khúc nổi bật tại Việt Nam",
  },
  usuk: {
    title: "BXH US-UK",
    subtitle: "Thị trường Âu Mỹ đình đám",
  },
  kpop: {
    title: "BXH K-Pop",
    subtitle: "Nhạc Hàn Quốc được yêu thích",
  },
};

export default function RegionChart() {
  const { region } = useParams();
  const navigate = useNavigate();
  const normalizedRegion = (region || "").toLowerCase();
  const config = useMemo(
    () => REGION_CONFIG[normalizedRegion],
    [normalizedRegion]
  );

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      const res = await getRegionCharts({ limit: 50 });
      const payload = res?.data?.data || res?.data || {};
      const list = payload[normalizedRegion] || [];
      const playable = filterPlayableSongs(list);
      const hydrated = await hydrateSongArtists(playable, getSongById);

      setSongs(hydrated);
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
    <div className="user-page-shell min-h-screen px-4 py-6 sm:px-8">
      {/* PAGE HEADER */}
      <div className="user-surface mb-6 p-6">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/50">
          Bảng xếp hạng
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
          {config.title}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          {config.subtitle}
        </p>
      </div>

      {/* SONG TABLE */}
      <SongTable
        title={config.title}
        subtitle={config.subtitle}
        songs={songs}
        loading={loading}
        onRefresh={loadChart}
        hideActions
        hidePlayAll
      />
    </div>
  );
}
